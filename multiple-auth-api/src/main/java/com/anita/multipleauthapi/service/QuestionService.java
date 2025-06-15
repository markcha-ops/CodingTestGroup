package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.controller.request.LanguageType;
import com.anita.multipleauthapi.model.entity.CourseEntity;
import com.anita.multipleauthapi.model.entity.QuestionEntity;
import com.anita.multipleauthapi.model.entity.RelationsEntity;
import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.enums.EntityType;
import com.anita.multipleauthapi.model.enums.RelationsType;
import com.anita.multipleauthapi.model.enums.StatusType;
import com.anita.multipleauthapi.model.payload.QuestionRequest;
import com.anita.multipleauthapi.model.payload.QuestionResponse;
import com.anita.multipleauthapi.model.payload.QuestionWithScoreResponse;
import com.anita.multipleauthapi.repository.*;
import com.anita.multipleauthapi.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseEntityRepository courseEntityRepository;
    @Autowired
    private RelationsEntityRepository relationsEntityRepository;
    @Autowired
    private SubmissionRepository submissionRepository;

    /**
     * Get all questions
     * @return List of all questions
     */
    public List<QuestionResponse> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(this::mapToQuestionResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get questions created by a specific user
     * @param userId The user ID who created the questions
     * @return List of questions created by the user
     */
    public List<QuestionResponse> getMyQuestions(UUID userId) {
        return questionRepository.findByCreatedBy(userId).stream()
                .map(this::mapToQuestionResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Search questions with filters
     *
     * @param userPrincipal
     * @param language      Optional language filter
     * @param keyword       Optional keyword to search in title and content
     * @return List of questions matching the filters
     */
    public List<QuestionResponse> searchQuestions(UserPrincipal userPrincipal, LanguageType language, String keyword) {
        List<QuestionEntity> questions;
        Optional<UserEntity> optionalUserEntity = userRepository.findById(userPrincipal.getId());
        CourseEntity courseEntity = courseEntityRepository.getById(userPrincipal.getCourseId());
        if (optionalUserEntity.isPresent()) {
            boolean hasLanguage = language != null;
            boolean hasKeyword = StringUtils.hasText(keyword);
            UserEntity userEntity = optionalUserEntity.get();

            if (hasLanguage && hasKeyword) {
                // Both language and keyword filters are provided
                questions = questionRepository.findByLanguageAndKeyword(language, keyword);
            } else if (hasLanguage) {
                // Only language filter is provided
                questions = questionRepository.findByLanguage(language);
            } else if (hasKeyword) {
                // Only keyword filter is provided
                questions = questionRepository.findByKeyword(keyword);
            } else {
                // No filters, return all questions
                List<QuestionWithScoreResponse> questionsWithScoreByCourseId = questionRepository.findQuestionsWithScoreByCourseId(courseEntity.getId(), userEntity.getId());

                questions = questionsWithScoreByCourseId.stream()
                        .map(t-> {
                            QuestionEntity question = t.getQuestion();
                            Integer score = t.getScore();
                            if (score == null) {
                                score = 0;
                            }
                            question.setPass(score == 100 ? true : false);
                            return question;
                        })
                        .sorted(Comparator.comparing(t->t.getCreatedAt()))
                        .toList();
            }

            return questions.stream()
                    .map(this::mapToQuestionResponse)
                    .collect(Collectors.toList());
        } else {
            throw new RuntimeException("User not found");
        }

    }
    
    /**
     * Get all questions for a specific course
     * @param courseId The course ID
     * @return List of questions for the course
     */
    public List<QuestionResponse> getQuestionsByCourseId(UUID courseId) {
        return questionRepository.findByCourseId(courseId).stream()
                .map(this::mapToQuestionResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get questions for a specific course created by a specific user
     * @param courseId The course ID
     * @param userId The user ID who created the questions
     * @return List of questions created by the user for the course
     */
    public List<QuestionResponse> getQuestionsByCourseIdAndUserId(UUID courseId, UUID userId) {
        return questionRepository.findByCourseIdAndCreatedBy(courseId, userId).stream()
                .map(this::mapToQuestionResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Create a new question
     * @param questionRequest The question request data
     * @return The created question
     */
    public QuestionResponse createQuestion(QuestionRequest questionRequest, UserPrincipal createdBy) {
        Optional<UserEntity> optionalUserEntity = userRepository.findById(createdBy.getId());
        Optional<CourseEntity> optionalCourseEntity = courseEntityRepository.findById(createdBy.getCourseId());

        if (optionalUserEntity.isPresent()) {
            if (optionalCourseEntity.isPresent()) {
                CourseEntity courseEntity = optionalCourseEntity.get();
                QuestionEntity questionEntity = QuestionEntity.builder()
                        .title(questionRequest.getTitle())
                        .content(questionRequest.getContent())
                        .language(questionRequest.getLanguage())
                        .lv(questionRequest.getLv())
                        .answer(questionRequest.getAnswer())
                        .initialCode(questionRequest.getInitialCode())
                        .isCompare(questionRequest.getIsCompare())
                        .compareCode(questionRequest.getCompareCode())
                        .createdBy(createdBy.getId())
                        .build();

                QuestionEntity savedQuestion = questionRepository.save(questionEntity);

                relationsEntityRepository.save(RelationsEntity.builder()
                        .fromId(savedQuestion.getId())
                        .fromType(EntityType.USER)
                        .toId(courseEntity.getId())
                        .status(StatusType.APPROVED)
                        .toType(EntityType.COURSE)
                        .relationType(RelationsType.CONTAINS_TYPE)
                        .build());
                return mapToQuestionResponse(savedQuestion);
            } else {
                throw new RuntimeException("Course id " + createdBy.getCourseId() + " does not exist");
            }
        } else {
            throw new RuntimeException("User not found");
        }

    }
    
    /**
     * Update a question by its ID
     * @param questionId The ID of the question to update
     * @param questionRequest The updated question data
     * @param userId The ID of the user updating the question
     * @return The updated question response
     * @throws RuntimeException if the question doesn't exist
     */
    public QuestionResponse updateQuestion(UUID questionId, QuestionRequest questionRequest, UUID userId) {
        QuestionEntity existingQuestion = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + questionId));
        
        // Update the question fields
        existingQuestion.setTitle(questionRequest.getTitle());
        existingQuestion.setContent(questionRequest.getContent());
        existingQuestion.setLanguage(questionRequest.getLanguage());
        existingQuestion.setLv(questionRequest.getLv());
        existingQuestion.setAnswer(questionRequest.getAnswer());
        existingQuestion.setInitialCode(questionRequest.getInitialCode());
        existingQuestion.setIsCompare(questionRequest.getIsCompare());
        existingQuestion.setCompareCode(questionRequest.getCompareCode());
        existingQuestion.setUpdatedAt(String.valueOf(System.currentTimeMillis()));
        
        QuestionEntity updatedQuestion = questionRepository.save(existingQuestion);
        return mapToQuestionResponse(updatedQuestion);
    }
    
    /**
     * Delete a question by its ID
     * @param questionId The ID of the question to delete
     */
    public void deleteQuestion(UUID questionId) {
        questionRepository.deleteById(questionId);
    }
    
    /**
     * Get a question by its ID
     * @param questionId The ID of the question to retrieve
     * @return The question response if found
     * @throws RuntimeException if the question doesn't exist
     */
    public QuestionResponse getQuestionById(UUID questionId) {
        QuestionEntity question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + questionId));
        return mapToQuestionResponse(question);
    }
    
    /**
     * Map a QuestionEntity to a QuestionResponse
     * @param entity The entity to map
     * @return The mapped response
     */
    private QuestionResponse mapToQuestionResponse(QuestionEntity entity) {
        return QuestionResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .language(entity.getLanguage())
                .lv(entity.getLv())
                .answer(entity.getAnswer())
                .initialCode(entity.getInitialCode())
                .pass(entity.getPass())
                .isCompare(entity.getIsCompare())
                .compareCode(entity.getCompareCode())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
} 