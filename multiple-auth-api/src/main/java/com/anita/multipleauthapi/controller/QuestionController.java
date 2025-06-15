package com.anita.multipleauthapi.controller;

import com.anita.multipleauthapi.controller.request.LanguageType;
import com.anita.multipleauthapi.model.payload.QuestionRequest;
import com.anita.multipleauthapi.model.payload.QuestionResponse;
import com.anita.multipleauthapi.security.CurrentUser;
import com.anita.multipleauthapi.security.UserPrincipal;
import com.anita.multipleauthapi.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/api")
@RestController
public class QuestionController {
    
    @Autowired
    private QuestionService questionService;
    
    /**
     * Get all questions with optional filtering by language and keyword
     */
    @GetMapping("/questions")
    public ResponseEntity<List<QuestionResponse>> searchQuestions(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam(required = false) LanguageType language,
            @RequestParam(required = false) String keyword) {
        List<QuestionResponse> questions = questionService.searchQuestions(userPrincipal, language, keyword);
        return ResponseEntity.ok(questions);
    }
    
    /**
     * Get questions created by the current user
     */
    @GetMapping("/questions/my")
    public ResponseEntity<List<QuestionResponse>> getMyQuestions(
            @CurrentUser UserPrincipal userPrincipal) {
        List<QuestionResponse> questions = questionService.getMyQuestions(userPrincipal.getId());
        return ResponseEntity.ok(questions);
    }
    
    /**
     * Create a new question
     */
    @PostMapping("/questions")
    public ResponseEntity<QuestionResponse> createQuestion(
            @RequestBody QuestionRequest questionRequest,
            @CurrentUser UserPrincipal userPrincipal) {
        QuestionResponse createdQuestion = questionService.createQuestion(
                questionRequest, userPrincipal);
        return ResponseEntity.ok(createdQuestion);
    }
    
    /**
     * Update a question by ID
     */
    @PutMapping("/questions/{questionId}")
    public ResponseEntity<QuestionResponse> updateQuestion(
            @PathVariable UUID questionId,
            @RequestBody QuestionRequest questionRequest,
            @CurrentUser UserPrincipal userPrincipal) {
        QuestionResponse updatedQuestion = questionService.updateQuestion(
                questionId, questionRequest, userPrincipal.getId());
        return ResponseEntity.ok(updatedQuestion);
    }
    
    /**
     * Delete a question by ID
     */
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<String> deleteQuestion(
            @PathVariable UUID questionId, 
            @CurrentUser UserPrincipal userPrincipal) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.ok("Question deleted successfully");
    }
    
    /**
     * Get a specific question by ID
     */
    @GetMapping("/question/{questionId}")
    public ResponseEntity<QuestionResponse> getQuestionById(
            @PathVariable UUID questionId) {
        QuestionResponse question = questionService.getQuestionById(questionId);
        return ResponseEntity.ok(question);
    }
    
    /**
     * Activate a question by ID
     */
    @PutMapping("/questions/{questionId}/activate")
    public ResponseEntity<String> activateQuestion(
            @PathVariable UUID questionId,
            @CurrentUser UserPrincipal userPrincipal) {
        questionService.activateQuestion(questionId, userPrincipal.getId());
        return ResponseEntity.ok("Question activated successfully");
    }
    
    /**
     * Deactivate a question by ID
     */
    @PutMapping("/questions/{questionId}/deactivate")
    public ResponseEntity<String> deactivateQuestion(
            @PathVariable UUID questionId,
            @CurrentUser UserPrincipal userPrincipal) {
        questionService.deactivateQuestion(questionId, userPrincipal.getId());
        return ResponseEntity.ok("Question deactivated successfully");
    }
}
