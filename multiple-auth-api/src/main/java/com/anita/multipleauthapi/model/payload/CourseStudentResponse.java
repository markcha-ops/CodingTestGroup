package com.anita.multipleauthapi.model.payload;

import com.anita.multipleauthapi.model.enums.StatusType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseStudentResponse {
    private UUID relationId;
    private UUID userId;
    private String name;
    private String email;
    private String firstname;
    private String lastname;
    private StatusType status;
    private String createdAt;
    private String updatedAt;
    private LocalDateTime lastLoginTime;
} 