package com.anita.multipleauthapi.model.payload;

import com.anita.multipleauthapi.model.enums.AuthProvider;
import com.anita.multipleauthapi.model.enums.AuthorityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for student information
 * Used to avoid circular references when serializing entities
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private UUID id;
    private String email;
    private String name;
    private String firstname;
    private String lastname;
    private AuthorityType authority;
    private AuthProvider provider;
    private String providerId;
    private UUID currentCourseId;
    private LocalDateTime lastLoginTime;
    private String createdAt;
    private String updatedAt;
}

