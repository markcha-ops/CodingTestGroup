package com.anita.multipleauthapi.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum RelationsType {
    MANAGES_TYPE("Manages"),
    CONTAINS_TYPE("Contains");

    private String engName;
}
