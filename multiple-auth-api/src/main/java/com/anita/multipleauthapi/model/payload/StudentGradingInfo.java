package com.anita.multipleauthapi.model.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO for student grading information
 * Contains student details and their scores for each question
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentGradingInfo {
    /**
     * Student information (DTO to avoid circular references)
     */
    private StudentDto student;
    
    /**
     * Map of question ID to highest score achieved by the student
     * Key: questionId, Value: highest score (0-100)
     */
    private Map<UUID, Integer> scores;
}

