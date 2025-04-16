package com.anita.multipleauthapi.model.entity;

import com.anita.multipleauthapi.model.enums.EntityType;
import com.anita.multipleauthapi.model.enums.RelationsType;
import com.anita.multipleauthapi.model.enums.StatusType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Entity
@Table(name="relations")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelationsEntity {
    @Id
    @Column(name = "course_id")
    private UUID id;
    @Column(name = "relation_type")
    @Enumerated(EnumType.STRING)
    private RelationsType relationType;
    @Column(name="to_id")
    private UUID toId;
    @Column(name="from_id")
    private UUID fromId;
    @Column(name="to_type")
    @Enumerated(EnumType.STRING)
    private EntityType toType;
    @Column(name="from_type")
    @Enumerated(EnumType.STRING)
    private EntityType fromType;
    @Column(name="status")
    private StatusType status;
    @Column(name="created_at")
    private String createdAt;
    @Column(name="updated_at")
    private String updatedAt;
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
