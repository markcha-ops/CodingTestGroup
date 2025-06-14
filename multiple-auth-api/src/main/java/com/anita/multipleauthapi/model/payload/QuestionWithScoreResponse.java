package com.anita.multipleauthapi.model.payload;

import com.anita.multipleauthapi.model.entity.QuestionEntity;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class QuestionWithScoreResponse {
    private QuestionEntity question;
    private Integer score;
    
    // Constructor for JPQL query
    public QuestionWithScoreResponse(QuestionEntity question, Integer score) {
        this.question = question;
        this.score = score;
    }
} 