package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.payload.UserResponse;

public class UserMapper {

    public static UserResponse mapToUserResponse(UserEntity userEntity) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(userEntity.getId());
        userResponse.setEmail(userEntity.getEmail());
        userResponse.setFirstname(userEntity.getFirstname());
        userResponse.setLastname(userEntity.getLastname());
        userResponse.setName(userEntity.getName());
        userResponse.setAuthProvider(userEntity.getProvider());
        // Since imageUrl is in UserResponse but not in UserEntity, we'll leave it as null
        return userResponse;
    }

}
