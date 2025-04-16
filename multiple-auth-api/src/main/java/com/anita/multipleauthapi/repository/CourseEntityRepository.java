package com.anita.multipleauthapi.repository;

import com.anita.multipleauthapi.model.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseEntityRepository extends JpaRepository<CourseEntity, UUID> {


    @Query("SELECT c FROM CourseEntity c, RelationsEntity r " +
            "where c.id = r.toId " +
            "AND r.fromId = ?1 " +
            "AND r.relationType = 'MANAGES_TYPE'")
    List<CourseEntity> findAllGroupManagerCourses(UUID userId);

    @Query("SELECT c FROM CourseEntity c, RelationsEntity r " +
            "where c.id = r.toId " +
            "AND r.fromId = ?1 " +
            "AND r.status = 2 " +
            "AND (r.relationType = 'MANAGES_TYPE' OR r.relationType = 'CONTAINS_TYPE')")
    List<CourseEntity> findAllSelfCourses(UUID id);
}
