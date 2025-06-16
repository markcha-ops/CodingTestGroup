package com.anita.multipleauthapi.model.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlInfoResponseDto {
    private UUID id;
    private String name;
    private boolean isActive;
    private String url;
    private String type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 