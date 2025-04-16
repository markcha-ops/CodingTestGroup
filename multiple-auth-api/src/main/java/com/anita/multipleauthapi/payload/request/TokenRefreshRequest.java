package com.anita.multipleauthapi.payload.request;

import lombok.Data;

@Data
public class TokenRefreshRequest {
    private String refreshToken;
} 