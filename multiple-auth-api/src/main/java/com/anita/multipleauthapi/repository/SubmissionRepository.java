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
} 