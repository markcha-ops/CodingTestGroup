package com.anita.multipleauthapi.controller;

import com.anita.multipleauthapi.controller.request.DebugRequest;
import com.anita.multipleauthapi.controller.request.LanguageType;
import com.anita.multipleauthapi.controller.request.SubmissionRequest;
import com.anita.multipleauthapi.model.payload.DebugResponse;
import com.anita.multipleauthapi.model.payload.SubmissionResponse;
import com.anita.multipleauthapi.security.CurrentUser;
import com.anita.multipleauthapi.security.UserPrincipal;
import com.anita.multipleauthapi.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService submissionService;
    
    /**
     * Submit code for a specific question
     * 
     * @param userPrincipal Current authenticated user
     * @param questionId Question ID
     * @param submissionRequest Code submission request
     * @return Submission response with grading results
     */
    @PostMapping("/questions/{questionId}")
    public ResponseEntity<SubmissionResponse> submitCode(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID questionId,
            @RequestBody SubmissionRequest submissionRequest) {
        
        SubmissionResponse response = submissionService.processSubmission(
                userPrincipal, 
                questionId, 
                submissionRequest
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Debug code without submitting or saving
     * 
     * @param debugRequest Debug request containing code and language
     * @return Debug response with execution results
     */
    @PostMapping("/debug")
    public ResponseEntity<DebugResponse> debugCode(
            @RequestBody DebugRequest debugRequest) {
        
        DebugResponse response = submissionService.debugCode(debugRequest);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Debug code for a specific question without submitting
     * 
     * @param questionId Question ID
     * @param debugRequest Debug request containing code
     * @return Debug response with execution results
     */
    @PostMapping("/debug/questions/{questionId}")
    public ResponseEntity<DebugResponse> debugQuestionCode(
            @PathVariable UUID questionId,
            @RequestBody DebugRequest debugRequest) {
        
        DebugResponse response = submissionService.debugQuestionCode(
                questionId,
                debugRequest.getCode(),
                debugRequest.getLanguage()
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all submissions for the current user
     * 
     * @param userPrincipal Current authenticated user
     * @return List of user's submissions
     */
    @GetMapping("/me")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissions(
            @CurrentUser UserPrincipal userPrincipal) {
        
        List<SubmissionResponse> submissions = submissionService.getUserSubmissions(userPrincipal.getId());
        return ResponseEntity.ok(submissions);
    }
    
    /**
     * Get all submissions for a specific question by the current user
     * 
     * @param userPrincipal Current authenticated user
     * @param questionId Question ID
     * @return List of user's submissions for the question
     */
    @GetMapping("/me/questions/{questionId}")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissionsForQuestion(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID questionId) {
        
        List<SubmissionResponse> submissions = submissionService.getUserQuestionSubmissions(
                userPrincipal.getId(), 
                questionId
        );
        
        return ResponseEntity.ok(submissions);
    }
    
    /**
     * Get all submissions for a specific question (Admin only)
     * 
     * @param questionId Question ID
     * @return List of all submissions for the question
     */
    @GetMapping("/questions/{questionId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SYSTEM_ADMIN')")
    public ResponseEntity<List<SubmissionResponse>> getAllSubmissionsForQuestion(
            @PathVariable UUID questionId) {
        
        List<SubmissionResponse> submissions = submissionService.getQuestionSubmissions(questionId);
        return ResponseEntity.ok(submissions);
    }
    
    /**
     * Get all submissions by a specific user (Admin only)
     * 
     * @param userId User ID
     * @return List of all submissions by the user
     */
    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SYSTEM_ADMIN')")
    public ResponseEntity<List<SubmissionResponse>> getAllSubmissionsByUser(
            @PathVariable UUID userId) {
        
        List<SubmissionResponse> submissions = submissionService.getUserSubmissions(userId);
        return ResponseEntity.ok(submissions);
    }
} 