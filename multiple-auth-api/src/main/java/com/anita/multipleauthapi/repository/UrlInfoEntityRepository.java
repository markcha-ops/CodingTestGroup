package com.anita.multipleauthapi.repository;

import com.anita.multipleauthapi.model.entity.UrlInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UrlInfoEntityRepository extends JpaRepository<UrlInfoEntity, UUID> {

    Optional<UrlInfoEntity> findByUrl(String url);
    
    List<UrlInfoEntity> findByType(String type);
    
    @Query("SELECT u FROM UrlInfoEntity u WHERE " +
           "u.type = :type AND " +
           "(u.name LIKE CONCAT('%', :keyword, '%') OR u.url LIKE CONCAT('%', :keyword, '%'))")
    List<UrlInfoEntity> findByTypeAndKeywordContaining(@Param("type") String type, 
                                                     @Param("keyword") String keyword);
    
    @Query("SELECT u FROM UrlInfoEntity u WHERE " +
           "u.name LIKE CONCAT('%', :keyword, '%') OR u.url LIKE CONCAT('%', :keyword, '%')")
    List<UrlInfoEntity> findByKeywordContaining(@Param("keyword") String keyword);
}
