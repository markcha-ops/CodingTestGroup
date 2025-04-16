package com.anita.multipleauthapi.model.payload;

import com.anita.multipleauthapi.controller.request.LanguageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {
    private UUID id;
    private UUID userId;
    private UUID questionId;
    private String code;
    private LanguageType language;
    private Integer score;
    private String output;
    private String error;
    private String expectedOutput;
    private Long executionTime;
    private String status;
    private String createdAt;
} 