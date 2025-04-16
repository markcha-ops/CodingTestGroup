package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.controller.request.LanguageType;
import com.anita.multipleauthapi.model.entity.QuestionEntity;
import com.anita.multipleauthapi.model.payload.QuestionRequest;
import com.anita.multipleauthapi.model.payload.QuestionResponse;
import com.anita.multipleauthapi.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    
    @Autowired
    private QuestionRepository questionRepository;
    
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
     * @param language Optional language filter
     * @param keyword Optional keyword to search in title and content
     * @return List of questions matching the filters
     */
    public List<QuestionResponse> searchQuestions(LanguageType language, String keyword) {
        List<QuestionEntity> questions;
        
        boolean hasLanguage = language != null;
        boolean hasKeyword = StringUtils.hasText(keyword);
        
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
            questions = questionRepository.findAll();
        }
        
        return questions.stream()
                .map(this::mapToQuestionResponse)
                .collect(Collectors.toList());
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
    public QuestionResponse createQuestion(QuestionRequest questionRequest, UUID createdBy) {
        QuestionEntity questionEntity = QuestionEntity.builder()
                .title(questionRequest.getTitle())
                .content(questionRequest.getContent())
                .language(questionRequest.getLanguage())
                .lv(questionRequest.getLv())
                .answer(questionRequest.getAnswer())
                .initialCode(questionRequest.getInitialCode())
                .isCompare(questionRequest.getIsCompare())
                .compareCode(questionRequest.getCompareCode())
                .createdBy(createdBy)
                .build();
        
        QuestionEntity savedQuestion = questionRepository.save(questionEntity);
        return mapToQuestionResponse(savedQuestion);
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
                .isCompare(entity.getIsCompare())
                .compareCode(entity.getCompareCode())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
} 