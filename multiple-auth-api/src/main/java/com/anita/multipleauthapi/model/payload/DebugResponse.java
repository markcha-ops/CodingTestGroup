package com.anita.multipleauthapi.model.payload;

import com.anita.multipleauthapi.controller.request.LanguageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DebugResponse {
    private String output;
    private String error;
    private Long executionTime;
    private Integer exitCode;
    private Boolean timedOut;
    private Boolean successful;
    private LanguageType language;
} 