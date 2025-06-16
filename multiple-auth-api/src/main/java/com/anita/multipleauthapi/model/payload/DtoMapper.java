package com.anita.multipleauthapi.model.payload;

import com.anita.multipleauthapi.model.entity.LectureEntity;
import com.anita.multipleauthapi.model.entity.QuestionEntity;
import com.anita.multipleauthapi.model.entity.UrlInfoEntity;

import java.util.List;
import java.util.stream.Collectors;

public class DtoMapper {
    
    public static LectureResponseDto toLectureResponseDto(LectureEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return LectureResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .isActive(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .doAt(entity.getDoAt())
                .theEnd(entity.getTheEnd())
                .build();
    }
    
    public static UrlInfoResponseDto toUrlInfoResponseDto(UrlInfoEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return UrlInfoResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .isActive(entity.isActive())
                .url(entity.getUrl())
                .type(entity.getType())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    public static QuestionResponseDto toQuestionResponseDto(QuestionEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return QuestionResponseDto.builder()
                .id(entity.getId())
                .isCompare(entity.getIsCompare())
                .compareCode(entity.getCompareCode())
                .isActive(entity.getIsActive())
                .title(entity.getTitle())
                .content(entity.getContent())
                .language(entity.getLanguage())
                .lv(entity.getLv())
                .answer(entity.getAnswer())
                .initialCode(entity.getInitialCode())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .pass(entity.getPass())
                .build();
    }
    
    public static List<QuestionResponseDto> toQuestionResponseDtoList(List<QuestionEntity> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(DtoMapper::toQuestionResponseDto)
                .collect(Collectors.toList());
    }
    
    public static LectureDetailResponse toLectureDetailResponse(
            LectureEntity lecture,
            UrlInfoEntity pdfUrl,
            UrlInfoEntity videoUrl,
            List<QuestionEntity> questions) {
        
        return LectureDetailResponse.builder()
                .lecture(toLectureResponseDto(lecture))
                .pdfUrl(toUrlInfoResponseDto(pdfUrl))
                .videoUrl(toUrlInfoResponseDto(videoUrl))
                .questions(toQuestionResponseDtoList(questions))
                .build();
    }
} 