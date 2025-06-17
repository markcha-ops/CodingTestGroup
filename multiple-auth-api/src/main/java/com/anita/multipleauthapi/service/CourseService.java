package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.model.entity.*;
import com.anita.multipleauthapi.model.enums.EntityType;
import com.anita.multipleauthapi.model.enums.RelationsType;
import com.anita.multipleauthapi.model.enums.StatusType;
import com.anita.multipleauthapi.model.payload.CourseStudentResponse;
import com.anita.multipleauthapi.repository.CourseEntityRepository;
import com.anita.multipleauthapi.repository.RelationsEntityRepository;
import com.anita.multipleauthapi.repository.UserRepository;
import com.anita.multipleauthapi.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {
    @Autowired
    private CourseEntityRepository courseRepository;
    @Autowired
    private RelationsEntityRepository relationsRepository;
    @Autowired
    private UserRepository userRepository;

    public CourseEntity getCourseInfoById(UUID id) {
        if (id == null) {
            return null;
        }
        return courseRepository.findById(id).orElse(null);
    }
    public List<CourseEntity> getAllCourses() {
        return courseRepository.findAll();
    }

    public void inviteUserToCourse(UUID id) {

    }
    public List<CourseEntity> getGroupManagerCourses(UUID id) {
        return courseRepository.findAllGroupManagerCourses(id);
    }
    public List<CourseEntity> getSelfCourses(UUID id) {
        return courseRepository.findAllSelfCourses(id);
    }

    public void createCourse(CourseEntity courseEntity, UUID userId) {
        CourseEntity course = courseRepository.save(courseEntity);
        relationsRepository.save(RelationsEntity.builder()
                .fromId(userId)
                .fromType(EntityType.USER)
                .toId(course.getId())
                .status(StatusType.APPROVED)
                .toType(EntityType.COURSE)
                .relationType(RelationsType.MANAGES_TYPE)
                .build());

    }

    public void selectCourse(CourseEntity courseEntity, UUID id) {
            Optional<UserEntity> userEntityOptional = userRepository.findById(id);
        if (userEntityOptional.isPresent()) {
            UserEntity userEntity = userEntityOptional.get();
            userEntity.setCurrentCourseId(courseEntity.getId());
            userRepository.save(userEntity);
        }
    }

    public void inviteUserToCourse(UUID userId, UUID courseId) {
        // Check if course exists
        courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));
        
        // Check if relation already exists
        List<RelationsEntity> existingRelations = relationsRepository.findUserCourseRelations(userId, courseId);
        
        // If relation doesn't exist, create new one
        if (existingRelations.isEmpty()) {
            RelationsEntity relation = RelationsEntity.builder()
                    .fromId(userId)
                    .fromType(EntityType.USER)
                    .toId(courseId)
                    .toType(EntityType.COURSE)
                    .status(StatusType.WAITING)
                    .relationType(RelationsType.CONTAINS_TYPE)
                    .build();
            
            relationsRepository.save(relation);
        }
    }
    
    /**
     * Approve a student's enrollment request for the course and update their courseId
     * 
     * @param userPrincipal The course manager/admin approving the enrollment
     * @param relationId The ID of the relation to approve
     */
    @Transactional
    public void approveStudentEnrollment(UserPrincipal userPrincipal, UUID relationId) {
        UUID courseId = userPrincipal.getCourseId();
        
        if (courseId == null) {
            throw new RuntimeException("No current course selected");
        }
        
        // Get the relation by ID
        RelationsEntity relation = relationsRepository.findById(relationId)
                .orElseThrow(() -> new RuntimeException("Relation not found with ID: " + relationId));
        
        // Verify this is a student-course relation
        if (relation.getFromType() != EntityType.USER || relation.getToType() != EntityType.COURSE ||
            relation.getRelationType() != RelationsType.CONTAINS_TYPE) {
            throw new RuntimeException("Invalid relation type");
        }
        
        // Update relation status to APPROVED
        relation.setStatus(StatusType.APPROVED);
        relation.setUpdatedAt(String.valueOf(System.currentTimeMillis()));
        relationsRepository.save(relation);
        
        // Get the student ID from the relation
        UUID studentId = relation.getFromId();
        
        // Update student's courseId
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        
        student.setCurrentCourseId(courseId);
        userRepository.save(student);
    }
    
    /**
     * Get all students enrolled in a specific course with their relation information
     *
     * @param userPrincipal The current user principal
     * @return List of course student responses with relation details
     */
    public List<CourseStudentResponse> getCourseStudents(UserPrincipal userPrincipal) {
        UUID courseId = userPrincipal.getCourseId();
        
        if (courseId == null) {
            throw new RuntimeException("No current course selected");
        }
        
        // Check if course exists
        courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));
        
        // Get all relations for the course
        List<RelationsEntity> studentRelations = relationsRepository.findCourseStudentRelations(courseId);
        
        // Transform relations to responses with user information
        return studentRelations.stream()
                .map(relation -> {
                    UserEntity user = userRepository.findById(relation.getFromId())
                            .orElse(null);
                    
                    if (user == null) {
                        return null;
                    }
                    
                    return CourseStudentResponse.builder()
                            .relationId(relation.getId())
                            .userId(user.getId())
                            .email(user.getEmail())
                            .firstname(user.getFirstname())
                            .lastname(user.getLastname())
                            .status(relation.getStatus())
                            .createdAt(relation.getCreatedAt())
                            .updatedAt(relation.getUpdatedAt())
                            .lastLoginTime(user.getLastLoginTime())
                            .build();
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }

    /**
     * Remove a student from the course by deleting their relation
     * 
     * @param userPrincipal The course manager/admin removing the student
     * @param relationId The ID of the relation to remove
     */
    @Transactional
    public void removeStudentFromCourse(UserPrincipal userPrincipal, UUID relationId) {
        UUID courseId = userPrincipal.getCourseId();
        
        if (courseId == null) {
            throw new RuntimeException("No current course selected");
        }
        
        // Get the relation by ID
        RelationsEntity relation = relationsRepository.findById(relationId)
                .orElseThrow(() -> new RuntimeException("Relation not found with ID: " + relationId));
        
        // Verify this is a student-course relation for the current course
        if (relation.getFromType() != EntityType.USER || relation.getToType() != EntityType.COURSE ||
            relation.getRelationType() != RelationsType.CONTAINS_TYPE ||
            !relation.getToId().equals(courseId)) {
            throw new RuntimeException("Invalid relation or relation does not belong to current course");
        }
        
        // Get the student ID from the relation
        UUID studentId = relation.getFromId();
        
        // Remove the student's current course assignment
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        
        // Only reset courseId if it matches the current course
        if (courseId.equals(student.getCurrentCourseId())) {
            student.setCurrentCourseId(null);
            userRepository.save(student);
        }
        
        // Delete the relation
        relationsRepository.delete(relation);
    }
    
    /**
     * Delete a course if the user has permission (is a course manager)
     * @param courseId ID of the course to delete
     * @param userId ID of the user requesting deletion
     */
    public void deleteCourse(UUID courseId, UUID userId) {
        // Check if user is a manager of this course
        List<RelationsEntity> managerRelations = relationsRepository.findCourseManagers(userId, courseId);
        
        if (managerRelations.isEmpty()) {
            throw new RuntimeException("User does not have permission to delete this course");
        }
        
        // Delete all relations involving this course
        List<RelationsEntity> courseRelations = relationsRepository.findAll().stream()
                .filter(r -> (r.getToId().equals(courseId) && r.getToType() == EntityType.COURSE) || 
                            (r.getFromId().equals(courseId) && r.getFromType() == EntityType.COURSE))
                .toList();
        
        relationsRepository.deleteAll(courseRelations);
        
        // Delete the course entity
        courseRepository.deleteById(courseId);
    }
    
    /**
     * Update a course if the user has permission (is a course manager)
     * @param courseId ID of the course to update
     * @param updatedCourse Updated course data
     * @param userId ID of the user requesting the update
     */
    public void updateCourse(UUID courseId, CourseEntity updatedCourse, UUID userId) {
        // Check if user is a manager of this course
        List<RelationsEntity> managerRelations = relationsRepository.findCourseManagers(userId, courseId);
        
        if (managerRelations.isEmpty()) {
            throw new RuntimeException("User does not have permission to update this course");
        }
        
        // Get existing course
        CourseEntity existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));
        
        // Update fields while preserving ID
        updatedCourse.setId(existingCourse.getId());
        updatedCourse.setUpdatedAt(String.valueOf(System.currentTimeMillis()));
        if (updatedCourse.getCreatedAt() == null) {
            updatedCourse.setCreatedAt(existingCourse.getCreatedAt());
        }
        
        // Save updated course
        courseRepository.save(updatedCourse);
    }
}
