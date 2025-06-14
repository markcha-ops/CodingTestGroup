package com.anita.multipleauthapi.model.entity;

import com.anita.multipleauthapi.controller.request.LanguageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Entity
@Table(name="submissions")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionEntity {
    @Id
    @Column(name = "submission_id")
    private UUID id;
    
    @Column(name = "user_id")
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private QuestionEntity question;
    
    @Column(name = "code", columnDefinition = "TEXT")
    private String code;
    
    @Column(name = "language")
    @Enumerated(EnumType.STRING)
    private LanguageType language;
    
    @Column(name = "score")
    private Integer score;
    
    @Column(name = "output", columnDefinition = "TEXT")
    private String output;
    
    @Column(name = "error", columnDefinition = "TEXT")
    private String error;
    
    @Column(name = "expected_output", columnDefinition = "TEXT")
    private String expectedOutput;
    
    @Column(name = "execution_time")
    private Long executionTime;
    
    @Column(name = "status")
    private String status; // "PENDING", "COMPLETED", "FAILED"
    
    @Column(name = "created_at")
    private String createdAt;
    
    @Column(name = "updated_at")
    private String updatedAt;
    
    @PrePersist
    public void generateUUID() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = String.valueOf(System.currentTimeMillis());
        }
        this.updatedAt = String.valueOf(System.currentTimeMillis());
    }
} 