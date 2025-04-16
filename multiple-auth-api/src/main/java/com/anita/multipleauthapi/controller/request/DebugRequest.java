package com.anita.multipleauthapi.controller.request;

import lombok.Data;

@Data
public class DebugRequest {
    private String code;
    private LanguageType language;
    private String initialCode; // Optional: for SQL schema setup or other initialization
} 