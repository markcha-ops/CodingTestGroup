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

    @Query("SELECT NEW com.anita.multipleauthapi.model.payload.QuestionWithScoreResponse(q, COALESCE(ms.score, 0), r3.doAt, r3.createdAt, r3.name) " +
            "FROM QuestionEntity q " +
            "JOIN RelationsEntity r ON q.id = r.fromId " +
            "LEFT JOIN ( " +
            "   SELECT s.question.id AS questionId, MAX(s.score) AS score " +
            "   FROM SubmissionEntity s " +
            "   WHERE s.user.id = :userId " +
            "   GROUP BY s.question.id " +
            ") ms ON q.id = ms.questionId " +
            "LEFT JOIN ( " +
            "   SELECT r2.toId AS toId, r2.createdAt AS createdAt, l.doAt AS doAt , l.name AS name" +
            "   FROM RelationsEntity r2 " +
            "   JOIN LectureEntity l ON r2.fromId = l.id " +
            ") r3 ON r3.toId = q.id " +
            "WHERE r.toId = :courseId " +
            "AND q.isActive IN :isActive " +
            "ORDER BY r3.doAt, r3.createdAt, q.createdAt")
    List<QuestionWithScoreResponse> findQuestionsWithScoreByCourseId(@Param("courseId") UUID courseId, @Param("userId") UUID userId, @Param("isActive") List<Boolean> isActive);

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