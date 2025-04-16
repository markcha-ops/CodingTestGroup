package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.model.entity.LectureEntity;
import com.anita.multipleauthapi.model.entity.RelationsEntity;
import com.anita.multipleauthapi.model.entity.UrlInfoEntity;
import com.anita.multipleauthapi.model.entity.QuestionEntity;
import com.anita.multipleauthapi.model.enums.EntityType;
import com.anita.multipleauthapi.model.enums.RelationsType;
import com.anita.multipleauthapi.model.enums.StatusType;
import com.anita.multipleauthapi.model.payload.LectureDetailResponse;
import com.anita.multipleauthapi.repository.LectureEntityRepository;
import com.anita.multipleauthapi.repository.RelationsEntityRepository;
import com.anita.multipleauthapi.repository.UrlInfoEntityRepository;
import com.anita.multipleauthapi.repository.QuestionRepository;
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
        LectureEntity lecture = lectureRepository.findById(lectureId)
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
        LectureEntity lecture = lectureRepository.findById(lectureId)
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
        return LectureDetailResponse.builder()
                .lecture(lecture)
                .pdfUrl(pdfUrl)
                .videoUrl(videoUrl)
                .questions(questions)
                .build();
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
}