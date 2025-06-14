package com.anita.multipleauthapi.repository;

import com.anita.multipleauthapi.controller.request.LanguageType;
import com.anita.multipleauthapi.model.entity.QuestionEntity;
import com.anita.multipleauthapi.model.payload.QuestionWithScoreResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, UUID> {
    List<QuestionEntity> findByLanguage(LanguageType language);
    
    List<QuestionEntity> findByCreatedBy(UUID userId);

    @Query("SELECT NEW com.anita.multipleauthapi.model.payload.QuestionWithScoreResponse(q, s.score) " +
            "FROM QuestionEntity q " +
            "LEFT JOIN SubmissionEntity s ON q.id = s.question.id " +
            "LEFT JOIN UserEntity u ON s.user.id = u.id, " +
            "RelationsEntity r " +
            "WHERE q.id = r.fromId " +
            "AND r.toId = :courseId " +
            "AND u.id = :userId" +
            "")
    List<QuestionWithScoreResponse> findQuestionsWithScoreByCourseId(@Param("courseId") UUID courseId, @Param("userId") UUID userId);

    @Query("SELECT q FROM QuestionEntity q, RelationsEntity r " +
           "WHERE r.fromId = :courseId " +
           "AND r.toId = q.id " +
           "AND r.fromType = com.anita.multipleauthapi.model.enums.EntityType.COURSE " +
           "AND r.toType = com.anita.multipleauthapi.model.enums.EntityType.QUESTION")
    List<QuestionEntity> findByCourseId(@Param("courseId") UUID courseId);
    
    @Query("SELECT q FROM QuestionEntity q, RelationsEntity r " +
           "WHERE r.fromId = :courseId " +
           "AND r.toId = q.id " +
           "AND r.fromType = com.anita.multipleauthapi.model.enums.EntityType.COURSE " +
           "AND r.toType = com.anita.multipleauthapi.model.enums.EntityType.QUESTION " +
           "AND q.createdBy = :userId")
    List<QuestionEntity> findByCourseIdAndCreatedBy(@Param("courseId") UUID courseId, @Param("userId") UUID userId);
    
    @Query("SELECT q FROM QuestionEntity q WHERE " +
           "q.title LIKE CONCAT('%', :keyword, '%') OR " +
           "q.content LIKE CONCAT('%', :keyword, '%')")
    List<QuestionEntity> findByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT q FROM QuestionEntity q WHERE " +
           "q.language = :language AND " +
           "(q.title LIKE CONCAT('%', :keyword, '%') OR " +
           "q.content LIKE CONCAT('%', :keyword, '%'))")
    List<QuestionEntity> findByLanguageAndKeyword(
        @Param("language") LanguageType language,
        @Param("keyword") String keyword
    );
} 