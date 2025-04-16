package com.anita.multipleauthapi.controller;

import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.payload.UserResponse;
import com.anita.multipleauthapi.security.CurrentUser;
import com.anita.multipleauthapi.security.UserPrincipal;
import com.anita.multipleauthapi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for user management operations
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userService.getUserInfoById(userPrincipal.getId()));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getUserProfile(@CurrentUser UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userService.getUserInfoById(userPrincipal.getId()));
    }
    
    @GetMapping("/email")
    public ResponseEntity<String> getUserEmail(@CurrentUser UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userPrincipal.getEmail());
    }
    
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUserInfoById(userId));
    }

    @PostMapping("")
    public ResponseEntity<UserResponse> createUser(@RequestBody UserEntity userPrincipal) {
        userService.createUser(userPrincipal);
        return ResponseEntity.ok(null);
    }
    
    @PutMapping("/update")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestBody UserEntity updatedUserInfo) {
        return ResponseEntity.ok(userService.updateUser(userPrincipal.getId(), updatedUserInfo));
    }
    
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID userId,
            @RequestBody UserEntity updatedUserInfo) {
        return ResponseEntity.ok(userService.updateUser(userId, updatedUserInfo));
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}