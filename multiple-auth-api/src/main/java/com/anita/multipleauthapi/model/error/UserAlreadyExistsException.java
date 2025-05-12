package com.anita.multipleauthapi.model.error;
 
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
} 