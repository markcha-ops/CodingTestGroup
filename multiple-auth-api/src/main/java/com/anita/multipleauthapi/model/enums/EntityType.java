package com.anita.multipleauthapi.model.enums;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public enum EntityType {
    USER("user"),
    COURSE("course"),
    PRODUCTION("production"),
    LECTURE("lecture"),
    URL_INFO("url_info"),
    GROUP("group"),
    QUESTION("question"),
    SYSTEM("system");

    private String entityType;

    EntityType(String entityType) {
        this.entityType = entityType;
    }
}
