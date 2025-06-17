package com.anita.multipleauthapi.model.entity;

import com.anita.multipleauthapi.controller.request.LanguageType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name="questions")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class QuestionEntity {
    @Id 
    @Column(name = "question_id")
    private UUID id;
    
    /**
     * If isCompare is false (default), standard comparison with expected output is used.
     * If isCompare is true, the compareCode will be executed and its output compared with the user's code output.
     */
    @Column(name = "is_compare")
    private Boolean isCompare;
    
    /**
     * Reference code that will be executed to produce the expected output.
     * Only used when isCompare is true.
     */
    @Column(name = "compare_code", columnDefinition = "TEXT")
    private String compareCode;
    
    /**
     * Indicates whether the question is active or not.
     * If isActive is true (default), the question is active and visible.
     * If isActive is false, the question is inactive and hidden.
     */
    @Column(name = "is_active")
    private Boolean isActive;
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "language")
    @Enumerated(EnumType.STRING)
    private LanguageType language;
    
    @Column(name = "level")
    private Integer lv;
    
    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;
    
    @Column(name = "initial_code", columnDefinition = "TEXT")
    private String initialCode;
    
    @Column(name = "input_data", columnDefinition = "TEXT")
    private String inputData;
    
    @Column(name = "test_cases", columnDefinition = "TEXT")
    private String testCases;
    
    @Column(name = "is_test_case")
    private Boolean isTestCase;
    
    @Column(name = "created_by")
    private UUID createdBy;
    
    @Column(name = "created_at")
    private String createdAt;
    
    @Column(name = "updated_at")
    private String updatedAt;
    @Transient
    private Boolean pass;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "question")
    private List<SubmissionEntity> submissions;

    @PrePersist
    public void generateUUID() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = String.valueOf(System.currentTimeMillis());
        }
        this.updatedAt = String.valueOf(System.currentTimeMillis());
        
        // Set default value for isCompare if it's null
        if (this.isCompare == null) {
            this.isCompare = false;
        }
        
        // Set default value for isActive if it's null
        if (this.isActive == null) {
            this.isActive = true;
        }
    }
} 