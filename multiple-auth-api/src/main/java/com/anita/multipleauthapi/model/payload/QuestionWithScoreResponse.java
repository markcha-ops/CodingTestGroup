package com.anita.multipleauthapi.model.payload;

import com.anita.multipleauthapi.model.entity.QuestionEntity;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class QuestionWithScoreResponse {
    private QuestionEntity question;
    private Integer score;
    private LocalDateTime doAt;
    private String createdAt;
    private String updatedAt;
    private String name;
    private String lecttureName;
    
    // Constructor for JPQL query
    public QuestionWithScoreResponse(QuestionEntity question, Integer score, LocalDateTime doAt, String createdAt,String name) {
        this.question = question;
        this.score = score;
        this.doAt = doAt;
        this.createdAt = createdAt;
        this.lecttureName = name;
    }
} 