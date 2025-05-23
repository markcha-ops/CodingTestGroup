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
            @RequestParam(required = false) LanguageType language,
            @RequestParam(required = false) String keyword) {
        List<QuestionResponse> questions = questionService.searchQuestions(language, keyword);
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
                questionRequest, userPrincipal.getId());
        return ResponseEntity.ok(createdQuestion);
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
}
