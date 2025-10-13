package com.anita.multipleauthapi.controller;

import com.anita.multipleauthapi.model.entity.CourseEntity;
import com.anita.multipleauthapi.model.payload.CourseStudentResponse;
import com.anita.multipleauthapi.model.payload.UserResponse;
import com.anita.multipleauthapi.security.CurrentUser;
import com.anita.multipleauthapi.security.UserPrincipal;
import com.anita.multipleauthapi.service.CourseService;
import com.anita.multipleauthapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RequestMapping("/api")
@RestController
public class CourseController {
    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;
    @GetMapping("/course/all")
    public ResponseEntity<?> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }
    @GetMapping("/course/manage")
    public ResponseEntity<?> getAllManageCourses(@CurrentUser UserPrincipal userPrincipal) {
        return ResponseEntity.ok(courseService.getGroupManagerCourses(userPrincipal.getId()));
    }
    @GetMapping("/course/self")
    public ResponseEntity<?> getAllSelfCourses(@CurrentUser UserPrincipal userPrincipal) {
        UserResponse userInfoById = userService.getUserInfoById(userPrincipal.getId());
        return ResponseEntity.ok(courseService.getSelfCourses(userInfoById.getId()));
    }
    @GetMapping("/course/current")
    public ResponseEntity<?> getCurrentCourse(@CurrentUser UserPrincipal userPrincipal) {
        UUID courseId = userPrincipal.getCourseId();
        
        if (courseId == null) {
            return ResponseEntity.badRequest().body("No current course selected");
        }
        
        CourseEntity course = courseService.getCourseInfoById(courseId);
        if (course == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(course);
    }
    
    @GetMapping("/course/students")
    public ResponseEntity<List<CourseStudentResponse>> getCourseStudents(@CurrentUser UserPrincipal userPrincipal) {
        try {
            // Check if user has permission to view students (should be a course manager or admin)
            return ResponseEntity.ok(courseService.getCourseStudents(userPrincipal));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/course/students/{relationId}/approve")
    public ResponseEntity<?> approveStudentEnrollment(@CurrentUser UserPrincipal userPrincipal,
                                                     @PathVariable UUID relationId) {
        try {
            courseService.approveStudentEnrollment(userPrincipal, relationId);
            return ResponseEntity.ok("Student enrollment approved successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/course/students/{relationId}")
    public ResponseEntity<?> removeStudentFromCourse(@CurrentUser UserPrincipal userPrincipal,
                                                    @PathVariable UUID relationId) {
        try {
            courseService.removeStudentFromCourse(userPrincipal, relationId);
            return ResponseEntity.ok("Student removed from course successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/course/invite/{courseId}")
    public ResponseEntity<?> inviteUserToCourse(@CurrentUser UserPrincipal userPrincipal, @PathVariable UUID courseId) {
        courseService.inviteUserToCourse(userPrincipal.getId(), courseId);
        return ResponseEntity.ok("User invited to course");
    }
    @PostMapping("/course")
    public ResponseEntity<?> createCourse(@CurrentUser UserPrincipal userPrincipal, @RequestBody Map<String, String> request) {
        CourseEntity courseEntity = new CourseEntity();
        courseEntity.setName(request.get("name"));
        courseEntity.setDescription(request.get("description"));
        courseService.createCourse(courseEntity, userPrincipal.getId());
        return ResponseEntity.ok("User invited to course");
    }
    @PostMapping("/course/select")
    public ResponseEntity<?> createCourse2(@CurrentUser UserPrincipal userPrincipal,@RequestBody CourseEntity courseEntity) {
//        courseService.createCourse(courseEntity, userPrincipal.getId());
        courseService.selectCourse(courseEntity, userPrincipal.getId());
        return ResponseEntity.ok("User invited to course");
    }

    @DeleteMapping("/course/{courseId}")
    public ResponseEntity<?> deleteCourse(@CurrentUser UserPrincipal userPrincipal, @PathVariable UUID courseId) {
        courseService.deleteCourse(courseId, userPrincipal.getId());
        return ResponseEntity.ok("Course successfully deleted");
    }

    @PutMapping("/course/{courseId}")
    public ResponseEntity<?> updateCourse(@CurrentUser UserPrincipal userPrincipal, 
                                         @PathVariable UUID courseId, 
                                         @RequestBody CourseEntity courseEntity) {
        courseService.updateCourse(courseId, courseEntity, userPrincipal.getId());
        return ResponseEntity.ok("Course successfully updated");
    }
}

