package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.controller.request.DebugRequest;
import com.anita.multipleauthapi.controller.request.LanguageType;
import com.anita.multipleauthapi.controller.request.SubmissionRequest;
import com.anita.multipleauthapi.model.entity.QuestionEntity;
import com.anita.multipleauthapi.model.entity.SubmissionEntity;
import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.payload.DebugResponse;
import com.anita.multipleauthapi.model.payload.SubmissionResponse;
import com.anita.multipleauthapi.model.TestCase;
import com.anita.multipleauthapi.repository.QuestionRepository;
import com.anita.multipleauthapi.repository.SubmissionRepository;
import com.anita.multipleauthapi.repository.UserRepository;
import com.anita.multipleauthapi.security.UserPrincipal;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final DockerService dockerService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ObjectMapper objectMapper;
    
    private static final int DEFAULT_TIMEOUT_SECONDS = 10;
    private static final int DEBUG_TIMEOUT_SECONDS = 15;

    /**
     * Debug code without saving to database
     * 
     * @param debugRequest Debug request containing code and language
     * @return Debug response with execution results
     */
    public DebugResponse debugCode(DebugRequest debugRequest) {
        try {
            log.info("Debugging code with language: {}", debugRequest.getLanguage());
            log.info("Input data provided: '{}'", debugRequest.getInputData());
            log.info("Code to execute: {}", debugRequest.getCode());
            
            // Execute code using Docker
            DockerService.ExecutionResult executionResult = dockerService.executeCode(
                    debugRequest.getLanguage(),
                    debugRequest.getCode(),
                    debugRequest.getInitialCode(), // Initial code (SQL schema, etc)
                    debugRequest.getInputData(), // Input data for programs using input() function
                    DEBUG_TIMEOUT_SECONDS
            );
            
            log.info("Execution completed - stdout: '{}', stderr: '{}'", executionResult.getStdout(), executionResult.getStderr());
            
            // Create debug response
            return DebugResponse.builder()
                    .output(executionResult.getStdout())
                    .error(executionResult.getStderr())
                    .executionTime(executionResult.getExecutionTime())
                    .exitCode(executionResult.getExitCode())
                    .timedOut(executionResult.getTimedOut())
                    .successful(executionResult.getExitCode() == 0)
                    .language(debugRequest.getLanguage())
                    .build();
            
        } catch (Exception e) {
            log.error("Error debugging code: {}", e.getMessage(), e);
            
            // Create and return error response
            return DebugResponse.builder()
                    .output("")
                    .error("Error debugging code: " + e.getMessage())
                    .executionTime(0L)
                    .exitCode(-1)
                    .timedOut(false)
                    .successful(false)
                    .language(debugRequest.getLanguage())
                    .build();
        }
    }
    
    /**
     * Debug code for a specific question without submitting
     * 
     * @param questionId ID of the question to debug
     * @param userCode User code to debug
     * @param language Language of the code
     * @return Debug response with execution results
     */
    public DebugResponse debugQuestionCode(UUID questionId, String userCode, LanguageType language) {
        try {
            // Get the question
            QuestionEntity question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new EntityNotFoundException("Question not found with ID: " + questionId));
            
            // Check if the language matches the expected language
            if (question.getLanguage() != language) {
                throw new IllegalArgumentException("The submitted code language does not match the question language");
            }
            
            // Execute code using Docker
            DockerService.ExecutionResult executionResult = dockerService.executeCode(
                    language,
                    userCode,
                    question.getInitialCode(), // Initial code (SQL schema, etc)
                    question.getInputData(), // Input data for programs using input() function
                    DEBUG_TIMEOUT_SECONDS
            );
            
            // Create debug response
            return DebugResponse.builder()
                    .output(executionResult.getStdout())
                    .error(executionResult.getStderr())
                    .executionTime(executionResult.getExecutionTime())
                    .exitCode(executionResult.getExitCode())
                    .timedOut(executionResult.getTimedOut())
                    .successful(executionResult.getExitCode() == 0)
                    .language(language)
                    .build();
            
        } catch (Exception e) {
            log.error("Error debugging question code: {}", e.getMessage(), e);
            
            // Create and return error response
            return DebugResponse.builder()
                    .output("")
                    .error("Error debugging code: " + e.getMessage())
                    .executionTime(0L)
                    .exitCode(-1)
                    .timedOut(false)
                    .successful(false)
                    .language(language)
                    .build();
        }
    }

    /**
     * Parse test cases from JSON string
     * 
     * @param testCasesJson JSON string containing test cases
     * @return List of test cases
     */
    private List<TestCase> parseTestCases(String testCasesJson) {
        try {
            return objectMapper.readValue(testCasesJson, new TypeReference<List<TestCase>>() {});
        } catch (Exception e) {
            log.error("Error parsing test cases: {}", e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Execute code against multiple test cases
     * 
     * @param language Programming language
     * @param code User code to execute
     * @param initialCode Initial code (if any)
     * @param testCases List of test cases
     * @param timeout Execution timeout
     * @return True if all test cases pass, false otherwise
     */
    private boolean executeTestCases(LanguageType language, String code, String initialCode, List<TestCase> testCases, int timeout) {
        log.info("Executing {} test cases", testCases.size());
        
        for (int i = 0; i < testCases.size(); i++) {
            TestCase testCase = testCases.get(i);
            String inputData = testCase.getInputAsString();
            String expectedOutput = testCase.getOutput().trim();
            
            log.info("Running test case {}: input='{}', expected='{}'", i + 1, inputData, expectedOutput);
            
            try {
                DockerService.ExecutionResult result = dockerService.executeCode(
                        language, code, initialCode, inputData, timeout
                );
                
                String actualOutput = result.getStdout().trim();
                log.info("Test case {} result: actual='{}', expected='{}'", i + 1, actualOutput, expectedOutput);
                
                if (result.getExitCode() != 0) {
                    log.info("Test case {} failed with exit code {}: {}", i + 1, result.getExitCode(), result.getStderr());
                    return false;
                }
                
                if (!actualOutput.equals(expectedOutput)) {
                    log.info("Test case {} failed: output mismatch", i + 1);
                    return false;
                }
                
            } catch (Exception e) {
                log.error("Error executing test case {}: {}", i + 1, e.getMessage(), e);
                return false;
            }
        }
        
        log.info("All test cases passed!");
        return true;
    }

        /**
     * Execute test cases using inputData approach (new logic for isTestCase=true)
     * Parse testCases JSON and execute each test case using input as inputData
     * 
     * @param language      Programming language
     * @param code          User's code to execute
     * @param initialCode   Initial code/setup
     * @param testCasesJson JSON string containing test cases with input and output
     * @param timeout       Execution timeout in seconds
     * @param resultText    StringBuilder to collect test case results
     * @return true if all test cases pass, false otherwise
     */
    private boolean executeTestCasesWithInputData(LanguageType language, String code, String initialCode, String testCasesJson, int timeout, StringBuilder resultText) {
        try {
            // Parse testCases JSON string to List<Map>
            List<Map<String, Object>> testCasesList = objectMapper.readValue(testCasesJson, 
                new TypeReference<List<Map<String, Object>>>() {});
            
            for (Map<String, Object> testCase : testCasesList) {
                // Get input and expected output from test case
                Object inputObj = testCase.get("input");
                String expectedOutput = String.valueOf(testCase.get("output"));
                
                // Convert input to string format for dockerService.executeCode
                String inputData = convertInputToString(inputObj);
                
                // Execute code with this input
                DockerService.ExecutionResult result = dockerService.executeCode(
                    language,
                    code,
                    initialCode,
                    inputData,
                    timeout
                );
                
                // Check if execution was successful
                if (result.getExitCode() != 0) {
                    log.warn("Test case failed with exit code: {}, stderr: {}", result.getExitCode(), result.getStderr());
                    return false;
                }
                
                // Compare output
                String actualOutput = result.getStdout().trim();
                if (!actualOutput.equals(expectedOutput.trim())) {
                    log.debug("Test case failed. Expected: '{}', Actual: '{}'", expectedOutput, actualOutput);
                    return false;
                }
                resultText.append(String.format("%s -> %s\n", inputObj, expectedOutput));
            }
            
            return true; // All test cases passed
            
        } catch (Exception e) {
            log.error("Error parsing or executing test cases: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Convert input object to string format suitable for dockerService.executeCode
     * 
     * @param inputObj Input object (can be array, single value, etc.)
     * @return String representation of input data
     */
    private String convertInputToString(Object inputObj) {
        if (inputObj == null) {
            return "";
        }
        
        if (inputObj instanceof List) {
            List<?> inputList = (List<?>) inputObj;
            // Join list elements with newlines for multi-line input
            return inputList.stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining("\n"));
        } else {
            return String.valueOf(inputObj);
        }
    }

    /**
     * Process a code submission and grade it
     * 
     * @param userPrincipal Current user submitting the code
     * @param questionId ID of the question being answered
     * @param submissionRequest Code submission request
     * @return Submission response with grading results
     */
    @Transactional
    public SubmissionResponse processSubmission(UserPrincipal userPrincipal, UUID questionId, SubmissionRequest submissionRequest) {
        // Get the question
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found with ID: " + questionId));
            // Create a new submission entity\
        UserEntity userInfoById = userRepository.getById(userPrincipal.getId());
        SubmissionEntity submission = SubmissionEntity.builder()
                .user(userInfoById)
                .question(question)
                .code(submissionRequest.getCode())
                .language(submissionRequest.getLanguage())
                .status("PENDING")
                .build();


        try {
            // Execute the code
            DockerService.ExecutionResult executionResult;

            // Check if the language matches the expected language
            if (question.getLanguage() != submissionRequest.getLanguage()) {
                throw new IllegalArgumentException("The submitted code language does not match the question language");
            }

            // Execute code using Docker
            executionResult = dockerService.executeCode(
                    submissionRequest.getLanguage(),
                    submissionRequest.getCode(),
                    question.getInitialCode(), // Initial code (SQL schema, etc)
                    question.getInputData(), // Input data for programs using input() function
                    DEFAULT_TIMEOUT_SECONDS
            );

            // Process execution result
            String userOutput = executionResult.getStdout().trim();
            String expectedOutput = "";
            boolean hasPassed = false;
            StringBuilder resultText = new StringBuilder();
            boolean dontHaveTestCase  = false;
            // Check if question uses test cases (new isTestCase flag)
            if (Boolean.TRUE.equals(question.getIsTestCase()) && question.getTestCases() != null && !question.getTestCases().trim().isEmpty()) {
                // Execute against multiple test cases using new logic
                hasPassed = executeTestCasesWithInputData(
                        submissionRequest.getLanguage(),
                        submissionRequest.getCode(),
                        question.getInitialCode(),
                        question.getTestCases(),
                        DEFAULT_TIMEOUT_SECONDS,
                        resultText
                );
                expectedOutput = hasPassed?"Pass All test Cases!":"All test cases must pass";
            } else if (question.getTestCases() != null && !question.getTestCases().trim().isEmpty()) {
                // Legacy: Execute against multiple test cases (old logic)
                List<TestCase> testCases = parseTestCases(question.getTestCases());
                if (!testCases.isEmpty()) {
                    hasPassed = executeTestCases(
                            submissionRequest.getLanguage(),
                            submissionRequest.getCode(),
                            question.getInitialCode(),
                            testCases,
                            DEFAULT_TIMEOUT_SECONDS
                    );
                    expectedOutput = String.format("All %d test cases must pass", testCases.size());
                } else {
                    // Fallback to regular execution if test cases parsing failed
                    expectedOutput = question.getAnswer().trim();
                    hasPassed = userOutput.equals(expectedOutput);
                }
            } else if (Boolean.TRUE.equals(question.getIsCompare()) && question.getCompareCode() != null) {
                // Execute the comparison code to get expected output
                DockerService.ExecutionResult comparisonResult = dockerService.executeCode(
                        question.getLanguage(),
                        question.getCompareCode(),
                        question.getInitialCode(),
                        question.getInputData(), // Input data for comparison code
                        DEFAULT_TIMEOUT_SECONDS
                );
                expectedOutput = comparisonResult.getStdout().trim();
                hasPassed = userOutput.equals(expectedOutput);
            } else {
                // Use direct answer comparison
                expectedOutput = question.getAnswer().trim();
                hasPassed = userOutput.equals(expectedOutput);
                dontHaveTestCase = true;
            }
            String expectOutput = "";
            // Calculate score (100 if pass, 0 if fail)
            int score;
            if (dontHaveTestCase) {
                score = userOutput.equals(expectedOutput) ? 100 : 0;
            } else {
                score = hasPassed ? 100 : 0;
                if (score == 100) {
                    expectOutput = String.format("%s -> %s", question.getInputData().toString(), userOutput);
                } else {
                    expectOutput = "Failed";

                }

            }

            // Update submission with results
            submission.setScore(score);
            submission.setOutput(!dontHaveTestCase?expectOutput:userOutput);
            submission.setError(!dontHaveTestCase?"":executionResult.getStderr());
            submission.setExpectedOutput(!dontHaveTestCase?resultText.toString():expectedOutput);
            submission.setExecutionTime(executionResult.getExecutionTime());
            submission.setStatus("COMPLETED");

            submissionRepository.save(submission);

            // Create and return response
            SubmissionResponse submissionResponse = mapToResponse(submission);
            return submissionResponse;

        } catch (Exception e) {
            log.error("Error processing submission: {}", e.getMessage(), e);

            // Update submission with error
            submission.setStatus("FAILED");
            submission.setError(e.getMessage());
            submission.setScore(0);

            submissionRepository.save(submission);

            // Create and return error response
            return mapToResponse(submission);
        }

    }
    
    /**
     * Get all submissions for a user
     * 
     * @param userId User ID
     * @return List of submission responses
     */
    public List<SubmissionResponse> getUserSubmissions(UUID userId) {
        List<SubmissionEntity> submissions = submissionRepository.findByUserId(userId);
        return submissions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all submissions for a question
     * 
     * @param questionId Question ID
     * @return List of submission responses
     */
    public List<SubmissionResponse> getQuestionSubmissions(UUID questionId) {
        List<SubmissionEntity> submissions = submissionRepository.findByQuestionId(questionId);
        return submissions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all submissions for a user and question
     * 
     * @param userId User ID
     * @param questionId Question ID
     * @return List of submission responses
     */
    public List<SubmissionResponse> getUserQuestionSubmissions(UUID userId, UUID questionId) {
        List<SubmissionEntity> submissions = submissionRepository.findByUserIdAndQuestionId(userId, questionId);
        return submissions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if there exists any submission with perfect score (100) for the given question
     * 
     * @param questionId Question ID
     * @return true if any submission exists with score 100 for the given question
     */
    public boolean hasQuestionBeenSolvedPerfectly(UUID questionId) {
        return submissionRepository.existsByQuestionIdAndScore(questionId, 100);
    }
    
    /**
     * Convert a submission entity to a response
     * 
     * @param submission Submission entity
     * @return Submission response
     */
    private SubmissionResponse mapToResponse(SubmissionEntity submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
//                .userId(submission.getUserId())
//                .questionId(submission.getQuestion().getId())
                .code(submission.getCode())
                .language(submission.getLanguage())
                .score(submission.getScore())
                .output(submission.getOutput())
                .error(submission.getError())
                .expectedOutput(submission.getExpectedOutput())
                .executionTime(submission.getExecutionTime())
                .status(submission.getStatus())
                .createdAt(submission.getCreatedAt())
                .build();
    }
} 