package com.anita.multipleauthapi.security.oauth2;

import com.anita.multipleauthapi.model.entity.UserEntity;
import com.anita.multipleauthapi.model.enums.AuthProvider;
import com.anita.multipleauthapi.model.enums.AuthorityType;
import com.anita.multipleauthapi.model.error.OAuth2AuthenticationProcessingException;
import com.anita.multipleauthapi.repository.UserRepository;
import com.anita.multipleauthapi.security.UserPrincipal;
import com.anita.multipleauthapi.security.oauth2.user.OAuth2UserInfo;
import com.anita.multipleauthapi.security.oauth2.user.OAuth2UserInfoFactory;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }

    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
                oAuth2UserRequest.getClientRegistration().getRegistrationId(),
                oAuth2User.getAttributes()
        );

        if (StringUtils.isEmpty(oAuth2UserInfo.getEmail())) {
            log.error("Email not found from OAuth2 pro      vider");
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        Optional<UserEntity> userOptional = userRepository.findByEmail(oAuth2UserInfo.getEmail());

        UserEntity userEntity;
        if (userOptional.isPresent()) {
            userEntity = userOptional.get();
        } else {
            userEntity = registerNewUser(oAuth2UserRequest, oAuth2UserInfo);
        }

        return UserPrincipal.create(userEntity, oAuth2User.getAttributes());
    }
    private UserEntity registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        UserEntity userEntity = UserEntity.builder()
                .provider(AuthProvider.valueOf(oAuth2UserRequest.getClientRegistration().getRegistrationId()))
                .providerId(oAuth2UserInfo.getId())
                .name(oAuth2UserInfo.getName())
                .authority(AuthorityType.USER)
                .password("none")
//                .roles(roleRepository.findAllByNameIn(Arrays.asList("ROLE_USER")))
                .email(oAuth2UserInfo.getEmail())
                .build();
        return userRepository.save(userEntity);
    }
}
