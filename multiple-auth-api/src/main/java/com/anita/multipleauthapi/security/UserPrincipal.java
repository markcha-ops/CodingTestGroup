package com.anita.multipleauthapi.security;

import com.anita.multipleauthapi.model.entity.UserEntity;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class UserPrincipal implements OAuth2User, UserDetails {
    private UUID id;
    private String email;
    private String password;
    private UUID courseId;
    private Collection<? extends GrantedAuthority> authorities;
    private Map<String, Object> attributes;

    public UserPrincipal(UUID id,
                         String email,
                         String password,
                         UUID courseId,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.courseId = courseId;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getName() {
        return String.valueOf(id);
    }

    public static UserPrincipal create(UserEntity userEntity) {
        List<GrantedAuthority> authorities = List.of(); // can be implemented later if needed

        return new UserPrincipal(
                userEntity.getId(),
                userEntity.getEmail(),
                userEntity.getPassword(),
                userEntity.getCurrentCourseId(),
                authorities
        );
    }

    public static UserPrincipal create(UserEntity userEntity, Map<String, Object> attributes) {
        UserPrincipal userPrincipal = UserPrincipal.create(userEntity);
        userPrincipal.setAttributes(attributes);
        return userPrincipal;
    }
}
