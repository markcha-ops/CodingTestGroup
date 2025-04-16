package com.anita.multipleauthapi.model.payload;

import com.anita.multipleauthapi.model.enums.AuthProvider;
import lombok.Data;

import java.util.UUID;

@Data
public class UserResponse {
    private UUID id;
    private String email;
    private String firstname;
    private String lastname;
    private AuthProvider authProvider;
    private String name;
    private String imageUrl;
}
