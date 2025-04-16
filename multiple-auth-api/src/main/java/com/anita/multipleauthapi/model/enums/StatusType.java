package com.anita.multipleauthapi.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum StatusType {
    WAITING("waiting"),
    REJECTED("rejected"),

    APPROVED("approved");
    private String statusType;
}
