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
    private String answer;
    private String initialCode;
    private Boolean isCompare;
    private String compareCode;
    private UUID createdBy;
    private String createdAt;
    private String updatedAt;
} 