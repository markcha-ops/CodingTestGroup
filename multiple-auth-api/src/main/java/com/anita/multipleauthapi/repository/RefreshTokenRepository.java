package com.anita.multipleauthapi.repository;

import com.anita.multipleauthapi.model.entity.RefreshTokenEntity;
import com.anita.multipleauthapi.model.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {
    Optional<RefreshTokenEntity> findByToken(String token);
    
    Optional<RefreshTokenEntity> findByUser(UserEntity user);
    
    @Modifying
    int deleteByUser(UserEntity user);
} 