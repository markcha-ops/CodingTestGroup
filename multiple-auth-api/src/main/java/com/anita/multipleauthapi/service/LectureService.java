package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.model.entity.LectureEntity;
import com.anita.multipleauthapi.model.entity.RelationsEntity;
import com.anita.multipleauthapi.model.entity.UrlInfoEntity;
import com.anita.multipleauthapi.model.entity.QuestionEntity;
import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.entity.SubmissionEntity;
import com.anita.multipleauthapi.model.enums.EntityType;
import com.anita.multipleauthapi.model.enums.RelationsType;
import com.anita.multipleauthapi.model.enums.StatusType;
import com.anita.multipleauthapi.model.payload.LectureDetailResponse;
import com.anita.multipleauthapi.model.payload.LectureGradingResponse;
import com.anita.multipleauthapi.model.payload.StudentGradingInfo;
import com.anita.multipleauthapi.model.payload.StudentDto;
import com.anita.multipleauthapi.model.payload.LectureDto;
import com.anita.multipleauthapi.model.payload.QuestionDto;
import com.anita.multipleauthapi.model.payload.DtoMapper;
import com.anita.multipleauthapi.repository.LectureEntityRepository;
import com.anita.multipleauthapi.repository.RelationsEntityRepository;
import com.anita.multipleauthapi.repository.UrlInfoEntityRepository;
import com.anita.multipleauthapi.repository.QuestionRepository;
import com.anita.multipleauthapi.repository.UserRepository;
import com.anita.multipleauthapi.repository.SubmissionRepository;
import com.anita.multipleauthapi.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LectureService {
    
    @Autowired
    private LectureEntityRepository lectureRepository;
    @Autowired
    private RelationsEntityRepository relationsEntityRepository;
    @Autowired
    private UrlInfoEntityRepository urlInfoRepository;
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SubmissionRepository submissionRepository;
    
    /**
     * Get all lectures for a specific course
     * @param userPrincipal The user principal containing course ID
     * @param date The date to filter lectures by
     * @param active Filter by active status, if null show all (both active and inactive)
     * @return List of lectures related to the course
     */
    public List<LectureEntity> getLecturesByCourseId(UserPrincipal userPrincipal, LocalDate date, Boolean active) {
        List<LectureEntity> lectures = lectureRepository.findLecturesByCourseId(userPrincipal.getCourseId(), date.atStartOfDay(), date.atStartOfDay().plusDays(1));
        if (active != null) {
            return lectures.stream()
                    .filter(lecture -> lecture.isActive() == active)
                    .collect(Collectors.toList());
        }
        return lectures; // Return all lectures if active is null
    }
    
    /**
     * Get all lectures for a specific course
     * @param userPrincipal The user principal containing course ID
     * @param active Filter by active status, if null show all (both active and inactive)
     * @return List of lectures related to the course
     */
    public List<LectureEntity> getLecturesByCourseId(UserPrincipal userPrincipal, Boolean active) {
        List<LectureEntity> lectures = lectureRepository.findLecturesByCourseId(userPrincipal.getCourseId());
        if (active) {
            return lectures.stream()
                    .filter(lecture -> lecture.isActive() == active)
                    .collect(Collectors.toList());
        }
        return lectures; // Return all lectures if active is null
    }
    
    /**
     * Get all lectures
     * @param active Filter by active status, if null show all (both active and inactive)
     * @return List of all lectures
     */
    public List<LectureEntity> getAllLectures(Boolean active) {
        List<LectureEntity> lectures = lectureRepository.findAll();
        if (active != null) {
            return lectures.stream()
                    .filter(lecture -> lecture.isActive() == active)
                    .collect(Collectors.toList());
        }
        return lectures; // Return all lectures if active is null
    }

    public void createLecture(UserPrincipal userPrincipal, LectureEntity lectureEntity) {
        LectureEntity lecture = lectureRepository.save(lectureEntity);
        relationsEntityRepository.save(RelationsEntity.builder()
                .fromId(userPrincipal.getCourseId())
                .fromType(EntityType.COURSE)
                .toId(lecture.getId())
//                .toType(EntityType.LECTURE)
                .status(StatusType.APPROVED)
                .relationType(RelationsType.MANAGES_TYPE)
                .build());

    }

    /**
     * Associate a URL with a lecture
     * @param lectureId The lecture ID to associate the URL with
     * @param urlId The URL ID to associate with the lecture
     * @param type The type of URL (pdf or video)
     * @return True if successfully associated, false otherwise
     */
    @Transactional
    public boolean associateUrlWithLecture(UUID lectureId, UUID urlId, String type) {
        // Verify the lecture exists
        lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));
        
        // Verify the URL exists and is of the specified type
        UrlInfoEntity urlInfo = urlInfoRepository.findById(urlId)
                .orElseThrow(() -> new RuntimeException("URL not found with ID: " + urlId));
        
        if (!type.equalsIgnoreCase(urlInfo.getType())) {
            throw new RuntimeException("URL is not of type " + type);
        }
        
        // Check if the lecture already has a URL relation of the same type
        List<RelationsEntity> existingRelations = relationsEntityRepository
                .findByFromIdAndToType(lectureId, EntityType.URL_INFO);
        
        // If there's an existing relation of the same type, delete it
        for (RelationsEntity relation : existingRelations) {
            UUID toId = relation.getToId();
            UrlInfoEntity existingUrl = urlInfoRepository.findById(toId).orElse(null);
            
            if (existingUrl != null && type.equalsIgnoreCase(existingUrl.getType())) {
                relationsEntityRepository.delete(relation);
            }
        }
        
        // Create a new relation
        RelationsEntity newRelation = RelationsEntity.builder()
                .fromId(lectureId)
                .fromType(EntityType.LECTURE)
                .toId(urlInfo.getId())
                .toType(EntityType.URL_INFO)
                .status(StatusType.APPROVED)
                .relationType(RelationsType.CONTAINS_TYPE)
                .build();
        
        relationsEntityRepository.save(newRelation);
        return true;
    }
    
    /**
     * Associate a PDF URL with a lecture (legacy method)
     * @param lectureId The lecture ID to associate the URL with
     * @param urlId The URL ID to associate with the lecture
     * @return True if successfully associated, false otherwise
     */
    @Transactional
    public boolean associatePdfUrl(UUID lectureId, UUID urlId) {
        return associateUrlWithLecture(lectureId, urlId, "pdf");
    }
    
    /**
     * Associate a question with a lecture
     * @param lectureId The lecture ID to associate the question with
     * @param questionId The question ID to associate with the lecture
     * @return True if successfully associated, false otherwise
     */
    @Transactional
    public boolean associateQuestionWithLecture(UUID lectureId, UUID questionId) {
        // Verify the lecture exists
        lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));
        
        // Create a new relation - no need to check for existing ones as multiple questions can be associated
        RelationsEntity newRelation = RelationsEntity.builder()
                .fromId(lectureId)
                .fromType(EntityType.LECTURE)
                .toId(questionId)
                .toType(EntityType.QUESTION)
                .status(StatusType.APPROVED)
                .relationType(RelationsType.CONTAINS_TYPE)
                .build();
        
        relationsEntityRepository.save(newRelation);
        return true;
    }
    
    /**
     * Get detailed information about a lecture, including associated URLs and questions
     * @param lectureId The ID of the lecture to get details for
     * @return A detailed lecture response with all associated information
     */
    @Transactional(readOnly = true)
    public LectureDetailResponse getLectureDetail(UUID lectureId) {
        // Get the lecture entity
        LectureEntity lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));
        
        // Find all URL relations associated with this lecture
        List<RelationsEntity> urlRelations = relationsEntityRepository
                .findByFromIdAndToType(lectureId, EntityType.URL_INFO);
        
        // Initialize PDF and video URL variables
        UrlInfoEntity pdfUrl = null;
        UrlInfoEntity videoUrl = null;
        
        // Set PDF or video URL when found
        for (RelationsEntity relation : urlRelations) {
            UrlInfoEntity urlInfo = urlInfoRepository.findById(relation.getToId()).orElse(null);
            if (urlInfo != null) {
                if ("pdf".equalsIgnoreCase(urlInfo.getType())) {
                    pdfUrl = urlInfo;
                } else if ("video".equalsIgnoreCase(urlInfo.getType())) {
                    videoUrl = urlInfo;
                }
            }
        }
        
        // Find all question relations associated with this lecture
        List<RelationsEntity> questionRelations = relationsEntityRepository
                .findByFromIdAndToType(lectureId, EntityType.QUESTION);
        
        // Sort question relations by creation time
        questionRelations.sort(Comparator.comparing(RelationsEntity::getCreatedAt));
        
        // Get question entities in the sorted order
        List<QuestionEntity> questions = new ArrayList<>();
        for (RelationsEntity relation : questionRelations) {
            questionRepository.findById(relation.getToId())
                .ifPresent(questions::add);
        }
        
        // Return the structured response
        return DtoMapper.toLectureDetailResponse(lecture, pdfUrl, videoUrl, questions);
    }

    /**
     * Toggle the active status of a lecture
     * @param lectureId The ID of the lecture to toggle
     * @param active The new active status
     * @return The updated lecture entity
     */
    @Transactional
    public LectureEntity toggleLectureActive(UUID lectureId, boolean active) {
        LectureEntity lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));
        
        lecture.setActive(active);
        return lectureRepository.save(lecture);
    }

    /**
     * Update an existing lecture
     * @param lectureId The ID of the lecture to update
     * @param updatedLecture The updated lecture data
     * @return The updated lecture entity
     */
    @Transactional
    public LectureEntity updateLecture(UUID lectureId, LectureEntity updatedLecture) {
        LectureEntity existingLecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));
        
        // Update fields
        if (updatedLecture.getName() != null) {
            existingLecture.setName(updatedLecture.getName());
        }
        if (updatedLecture.getDescription() != null) {
            existingLecture.setDescription(updatedLecture.getDescription());
        }
        if (updatedLecture.getDoAt() != null) {
            existingLecture.setDoAt(updatedLecture.getDoAt());
        }
        if (updatedLecture.getTheEnd() != null) {
            existingLecture.setTheEnd(updatedLecture.getTheEnd());
        }
        
        // Don't update ID or timestamps as these should be managed by the entity
        
        return lectureRepository.save(existingLecture);
    }
    
    /**
     * Delete a lecture
     * @param lectureId The ID of the lecture to delete
     * @return true if the lecture was deleted, false otherwise
     */
    @Transactional
    public boolean deleteLecture(UUID lectureId) {
        if (!lectureRepository.existsById(lectureId)) {
            throw new RuntimeException("Lecture not found with ID: " + lectureId);
        }
        
        // Delete all relations with this lecture as the source
        List<RelationsEntity> urlRelations = relationsEntityRepository.findByFromIdAndToType(lectureId, EntityType.URL_INFO);
        relationsEntityRepository.deleteAll(urlRelations);
        
        List<RelationsEntity> questionRelations = relationsEntityRepository.findByFromIdAndToType(lectureId, EntityType.QUESTION);
        relationsEntityRepository.deleteAll(questionRelations);
        
        // Delete the lecture
        lectureRepository.deleteById(lectureId);
        return true;
    }

    /**
     * Remove a question from a lecture by deleting the relation
     * @param lectureId The ID of the lecture
     * @param questionId The ID of the question to remove
     * @return true if the relation was deleted, false otherwise
     */
    @Transactional
    public boolean removeQuestionFromLecture(UUID lectureId, UUID questionId) {
        // Verify the lecture exists
        if (!lectureRepository.existsById(lectureId)) {
            throw new RuntimeException("Lecture not found with ID: " + lectureId);
        }
        
        // Find and delete the relation
        List<RelationsEntity> relations = relationsEntityRepository.findByFromIdAndToIdAndToType(
            lectureId, questionId, EntityType.QUESTION);
        
        if (relations.isEmpty()) {
            throw new RuntimeException("No relation found between lecture and question");
        }
        
        relationsEntityRepository.deleteAll(relations);
        return true;
    }

    /**
     * Get grading status for all students in a lecture
     * Returns lecture information, questions, and each student's highest score for each question
     * 
     * @param userPrincipal The current user principal (must have course access)
     * @param lectureId The ID of the lecture to get grading information for
     * @return LectureGradingResponse containing lecture, questions, and student grading details
     */
    @Transactional(readOnly = true)
    public LectureGradingResponse getLectureGradingStatus(UserPrincipal userPrincipal, UUID lectureId) {
        // Verify user has a course selected
        UUID courseId = userPrincipal.getCourseId();
        if (courseId == null) {
            throw new RuntimeException("No course selected");
        }
        
        // Get the lecture entity
        LectureEntity lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));
        
        // Find all question relations associated with this lecture
        List<RelationsEntity> questionRelations = relationsEntityRepository
                .findByFromIdAndToType(lectureId, EntityType.QUESTION);
        
        // Sort question relations by creation time
        questionRelations.sort(Comparator.comparing(RelationsEntity::getCreatedAt));
        
        // Get question entities in the sorted order
        List<QuestionEntity> questions = new ArrayList<>();
        for (RelationsEntity relation : questionRelations) {
            questionRepository.findById(relation.getToId())
                .ifPresent(questions::add);
        }
        
        // Get all students enrolled in the course
        List<RelationsEntity> studentRelations = relationsEntityRepository.findCourseStudentRelations(courseId);
        
        // Filter only approved students
        List<UserEntity> students = studentRelations.stream()
                .filter(relation -> relation.getStatus() == StatusType.APPROVED)
                .map(relation -> userRepository.findById(relation.getFromId()).orElse(null))
                .filter(user -> user != null)
                .collect(Collectors.toList());
        
        // Convert lecture entity to DTO
        LectureDto lectureDto = LectureDto.builder()
                .id(lecture.getId())
                .name(lecture.getName())
                .description(lecture.getDescription())
                .isActive(lecture.isActive())
                .doAt(lecture.getDoAt())
                .theEnd(lecture.getTheEnd())
                .createdAt(lecture.getCreatedAt())
                .updatedAt(lecture.getUpdatedAt())
                .build();
        
        // Convert question entities to DTOs
        List<QuestionDto> questionDtos = questions.stream()
                .map(q -> QuestionDto.builder()
                        .id(q.getId())
                        .title(q.getTitle())
                        .content(q.getContent())
                        .language(q.getLanguage())
                        .lv(q.getLv())
                        .isActive(q.getIsActive())
                        .isCompare(q.getIsCompare())
                        .build())
                .collect(Collectors.toList());
        
        // Build student grading information
        List<StudentGradingInfo> studentGradings = new ArrayList<>();
        
        for (UserEntity student : students) {
            Map<UUID, Integer> scores = new HashMap<>();
            
            // For each question, find the highest score achieved by this student
            for (QuestionEntity question : questions) {
                List<SubmissionEntity> submissions = submissionRepository
                        .findByUserIdAndQuestionId(student.getId(), question.getId());
                
                // Find the maximum score among all submissions
                Integer maxScore = submissions.stream()
                        .map(SubmissionEntity::getScore)
                        .filter(score -> score != null)
                        .max(Integer::compareTo)
                        .orElse(null);
                
                scores.put(question.getId(), maxScore);
            }
            
            // Convert student entity to DTO
            StudentDto studentDto = StudentDto.builder()
                    .id(student.getId())
                    .email(student.getEmail())
                    .name(student.getName())
                    .firstname(student.getFirstname())
                    .lastname(student.getLastname())
                    .authority(student.getAuthority())
                    .provider(student.getProvider())
                    .providerId(student.getProviderId())
                    .currentCourseId(student.getCurrentCourseId())
                    .lastLoginTime(student.getLastLoginTime())
                    .createdAt(student.getCreatedAt())
                    .updatedAt(student.getUpdatedAt())
                    .build();
            
            studentGradings.add(StudentGradingInfo.builder()
                    .student(studentDto)
                    .scores(scores)
                    .build());
        }
        
        // Return the structured response with DTOs
        return LectureGradingResponse.builder()
                .lecture(lectureDto)
                .questions(questionDtos)
                .studentGradings(studentGradings)
                .build();
    }
}