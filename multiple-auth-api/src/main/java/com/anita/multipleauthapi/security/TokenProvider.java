package com.anita.multipleauthapi.security;

import com.anita.multipleauthapi.config.AppProperties;
import com.anita.multipleauthapi.model.entity.RefreshTokenEntity;
import com.anita.multipleauthapi.model.entity.RelationsEntity;
import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.enums.EntityType;
import com.anita.multipleauthapi.model.enums.RelationsType;
import com.anita.multipleauthapi.repository.RelationsEntityRepository;
import com.anita.multipleauthapi.repository.UserRepository;
import com.anita.multipleauthapi.service.RefreshTokenService;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class TokenProvider {

    private final AppProperties appProperties;
    private final UserRepository userRepository;
    private final RelationsEntityRepository relationsEntityRepository;
    private final RefreshTokenService refreshTokenService;
    private Algorithm ALGORITHM;
    private final Key key;

    public TokenProvider(AppProperties appProperties, UserRepository userRepository, RelationsEntityRepository relationsEntityRepository, RefreshTokenService refreshTokenService) {
        byte[] keyBytes = Decoders.BASE64.decode(appProperties.getAuth().getTokenSecret());
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.appProperties = appProperties;
        this.userRepository = userRepository;
        this.relationsEntityRepository = relationsEntityRepository;
        this.refreshTokenService = refreshTokenService;
        this.ALGORITHM = Algorithm.HMAC256(appProperties.getAuth().getTokenSecret());
    }

    public String createToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        ALGORITHM = Algorithm.HMAC256(appProperties.getAuth().getTokenSecret());

        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + appProperties.getAuth().getTokenExpirationMsec());

        // Get user entity to check current_course_id
        Optional<UserEntity> userEntityOptional = userRepository.findById(userPrincipal.getId());
        String relationTypeStr = null;

        if (userEntityOptional.isPresent()) {
            UserEntity userEntity = userEntityOptional.get();
            UUID currentCourseId = userEntity.getCurrentCourseId();
            
            if (currentCourseId != null) {
                // Find relationship between user and course
                Optional<RelationsEntity> relationOptional = relationsEntityRepository.findAll().stream()
                    .filter(r -> r.getFromId().equals(userPrincipal.getId()) 
                        && r.getToId().equals(currentCourseId)
                        && r.getFromType() == EntityType.USER
                        && r.getToType() == EntityType.COURSE)
                    .findFirst();
                
                if (relationOptional.isPresent()) {
                    RelationsEntity relation = relationOptional.get();
                    relationTypeStr = relation.getRelationType().name();
                }
            }
        }

        return JWT.create()
                .withSubject(userPrincipal.getId().toString())
                .withClaim("courseId", userPrincipal.getCourseId() != null ? userPrincipal.getCourseId().toString() : null)
                .withClaim("relationType", relationTypeStr)
                .withClaim("rule", userEntityOptional.get().getAuthority().toString())
                .withIssuedAt(now)
                .withExpiresAt(expirationDate)
                .sign(ALGORITHM);
    }

    public String createRefreshToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        // 동일한 시크릿을 사용하거나 별도의 시크릿을 사용할 수 있습니다.
        ALGORITHM = Algorithm.HMAC256(appProperties.getAuth().getTokenSecret());

        Date now = new Date();
        // appProperties에서 refresh token 전용 만료시간을 가져온다고 가정합니다.
        Date refreshExpirationDate = new Date(now.getTime() + appProperties.getAuth().getRefreshTokenExpirationMsec());

        return JWT.create()
                .withSubject(userPrincipal.getId().toString())
                .withIssuedAt(now)
                .withExpiresAt(refreshExpirationDate)
                .sign(ALGORITHM);
    }

    public TokenDto generateTokenDto(Authentication authentication, String username) {
        // 권한들 가져오기
//        List<String> authorties = authentication.getAuthorities().stream()
//                .map(GrantedAuthority::getAuthority)
//                .collect(Collectors.toList());

        long now = (new Date()).getTime();

        // Get user entity to check current_course_id
        Optional<UserEntity> userEntityOptional = userRepository.findByEmail(username);
        String relationTypeStr = null;
        
        if (userEntityOptional.isPresent()) {
            UserEntity userEntity = userEntityOptional.get();
            UUID currentCourseId = userEntity.getCurrentCourseId();
            
            if (currentCourseId != null) {
                // Find relationship between user and course
                Optional<RelationsEntity> relationOptional = relationsEntityRepository.findAll().stream()
                    .filter(r -> r.getFromId().equals(userEntity.getId()) 
                        && r.getToId().equals(currentCourseId)
                        && r.getFromType() == EntityType.USER
                        && r.getToType() == EntityType.COURSE)
                    .findFirst();
                
                if (relationOptional.isPresent()) {
                    RelationsEntity relation = relationOptional.get();
                    relationTypeStr = relation.getRelationType().name();
                }
            }
        }

        // Access Token 생성
        Date accessTokenExpiresIn = new Date(now + appProperties.getAuth().getTokenExpirationMsec());
        String accessToken = Jwts.builder()
                .setSubject(username)       // payload "sub": "name"
                .claim("username", authentication.getPrincipal().toString())
                .claim("auth", authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList())        // payload "auth": "ROLE_USER"
                .claim("relationType", relationTypeStr)
                .setExpiration(accessTokenExpiresIn)        // payload "exp": 1516239022 (예시)
                .signWith(key, SignatureAlgorithm.HS512)    // header "alg": "HS512"
                .compact();

        // Refresh Token 생성
        String refreshToken = Jwts.builder()
                .setExpiration(new Date(now + appProperties.getAuth().getRefreshTokenExpirationMsec()))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();

        return TokenDto.builder()
                .grantType("bearer")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
//                .accessTokenExpiresIn(accessTokenExpiresIn.getTime())
                .build();
    }

    public UUID getUserIdFromToken(String token) {
        JWTVerifier verifier = JWT.require(ALGORITHM).build();
        DecodedJWT decodedJWT = verifier.verify(token);
        String subject = decodedJWT.getSubject();
        return UUID.fromString(subject);
    }

    public boolean validateToken(String token) {
        try {
            JWTVerifier verifier = JWT.require(ALGORITHM).build();
            verifier.verify(token);
            return true;
        } catch (Exception e) {
            log.error("Invalid or expired JWT.");
        }
        return false;
    }

    public TokenDto refreshToken(String refreshToken) {
        Optional<RefreshTokenEntity> refreshTokenEntity = refreshTokenService.findByToken(refreshToken);
        
        if (refreshTokenEntity.isEmpty()) {
            throw new RuntimeException("Refresh token not found in database");
        }
        
        RefreshTokenEntity verifiedToken = refreshTokenService.verifyExpiration(refreshTokenEntity.get());
        UserEntity userEntity = verifiedToken.getUser();
        
        // Create new access token
        long now = (new Date()).getTime();
        Date accessTokenExpiresIn = new Date(now + appProperties.getAuth().getTokenExpirationMsec());
        
        String relationTypeStr = null;
        UUID currentCourseId = userEntity.getCurrentCourseId();
        
        if (currentCourseId != null) {
            // Find relationship between user and course
            Optional<RelationsEntity> relationOptional = relationsEntityRepository.findAll().stream()
                .filter(r -> r.getFromId().equals(userEntity.getId()) 
                    && r.getToId().equals(currentCourseId)
                    && r.getFromType() == EntityType.USER
                    && r.getToType() == EntityType.COURSE)
                .findFirst();
            
            if (relationOptional.isPresent()) {
                RelationsEntity relation = relationOptional.get();
                relationTypeStr = relation.getRelationType().name();
            }
        }
        
        String accessToken = JWT.create()
                .withSubject(userEntity.getId().toString())
                .withClaim("courseId", currentCourseId != null ? currentCourseId.toString() : null)
                .withClaim("relationType", relationTypeStr)
                .withClaim("rule", userEntity.getAuthority().toString())
                .withIssuedAt(new Date(now))
                .withExpiresAt(accessTokenExpiresIn)
                .sign(ALGORITHM);
                
        return TokenDto.builder()
                .grantType("bearer")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

}
