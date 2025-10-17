package com.anita.multipleauthapi.model.payload;

import com.anita.multipleauthapi.controller.request.LanguageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for question information
 * Used to avoid circular references when serializing entities
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private UUID id;
    private String title;
    private String content;
    private LanguageType language;
    private Integer lv;
    private Boolean isActive;
    private Boolean isCompare;
}

