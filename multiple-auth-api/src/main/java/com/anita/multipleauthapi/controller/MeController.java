package com.anita.multipleauthapi.controller;

import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.payload.UserResponse;
import com.anita.multipleauthapi.security.CurrentUser;
import com.anita.multipleauthapi.security.UserPrincipal;
import com.anita.multipleauthapi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller dedicated to endpoints for the currently authenticated user's information.
 * All endpoints require authentication.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/me")
public class MeController {
    
    private final UserService userService;
    
    /**
     * Gets the current authenticated user's complete profile information
     * 
     * @param userPrincipal The authenticated user (injected by Spring Security)
     * @return User profile information including ID, email, name, etc.
     */
    @GetMapping
    public ResponseEntity<UserResponse> getMyInfo(@CurrentUser UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userService.getUserInfoById(userPrincipal.getId()));
    }
    
    /**
     * Gets the current authenticated user's email address
     * 
     * @param userPrincipal The authenticated user (injected by Spring Security)
     * @return The user's email address
     */
    @GetMapping("/email")
    public ResponseEntity<String> getMyEmail(@CurrentUser UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userPrincipal.getEmail());
    }
    
    /**
     * Gets the current authenticated user's unique identifier
     * 
     * @param userPrincipal The authenticated user (injected by Spring Security)
     * @return The user's unique UUID
     */
    @GetMapping("/id")
    public ResponseEntity<UUID> getMyId(@CurrentUser UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userPrincipal.getId());
    }
    
    /**
     * Gets the current authenticated user's authority/role information
     * 
     * @param userPrincipal The authenticated user (injected by Spring Security)
     * @return The user's authorities/roles
     */
    @GetMapping("/authority")
    public ResponseEntity<?> getMyAuthority(@CurrentUser UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userPrincipal.getAuthorities());
    }
    
    /**
     * Updates the current authenticated user's profile information
     * Only non-null fields in the request body will be updated
     * 
     * @param userPrincipal The authenticated user (injected by Spring Security)
     * @param updatedUserInfo The new user information to apply (partial update supported)
     * @return The updated user profile
     */
    @PutMapping
    public ResponseEntity<UserResponse> updateMyInfo(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestBody UserEntity updatedUserInfo) {
        return ResponseEntity.ok(userService.updateUser(userPrincipal.getId(), updatedUserInfo));
    }
} 