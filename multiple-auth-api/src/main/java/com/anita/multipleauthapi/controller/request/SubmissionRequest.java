package com.anita.multipleauthapi.controller.request;

import lombok.Data;

@Data
public class SubmissionRequest {
    private String code;
    private String inputData;
    private LanguageType language;
}
