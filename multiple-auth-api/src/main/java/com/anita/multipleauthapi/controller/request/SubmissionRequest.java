package com.anita.multipleauthapi.controller.request;

import lombok.Data;

@Data
public class SubmissionRequest {
    private String code;
    private LanguageType language;
}
