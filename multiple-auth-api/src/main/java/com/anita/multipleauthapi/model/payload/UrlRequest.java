package com.anita.multipleauthapi.model.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    private String url;
    
    @NotBlank
    private String type;
    
    private boolean isActive;
} 