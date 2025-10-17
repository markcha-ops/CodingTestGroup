package com.anita.multipleauthapi.model.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for lecture information
 * Used to avoid circular references when serializing entities
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LectureDto {
    private UUID id;
    private String name;
    private String description;
    private boolean isActive;
    private LocalDateTime doAt;
    private LocalDateTime theEnd;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

