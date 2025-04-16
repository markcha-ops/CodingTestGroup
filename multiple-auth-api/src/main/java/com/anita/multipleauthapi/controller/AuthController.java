package com.anita.multipleauthapi.controller;

import com.anita.multipleauthapi.model.error.TokenRefreshException;
import com.anita.multipleauthapi.payload.request.TokenRefreshRequest;
import com.anita.multipleauthapi.payload.response.TokenRefreshResponse;
import com.anita.multipleauthapi.security.TokenDto;
import com.anita.multipleauthapi.security.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/token")
@RequiredArgsConstructor
public class AuthController {

    private final TokenProvider tokenProvider;

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        try {
            String refreshToken = request.getRefreshToken();
            TokenDto tokenDto = tokenProvider.refreshToken(refreshToken);
            
            return ResponseEntity.ok(new TokenRefreshResponse(
                    tokenDto.getAccessToken(), 
                    refreshToken,
                    tokenDto.getGrantType()
            ));
        } catch (TokenRefreshException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 