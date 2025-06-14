package com.anita.multipleauthapi.repository;

import com.anita.multipleauthapi.model.entity.SubmissionEntity;
import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.entity.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<SubmissionEntity, UUID> {
    
    // Entity-based queries
    List<SubmissionEntity> findByUser(UserEntity user);
    
    List<SubmissionEntity> findByQuestion(QuestionEntity question);
    
    List<SubmissionEntity> findByUserAndQuestion(UserEntity user, QuestionEntity question);
    
    // UUID-based queries for backward compatibility
    @Query("SELECT s FROM SubmissionEntity s WHERE s.user.id = :userId")
    List<SubmissionEntity> findByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT s FROM SubmissionEntity s WHERE s.question.id = :questionId")
    List<SubmissionEntity> findByQuestionId(@Param("questionId") UUID questionId);
    
    @Query("SELECT s FROM SubmissionEntity s WHERE s.user.id = :userId AND s.question.id = :questionId")
    List<SubmissionEntity> findByUserIdAndQuestionId(@Param("userId") UUID userId, @Param("questionId") UUID questionId);
    
    // Additional useful queries using entity relationships
    @Query("SELECT s FROM SubmissionEntity s JOIN FETCH s.user JOIN FETCH s.question WHERE s.user.id = :userId")
    List<SubmissionEntity> findByUserIdWithDetails(@Param("userId") UUID userId);
    
    @Query("SELECT s FROM SubmissionEntity s JOIN FETCH s.user JOIN FETCH s.question WHERE s.question.id = :questionId")
    List<SubmissionEntity> findByQuestionIdWithDetails(@Param("questionId") UUID questionId);
    
    @Query("SELECT s FROM SubmissionEntity s JOIN FETCH s.user JOIN FETCH s.question WHERE s.user.id = :userId AND s.question.id = :questionId")
    List<SubmissionEntity> findByUserIdAndQuestionIdWithDetails(@Param("userId") UUID userId, @Param("questionId") UUID questionId);
} 