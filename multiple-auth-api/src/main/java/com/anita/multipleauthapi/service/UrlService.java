package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.model.entity.UrlInfoEntity;
import com.anita.multipleauthapi.model.payload.UrlRequest;
import com.anita.multipleauthapi.model.payload.UrlResponse;
import com.anita.multipleauthapi.repository.UrlInfoEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UrlService {
    private final UrlInfoEntityRepository urlRepository;
    
    public List<UrlResponse> getAllUrls() {
        return urlRepository.findAll().stream()
                .map(this::mapToUrlResponse)
                .collect(Collectors.toList());
    }
    
    public List<UrlResponse> searchUrls(String type, String keyword) {
        List<UrlInfoEntity> results;
        
        boolean hasType = StringUtils.hasText(type);
        boolean hasKeyword = StringUtils.hasText(keyword);
        
        // 타입과 키워드 모두 있는 경우
        if (hasType && hasKeyword) {
            results = urlRepository.findByTypeAndKeywordContaining(type, keyword);
        }
        // 타입만 있는 경우
        else if (hasType) {
            results = urlRepository.findByType(type);
        }
        // 키워드만 있는 경우
        else if (hasKeyword) {
            results = urlRepository.findByKeywordContaining(keyword);
        }
        // 둘 다 없는 경우 (모든 URL 반환)
        else {
            results = urlRepository.findAll();
        }
        
        return results.stream()
                .map(this::mapToUrlResponse)
                .collect(Collectors.toList());
    }
    
    public UrlResponse getUrlById(UUID id) {
        UrlInfoEntity urlEntity = urlRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("URL not found with ID: " + id));
        return mapToUrlResponse(urlEntity);
    }
    
    public UrlResponse createUrl(UrlRequest urlRequest) {
        UrlInfoEntity urlEntity = UrlInfoEntity.builder()
                .name(urlRequest.getName())
                .url(urlRequest.getUrl())
                .type(urlRequest.getType())
                .isActive(urlRequest.isActive())
                .build();
        
        UrlInfoEntity savedEntity = urlRepository.save(urlEntity);
        return mapToUrlResponse(savedEntity);
    }
    
    public UrlResponse updateUrl(UUID id, UrlRequest urlRequest) {
        UrlInfoEntity urlEntity = urlRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("URL not found with ID: " + id));
        
        urlEntity.setName(urlRequest.getName());
        urlEntity.setUrl(urlRequest.getUrl());
        urlEntity.setType(urlRequest.getType());
        urlEntity.setActive(urlRequest.isActive());
        
        UrlInfoEntity updatedEntity = urlRepository.save(urlEntity);
        return mapToUrlResponse(updatedEntity);
    }
    
    public void deleteUrl(UUID id) {
        urlRepository.deleteById(id);
    }
    
    private UrlResponse mapToUrlResponse(UrlInfoEntity entity) {
        return UrlResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .url(entity.getUrl())
                .type(entity.getType())
                .isActive(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
} 