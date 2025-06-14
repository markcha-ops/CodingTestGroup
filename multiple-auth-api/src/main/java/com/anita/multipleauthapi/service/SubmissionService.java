package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.controller.request.DebugRequest;
import com.anita.multipleauthapi.controller.request.LanguageType;
import com.anita.multipleauthapi.controller.request.SubmissionRequest;
import com.anita.multipleauthapi.model.entity.QuestionEntity;
import com.anita.multipleauthapi.model.entity.SubmissionEntity;
import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.payload.DebugResponse;
import com.anita.multipleauthapi.model.payload.SubmissionResponse;
import com.anita.multipleauthapi.repository.QuestionRepository;
import com.anita.multipleauthapi.repository.SubmissionRepository;
import com.anita.multipleauthapi.repository.UserRepository;
import com.anita.multipleauthapi.security.UserPrincipal;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final DockerService dockerService;
    
    private static final int DEFAULT_TIMEOUT_SECONDS = 10;
    private static final int DEBUG_TIMEOUT_SECONDS = 15;
    private final UserRepository userRepository;

    /**
     * Debug code without saving to database
     * 
     * @param debugRequest Debug request containing code and language
     * @return Debug response with execution results
     */
    public DebugResponse debugCode(DebugRequest debugRequest) {
        try {
            log.info("Debugging code with language: {}", debugRequest.getLanguage());
            
            // Execute code using Docker
            DockerService.ExecutionResult executionResult = dockerService.executeCode(
                    debugRequest.getLanguage(),
                    debugRequest.getCode(),
                    debugRequest.getInitialCode(), // Initial code (SQL schema, etc)
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
        SubmissionEntity submission = SubmissionEntity.builder()
                .userId(userPrincipal.getId())
                .questionId(question.getId())
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
                    DEFAULT_TIMEOUT_SECONDS
            );

            // Process execution result
            String userOutput = executionResult.getStdout().trim();
            String expectedOutput = "";
            boolean hasPassed = false;

            // If question uses comparison code, execute the comparison code
            if (Boolean.TRUE.equals(question.getIsCompare()) && question.getCompareCode() != null) {
                // Execute the comparison code to get expected output
                DockerService.ExecutionResult comparisonResult = dockerService.executeCode(
                        question.getLanguage(),
                        question.getCompareCode(),
                        question.getInitialCode(),
                        DEFAULT_TIMEOUT_SECONDS
                );
                expectedOutput = comparisonResult.getStdout().trim();
                hasPassed = userOutput.equals(expectedOutput);
            } else {
                // Use direct answer comparison
                expectedOutput = question.getAnswer().trim();
                hasPassed = userOutput.equals(expectedOutput);
            }

            // Calculate score (100 if pass, 0 if fail)
            int score = hasPassed ? 100 : 0;

            // Update submission with results
            submission.setScore(score);
            submission.setOutput(userOutput);
            submission.setError(executionResult.getStderr());
            submission.setExpectedOutput(expectedOutput);
            submission.setExecutionTime(executionResult.getExecutionTime());
            submission.setStatus("COMPLETED");

            submissionRepository.save(submission);

            // Create and return response
            return mapToResponse(submission);

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
                .userId(submission.getUserId())
                .questionId(submission.getQuestionId())
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