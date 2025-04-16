package com.anita.multipleauthapi.model.payload;

import com.anita.multipleauthapi.model.entity.LectureEntity;
import com.anita.multipleauthapi.model.entity.QuestionEntity;
import com.anita.multipleauthapi.model.entity.UrlInfoEntity;
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
    private LectureEntity lecture;
    private UrlInfoEntity pdfUrl;
    private UrlInfoEntity videoUrl;
    private List<QuestionEntity> questions;
} 