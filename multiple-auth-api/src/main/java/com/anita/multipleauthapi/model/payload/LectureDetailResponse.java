package com.anita.multipleauthapi.model.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LectureDetailResponse {
    private LectureResponseDto lecture;
    private UrlInfoResponseDto pdfUrl;
    private UrlInfoResponseDto videoUrl;
    private List<QuestionResponseDto> questions;
} 