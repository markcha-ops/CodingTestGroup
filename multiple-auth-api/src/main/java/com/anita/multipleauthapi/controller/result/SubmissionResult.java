package com.anita.multipleauthapi.controller.result;

import lombok.Data;

@Data
public class SubmissionResult {
    private Integer score;
    private String output;
    private String error;
    private String expectedOutput;
    private Boolean wasCompareCodeUsed;
    private String comparisonDetails;
}
