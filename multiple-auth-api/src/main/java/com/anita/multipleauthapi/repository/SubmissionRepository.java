package com.anita.multipleauthapi.repository;

import com.anita.multipleauthapi.model.entity.SubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<SubmissionEntity, UUID> {
    List<SubmissionEntity> findByUserId(UUID userId);
    
    List<SubmissionEntity> findByQuestionId(UUID questionId);
    
    List<SubmissionEntity> findByUserIdAndQuestionId(UUID userId, UUID questionId);
    
    /**
     * Check if there exists any submission with the given questionId and score
     * @param questionId Question ID
     * @param score Score to check for
     * @return true if any submission exists with the given questionId and score
     */
    boolean existsByQuestionIdAndScore(UUID questionId, Integer score);
} 