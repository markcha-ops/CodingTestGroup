package com.anita.multipleauthapi.controller;

import com.anita.multipleauthapi.model.entity.LectureEntity;
import com.anita.multipleauthapi.model.payload.LectureDetailResponse;
import com.anita.multipleauthapi.model.payload.LectureGradingResponse;
import com.anita.multipleauthapi.security.CurrentUser;
import com.anita.multipleauthapi.security.UserPrincipal;
import com.anita.multipleauthapi.service.LectureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;

@RestController
@RequestMapping("/api/lecture")
public class LectureController {
    
    @Autowired
    private LectureService lectureService;
    
    @GetMapping
    public ResponseEntity<List<LectureEntity>> getLectures(
            @RequestParam(required = false) Boolean active) {
        List<LectureEntity> lectures = lectureService.getAllLectures(active);
        return ResponseEntity.ok(lectures);
    }
    @GetMapping("/all")
    public ResponseEntity<List<LectureEntity>> getLecturesByCourseId(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam("activate") Boolean active) {
        List<LectureEntity> lectures = lectureService.getLecturesByCourseId(userPrincipal, active);
        return ResponseEntity.ok(lectures);
    }
    @GetMapping("/{date}")
    public ResponseEntity<List<LectureEntity>> getLecturesByCourseId(
            @CurrentUser UserPrincipal userPrincipal, 
            @PathVariable("date") LocalDate date,
            @RequestParam(required = false) Boolean active) {
        List<LectureEntity> lectures = lectureService.getLecturesByCourseId(userPrincipal, date, active);
        return ResponseEntity.ok(lectures);
    }
    @PostMapping
    public ResponseEntity<?> createLecture(@CurrentUser UserPrincipal userPrincipal, @RequestBody LectureEntity lectureEntity) {
        lectureService.createLecture(userPrincipal, lectureEntity);
        return ResponseEntity.ok("lectures");
    }
    
    /**
     * Endpoint to add or update URL for a lecture
     * @param lectureId The lecture ID to associate with the URL
     * @param type The type of URL (pdf or video)
     * @param urlID The URL ID to associate
     * @return Success or error message
     */
    @PostMapping("/add/{lectureId}")
    public ResponseEntity<?> addUrlToLecture(
            @PathVariable UUID lectureId,
            @RequestParam String type,
            @RequestParam("urlID") UUID urlId) {
        try {
            if (!("pdf".equalsIgnoreCase(type) || "video".equalsIgnoreCase(type))) {
                return ResponseEntity.badRequest().body("Only PDF or video types are supported");
            }
            boolean success = lectureService.associateUrlWithLecture(lectureId, urlId, type);
            if (success) {
                return ResponseEntity.ok(type + " URL successfully associated with lecture");
            } else {
                return ResponseEntity.badRequest().body("Failed to associate " + type + " URL with lecture");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Endpoint to associate a question with a lecture
     * @param lectureId The lecture ID to associate with the question
     * @param questionId The question ID to associate
     * @return Success or error message
     */
    @PostMapping("/question/{lectureId}")
    public ResponseEntity<?> addQuestionToLecture(
            @PathVariable UUID lectureId,
            @RequestParam UUID questionId) {
        try {
            boolean success = lectureService.associateQuestionWithLecture(lectureId, questionId);
            if (success) {
                return ResponseEntity.ok("Question successfully associated with lecture");
            } else {
                return ResponseEntity.badRequest().body("Failed to associate question with lecture");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Endpoint to get detailed information about a lecture, including associated URLs and questions
     * @param lectureId The ID of the lecture to get details for
     * @param active Filter by active status, if null show both active and inactive
     * @return Detailed lecture information with related PDFs, videos, and questions
     */
    @GetMapping("/detail/{lectureId}")
    public ResponseEntity<?> getLectureDetail(
            @PathVariable UUID lectureId,
            @RequestParam(required = false) Boolean active) {
        try {
            LectureDetailResponse lectureDetail = lectureService.getLectureDetail(lectureId);
            
            // If active parameter is provided, filter based on active status
            if (active != null && lectureDetail.getLecture().isActive() != active) {
                return ResponseEntity.ok().build();
            }
            
            return ResponseEntity.ok(lectureDetail);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Update an existing lecture
     * @param lectureId The ID of the lecture to update
     * @param lectureEntity The updated lecture data
     * @return The updated lecture
     */
    @PutMapping("/{lectureId}")
    public ResponseEntity<?> updateLecture(
            @PathVariable UUID lectureId,
            @RequestBody LectureEntity lectureEntity) {
        try {
            LectureEntity updatedLecture = lectureService.updateLecture(lectureId, lectureEntity);
            return ResponseEntity.ok(updatedLecture);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Delete a lecture
     * @param lectureId The ID of the lecture to delete
     * @return Success or error message
     */
    @DeleteMapping("/{lectureId}")
    public ResponseEntity<?> deleteLecture(@PathVariable UUID lectureId) {
        try {
            boolean success = lectureService.deleteLecture(lectureId);
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Lecture deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Failed to delete lecture");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Remove a question from a lecture
     * @param lectureId The ID of the lecture
     * @param questionId The ID of the question to remove
     * @return Success or error message
     */
    @DeleteMapping("/question/{lectureId}")
    public ResponseEntity<?> removeQuestionFromLecture(
            @PathVariable UUID lectureId,
            @RequestParam UUID questionId) {
        try {
            boolean success = lectureService.removeQuestionFromLecture(lectureId, questionId);
            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Question successfully removed from lecture");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Failed to remove question from lecture");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Get grading status for all students in a lecture
     * Returns lecture information with all questions and each student's highest score
     * 
     * @param userPrincipal The current user principal
     * @param lectureId The ID of the lecture to get grading information for
     * @return LectureGradingResponse containing lecture, questions, and student grading details
     */
    @GetMapping("/grading/{lectureId}")
    public ResponseEntity<?> getLectureGradingStatus(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID lectureId) {
        try {
            LectureGradingResponse gradingResponse = lectureService.getLectureGradingStatus(userPrincipal, lectureId);
            return ResponseEntity.ok(gradingResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
