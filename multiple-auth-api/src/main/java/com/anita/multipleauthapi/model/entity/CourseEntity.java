package com.anita.multipleauthapi.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name="courses")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEntity {
    @Id @Column(name = "course_id")
    private UUID id;
    @Column(name = "course_name")
    private String name;
    @Column(name = "course_description")
    private String description;
    @Column(name = "is_active")
    private boolean isActive;
    @Column(name = "created_at")
    private String createdAt;
    @Column(name = "updated_at")
    private String updatedAt;

    @Transient
    private List<RelationsEntity> relations;
    @PrePersist
    public void generateUUID() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = String.valueOf(System.currentTimeMillis());
        }
        this.updatedAt = String.valueOf(System.currentTimeMillis());
    }
}
