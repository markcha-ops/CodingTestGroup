package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.error.BadCredentialsException;
import com.anita.multipleauthapi.model.error.UserNotFoundException;
import com.anita.multipleauthapi.model.payload.LoginRequest;
import com.anita.multipleauthapi.model.payload.LoginResponse;
import com.anita.multipleauthapi.repository.UserRepository;
import com.anita.multipleauthapi.security.TokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoginService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;

    public LoginResponse login(LoginRequest loginRequest) {
        log.debug("Login request: {}", loginRequest);
        Authentication authentication;

        UserEntity userEntity = userRepository
                .findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email not registered by administrator yet."));

        if (StringUtils.isEmpty(userEntity.getPassword())) {
            userEntity.setPassword(passwordEncoder.encode(loginRequest.getPassword()));
            userRepository.saveAndFlush(userEntity);
        }

        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 로그인 성공 시 마지막 로그인 시간 업데이트
        userEntity.setLastLoginTime(LocalDateTime.now());
        userRepository.saveAndFlush(userEntity);

        String token = tokenProvider.createToken(authentication);
        return new LoginResponse(token);
    }
}
