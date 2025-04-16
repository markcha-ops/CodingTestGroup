package com.anita.multipleauthapi.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Entity
@Table(name="keywords")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KeywordsEntity {
    @Id
    @Column(name = "keyword_id")
    private UUID id;
    @Column(name = "keyword_name")
    private String name;
    @PrePersist
    public void generateUUID() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
    }
}
