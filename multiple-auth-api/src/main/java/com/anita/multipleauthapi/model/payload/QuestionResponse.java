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
public class QuestionResponse {
    private UUID id;
    private UUID courseId;
    private String title;
    private String content;
    private LanguageType language;
    private Integer lv;
    private Boolean pass;
    private String answer;
    private String initialCode;
    private String inputData;
    private String testCases;
    private Boolean isTestCase;
    private Boolean isCompare;
    private String compareCode;
    private Boolean isActive;
    private UUID createdBy;
    private String createdAt;
    private String updatedAt;
} 