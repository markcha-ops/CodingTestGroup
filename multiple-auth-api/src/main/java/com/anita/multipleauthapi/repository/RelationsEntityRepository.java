package com.anita.multipleauthapi.repository;

import com.anita.multipleauthapi.model.entity.RelationsEntity;
import com.anita.multipleauthapi.model.enums.EntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface RelationsEntityRepository extends JpaRepository<RelationsEntity, UUID> {
    @Query("SELECT r FROM RelationsEntity r " +
            "where r.fromId = ?1 " +
            "AND r.toId = ?2 " +
            "AND r.relationType = 'INVITES_TYPE'")
    RelationsEntity findInvite(UUID fromId, UUID toId);
    
    @Query("SELECT r FROM RelationsEntity r " +
           "WHERE r.fromId = :lectureId " +
           "AND r.toType = :urlType")
    List<RelationsEntity> findByFromIdAndToType(@Param("lectureId") UUID lectureId, 
                                               @Param("urlType") EntityType urlType);
                                               
    @Query("SELECT r FROM RelationsEntity r " +
           "WHERE r.fromId = :userId " +
           "AND r.toId = :courseId " +
           "AND r.fromType = com.anita.multipleauthapi.model.enums.EntityType.USER " +
           "AND r.toType = com.anita.multipleauthapi.model.enums.EntityType.COURSE")
    List<RelationsEntity> findUserCourseRelations(@Param("userId") UUID userId, @Param("courseId") UUID courseId);
    
    @Query("SELECT r FROM RelationsEntity r " +
           "WHERE r.fromId = :userId " +
           "AND r.toId = :courseId " +
           "AND r.fromType = com.anita.multipleauthapi.model.enums.EntityType.USER " +
           "AND r.toType = com.anita.multipleauthapi.model.enums.EntityType.COURSE " +
           "AND r.relationType = com.anita.multipleauthapi.model.enums.RelationsType.MANAGES_TYPE")
    List<RelationsEntity> findCourseManagers(@Param("userId") UUID userId, @Param("courseId") UUID courseId);
           
    @Query("SELECT r FROM RelationsEntity r " +
           "WHERE r.toId = :courseId " +
           "AND r.fromType = com.anita.multipleauthapi.model.enums.EntityType.USER " +
           "AND r.toType = com.anita.multipleauthapi.model.enums.EntityType.COURSE " +
           "AND r.relationType = com.anita.multipleauthapi.model.enums.RelationsType.CONTAINS_TYPE")
    List<RelationsEntity> findCourseStudentRelations(@Param("courseId") UUID courseId);

    @Query("SELECT r FROM RelationsEntity r " +
           "WHERE r.fromId = :fromId " +
           "AND r.toId = :toId " +
           "AND r.toType = :toType")
    List<RelationsEntity> findByFromIdAndToIdAndToType(
            @Param("fromId") UUID fromId,
            @Param("toId") UUID toId,
            @Param("toType") EntityType toType);
}
