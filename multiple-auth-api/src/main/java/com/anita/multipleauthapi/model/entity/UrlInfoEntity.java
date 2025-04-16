package com.anita.multipleauthapi.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name="url_info")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlInfoEntity {
    @Id
    @Column(name = "url_info_id")
    private UUID id;
    @Column(name = "url_info_name")
    private String name;
    @Column(name = "is_active")
    private boolean isActive;
    @Column(name = "url")
    private String url;
    @Column(name = "type")
    private String type;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
