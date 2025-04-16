package com.anita.multipleauthapi.controller;

import com.anita.multipleauthapi.model.payload.UrlRequest;
import com.anita.multipleauthapi.model.payload.UrlResponse;
import com.anita.multipleauthapi.service.UrlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;

    @GetMapping
    public ResponseEntity<List<UrlResponse>> getAllUrls(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword) {
        
        // 타입만 지정된 경우 또는 타입과 키워드 모두 지정된 경우 필터링 수행
        // 키워드가 없으면 모든 URL 반환 (타입 필터만 적용)
        return ResponseEntity.ok(urlService.searchUrls(type, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UrlResponse> getUrlById(@PathVariable UUID id) {
        return ResponseEntity.ok(urlService.getUrlById(id));
    }

    @PostMapping
    public ResponseEntity<UrlResponse> createUrl(@RequestBody UrlRequest urlRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(urlService.createUrl(urlRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UrlResponse> updateUrl(@PathVariable UUID id, @RequestBody UrlRequest urlRequest) {
        return ResponseEntity.ok(urlService.updateUrl(id, urlRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUrl(@PathVariable UUID id) {
        urlService.deleteUrl(id);
        return ResponseEntity.noContent().build();
    }
} 