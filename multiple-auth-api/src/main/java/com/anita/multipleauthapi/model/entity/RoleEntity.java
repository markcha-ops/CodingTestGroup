package com.anita.multipleauthapi.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Entity
@Table(name="roles")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleEntity {
    @Id @Column(name = "role_id")
    private UUID id;
    @Column(name = "rule_name")
    private String name;
}
