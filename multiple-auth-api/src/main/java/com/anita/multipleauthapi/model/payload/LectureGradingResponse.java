package com.anita.multipleauthapi.model.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for lecture grading response
 * Contains lecture information, associated questions, and student grading details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LectureGradingResponse {
    /**
     * The lecture information (DTO to avoid circular references)
     */
    private LectureDto lecture;
    
    /**
     * List of questions associated with this lecture (DTO to avoid circular references)
     */
    private List<QuestionDto> questions;
    
    /**
     * List of student grading information
     * Each entry contains a student and their scores for each question
     */
    private List<StudentGradingInfo> studentGradings;
}

