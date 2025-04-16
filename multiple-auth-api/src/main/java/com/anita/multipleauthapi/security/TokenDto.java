package com.anita.multipleauthapi.security;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TokenDto {
    private String accessToken;
    private String refreshToken;
    private String grantType;
    private String tokenType = "Bearer";

}
