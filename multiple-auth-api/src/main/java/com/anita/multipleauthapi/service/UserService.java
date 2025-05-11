package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.enums.AuthorityType;
import com.anita.multipleauthapi.model.payload.UserResponse;
import com.anita.multipleauthapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserResponse getUserInfoById(UUID id) {
        log.debug("Getting user info by id: {}", id);

        UserEntity userEntity = userRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: %s.".formatted(id)));

        return UserMapper.mapToUserResponse(userEntity);
    }
    
    public UserResponse getUserByEmail(String email) {
        log.debug("Getting user info by email: {}", email);
        
        UserEntity userEntity = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: %s.".formatted(email)));
                
        return UserMapper.mapToUserResponse(userEntity);
    }
    
    public List<UserResponse> getAllUsers() {
        log.debug("Getting all users");
        
        return userRepository.findAll()
                .stream()
                .map(UserMapper::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public void createUser(UserEntity entity) {
        entity.setId(UUID.randomUUID());
        entity.setPassword(passwordEncoder.encode(entity.getPassword()));
        entity.setAuthority(AuthorityType.USER);
        userRepository.save(entity);
    }
    
    public UserResponse updateUser(UUID id, UserEntity updatedUser) {
        log.debug("Updating user with id: {}", id);
        
        UserEntity existingUser = userRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: %s.".formatted(id)));
        
        // Update only non-null fields
        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getName() != null) {
            existingUser.setName(updatedUser.getName());
        }
        if (updatedUser.getFirstname() != null) {
            existingUser.setFirstname(updatedUser.getFirstname());
        }
        if (updatedUser.getLastname() != null) {
            existingUser.setLastname(updatedUser.getLastname());
        }
        
        existingUser.setUpdatedAt(String.valueOf(System.currentTimeMillis()));
        
        userRepository.save(existingUser);
        
        return UserMapper.mapToUserResponse(existingUser);
    }
}
