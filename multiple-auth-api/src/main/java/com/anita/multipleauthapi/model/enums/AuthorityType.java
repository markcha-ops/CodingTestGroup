package com.anita.multipleauthapi.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum AuthorityType {
    SYSTEM_ADMIN("system_admin"),
    ADMIN("admin"),
    TEAM_MANAGER("team_manager"),
    USER("user");
    private String authorityType;
}

