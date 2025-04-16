package com.anita.multipleauthapi.controller;

import com.anita.multipleauthapi.model.entity.LectureEntity;
import com.anita.multipleauthapi.security.CurrentUser;
import com.anita.multipleauthapi.security.UserPrincipal;
import com.anita.multipleauthapi.service.LectureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/lecture")
public class LectureActiveController {
    
    @Autowired
    private LectureService lectureService;
    
    /**
     * Activate a lecture
     * @param lectureId The ID of the lecture to activate
     * @return Success or error message
     */
    @PostMapping("/activate/{lectureId}")
    public ResponseEntity<?> activateLecture(@PathVariable UUID lectureId) {
        try {
            LectureEntity lecture = lectureService.toggleLectureActive(lectureId, true);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lecture activated successfully");
            response.put("lecture", lecture);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Deactivate a lecture
     * @param lectureId The ID of the lecture to deactivate
     * @return Success or error message
     */
    @PostMapping("/deactivate/{lectureId}")
    public ResponseEntity<?> deactivateLecture(@PathVariable UUID lectureId) {
        try {
            LectureEntity lecture = lectureService.toggleLectureActive(lectureId, false);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lecture deactivated successfully");
            response.put("lecture", lecture);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Toggle a lecture's active status
     * @param lectureId The ID of the lecture to toggle
     * @param active The new active status
     * @return Success or error message
     */
    @PutMapping("/toggle/{lectureId}")
    public ResponseEntity<?> toggleLectureActive(
            @PathVariable UUID lectureId,
            @RequestParam boolean active) {
        try {
            LectureEntity lecture = lectureService.toggleLectureActive(lectureId, active);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", active ? "Lecture activated successfully" : "Lecture deactivated successfully");
            response.put("lecture", lecture);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 