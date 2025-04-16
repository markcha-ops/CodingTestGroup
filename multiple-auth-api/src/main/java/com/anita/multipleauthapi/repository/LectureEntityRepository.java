package com.anita.multipleauthapi.repository;

import com.anita.multipleauthapi.model.entity.LectureEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface LectureEntityRepository extends JpaRepository<LectureEntity, UUID> {
    @Query("SELECT l FROM LectureEntity l, RelationsEntity r " +
           "WHERE r.fromId = :courseId " +
//           "AND r.fromType = com.anita.multipleauthapi.model.enums.EntityType.COURSE " +
//           "AND r.toType = com.anita.multipleauthapi.model.enums.EntityType.LECTURE " +
            "AND l.doAt >= :doAt " +
            "AND l.theEnd < :theEnd")
    List<LectureEntity> findLecturesByCourseId(@Param("courseId") UUID courseId, @Param("doAt") LocalDateTime doAt, @Param("theEnd") LocalDateTime theEnd);
    @Query("SELECT l FROM LectureEntity l, RelationsEntity r " +
           "WHERE r.fromId = :courseId " +
            "order by l.doAt, l.createdAt")
//           "AND r.fromType = com.anita.multipleauthapi.model.enums.EntityType.COURSE " +
//           "AND r.toType = com.anita.multipleauthapi.model.enums.EntityType.LECTURE")
    List<LectureEntity> findLecturesByCourseId(@Param("courseId") UUID courseId);

}