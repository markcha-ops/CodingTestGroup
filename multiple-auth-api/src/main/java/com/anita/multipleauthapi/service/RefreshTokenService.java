package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.config.AppProperties;
import com.anita.multipleauthapi.model.entity.RefreshTokenEntity;
import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.error.TokenRefreshException;
import com.anita.multipleauthapi.repository.RefreshTokenRepository;
import com.anita.multipleauthapi.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final AppProperties appProperties;

    public Optional<RefreshTokenEntity> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshTokenEntity createRefreshToken(UUID userId, String refreshToken2) {
        RefreshTokenEntity refreshToken = new RefreshTokenEntity();

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // If user already has a refresh token, delete it
        refreshTokenRepository.findByUser(user)
                .ifPresent(token -> refreshTokenRepository.delete(token));

        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(appProperties.getAuth().getRefreshTokenExpirationMsec()));
        refreshToken.setToken(refreshToken2);

        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken;
    }

    public RefreshTokenEntity verifyExpiration(RefreshTokenEntity token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token was expired. Please make a new sign in request");
        }

        return token;
    }

    @Transactional
    public int deleteByUserId(UUID userId) {
        return refreshTokenRepository.deleteByUser(
                userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found with id: " + userId)));
    }
} 