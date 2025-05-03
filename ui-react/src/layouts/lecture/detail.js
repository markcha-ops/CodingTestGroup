/**
 * Lecture Detail component - Shows detailed information about a specific lecture
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LaunchIcon from "@mui/icons-material/Launch";
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from "@mui/icons-material/Description";
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListIcon from '@mui/icons-material/List';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from '../../api';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import Embed from 'react-embed';
import parse from 'html-react-parser';

function LectureDetail() {
    const location = useLocation();
    const lectureId = location.state?.lectureId;
    const navigate = useNavigate();
    const [lecture, setLecture] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeEmbeddedContent, setActiveEmbeddedContent] = useState('pdf'); // 'pdf' or 'video'

    // 강의 ID에 따른 Gamma URL 매핑
    const getGammaUrlForLecture = (id) => {
        // 예시 매핑: 실제 데이터에 맞게 수정 필요
        const urlMapping = {
            '1': 'https://gamma.app/embed/xux9doraiuy4jtm', // 관계형 데이터베이스 개념
            '2': 'https://gamma.app/embed/another-id',      // 예시 URL
            '3': 'https://gamma.app/embed/third-lecture',   // 예시 URL
            // 다른 강의 ID도 필요에 따라 추가
        };
        
        // 매핑된 URL이 있으면 반환, 없으면 기본 URL 반환
        return urlMapping[id] || 'https://gamma.app/embed/xux9doraiuy4jtm';
    };
    
    // 강의 ID에 따른 Gamma 컨텐츠 제목 매핑
    const getGammaTitleForLecture = (id) => {
        // 예시 매핑: 실제 데이터에 맞게 수정 필요
        const titleMapping = {
            '1': '관계형 데이터베이스 개념',
            '2': '자바 프로그래밍 기초',
            '3': '알고리즘 기초',
            // 다른 강의 ID도 필요에 따라 추가
        };
        
        // 매핑된 제목이 있으면 반환, 없으면 기본 제목 반환
        return titleMapping[id] || '강의 자료';
    };

    useEffect(() => {
        const fetchLectureData = async () => {
            setLoading(true);
            try {
                if (!lectureId) {
                    setError('강의 ID가 없습니다. 강의 목록으로 돌아가 다시 시도해주세요.');
                    setLoading(false);
                    return;
                }
                
                const response = await api.get(`/api/lecture/detail/${lectureId}`);
                
                // 응답 구조를 admin-detail.js 기준으로 처리
                if (response.data && response.data.lecture) {
                    setLecture(response.data.lecture);
                    
                    // PDF 자료 설정
                    if (response.data.pdfUrl && response.data.pdfUrl.url) {
                        setPdfUrl(response.data.pdfUrl.url);
                        setActiveEmbeddedContent('pdf');
                    }
                    
                    // 영상 자료 설정
                    if (response.data.videoUrl && response.data.videoUrl.url) {
                        setVideoUrl(response.data.videoUrl.url);
                        if (!response.data.pdfUrl || !response.data.pdfUrl.url) {
                            setActiveEmbeddedContent('video');
                        }
                    }
                    
                    // 문제 목록 설정
                    if (response.data.questions && Array.isArray(response.data.questions)) {
                        setProblems(response.data.questions.map(q => ({
                            id: q.id,
                            title: q.title,
                            description: q.content,
                            language: q.language
                        })));
                    }
                } else {
                    // 기존 응답 구조 처리 (하위 호환성 유지)
                    setLecture(response.data);
                }
                
                setError(null);
            } catch (err) {
                console.error('Failed to fetch lecture details:', err);
                setError('강의 정보를 가져오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchLectureData();
    }, [lectureId]);

    const handleBack = () => {
        navigate('/lecture');
    };

    // 시간 포맷 변환 함수 (ISO 형식에서 HH:mm 형식으로)
    const formatTimeFromISO = (isoString) => {
        try {
            if (!isoString) return '';
            return isoString.split('T')[1].substring(0, 5);
        } catch (error) {
            console.error('시간 포맷 변환 실패:', error);
            return isoString;
        }
    };

    // 날짜 포맷 변환 함수 (ISO 형식에서 YYYY년 MM월 DD일 형식으로)
    const formatDateFromISO = (isoString) => {
        try {
            if (!isoString) return '';
            const date = new Date(isoString);
            return format(date, 'yyyy년 MM월 dd일');
        } catch (error) {
            console.error('날짜 포맷 변환 실패:', error);
            return isoString;
        }
    };

    // URL 처리 함수 추가
    const getEmbedUrl = (url) => {
        if (!url) return '';
        
        // gamma.app URL인 경우 하드코딩된 방식으로 처리
        if (url.includes('gamma.app')) {
            // URL에서 embed ID 추출
            const match = url.match(/gamma\.app\/(docs|embed)\/([a-zA-Z0-9]+)/);
            if (match && match[2]) {
                return `https://gamma.app/embed/${match[2]}`;
            }
        }
        
        // YouTube URL 처리
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return getYoutubeEmbedUrl(url);
        }
        
        return url; // 그 외 URL은 그대로 반환
    };

    // YouTube URL에서 임베드 가능한 URL로 변환하는 함수
    const getYoutubeEmbedUrl = (url) => {
        if (!url) return '';
        
        // YouTube URL 형식 확인 (예: https://www.youtube.com/watch?v=VIDEO_ID)
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(youtubeRegex);
        
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
        
        return url; // 변환할 수 없는 경우 원래 URL 반환
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={2} mb={3}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={handleBack} 
                    sx={{ mb: 2 }}
                >
                    강의 목록으로 돌아가기
                </Button>

                {loading ? (
                    <Card>
                        <CardContent>
                            <MDTypography variant="body2" color="text" textAlign="center" py={4}>
                                강의 정보를 불러오는 중...
                            </MDTypography>
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Card>
                        <CardContent>
                            <MDTypography variant="body2" color="error" textAlign="center" py={4}>
                                {error}
                            </MDTypography>
                        </CardContent>
                    </Card>
                ) : lecture ? (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card>
                                <CardHeader 
                                    title={
                                        <MDTypography variant="h4" fontWeight="medium" py={1}>
                                            {lecture.name}
                                        </MDTypography>
                                    } 
                                    sx={{ px: 3 }}
                                />
                                <CardContent>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <MDTypography variant="h6" color="text" gutterBottom>
                                                날짜 및 시간
                                            </MDTypography>
                                            <MDBox sx={{ 
                                                p: 2, 
                                                borderRadius: '8px', 
                                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                                mb: 2
                                            }}>
                                                <MDTypography variant="body1" fontWeight="medium">
                                                    {formatDateFromISO(lecture.doAt)}
                                                </MDTypography>
                                                <MDTypography variant="body2" color="text">
                                                    {formatTimeFromISO(lecture.doAt)} - {formatTimeFromISO(lecture.theEnd)}
                                                </MDTypography>
                                            </MDBox>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <MDTypography variant="h6" color="text" gutterBottom>
                                                강의 설명
                                            </MDTypography>
                                            <MDBox sx={{ 
                                                p: 2, 
                                                borderRadius: '8px', 
                                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                                height: '100%',
                                                minHeight: '120px'
                                            }}>
                                                <MDTypography variant="body1" component="div">
                                                    {lecture.description || '설명이 없습니다.'}
                                                </MDTypography>
                                            </MDBox>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        {(pdfUrl || videoUrl) && (
                            <Grid item xs={12}>
                                <Card>
                                    <CardHeader 
                                        title={
                                            <MDBox display="flex" justifyContent="space-between" alignItems="center">
                                                <MDTypography variant="h5" fontWeight="medium">
                                                    강의 자료
                                                </MDTypography>
                                                <MDBox>
                                                    {pdfUrl && (
                                                        <MDButton 
                                                            variant={activeEmbeddedContent === 'pdf' ? "contained" : "outlined"}
                                                            color="info"
                                                            startIcon={<DescriptionIcon />}
                                                            onClick={() => setActiveEmbeddedContent('pdf')}
                                                            sx={{ mr: 1 }}
                                                            size="small"
                                                        >
                                                            PDF 자료
                                                        </MDButton>
                                                    )}
                                                    {videoUrl && (
                                                        <MDButton 
                                                            variant={activeEmbeddedContent === 'video' ? "contained" : "outlined"}
                                                            color="info"
                                                            startIcon={<VideoLibraryIcon />}
                                                            onClick={() => setActiveEmbeddedContent('video')}
                                                            size="small"
                                                        >
                                                            영상 자료
                                                        </MDButton>
                                                    )}
                                                </MDBox>
                                            </MDBox>
                                        }
                                    />
                                    <CardContent>
                                        {activeEmbeddedContent === 'pdf' && pdfUrl && (
                                            <MDBox>
                                                <MDBox display="flex" justifyContent="flex-end" mb={1}>
                                                    <MDButton
                                                        variant="text"
                                                        color="info"
                                                        href={pdfUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        startIcon={<LaunchIcon />}
                                                        size="small"
                                                    >
                                                        새 탭에서 열기
                                                    </MDButton>
                                                </MDBox>
                                                <MDBox sx={{ 
                                                    height: '750px', 
                                                    width: '100%',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden'
                                                }}>
                                                    {/* 
                                                      * CORS 문제 해결을 위해 gamma.app URL을 하드코딩합니다.
                                                      * 강의 ID에 따라 다른 URL을 표시합니다.
                                                      */}
                                                    {parse(`<iframe 
                                                        src="${pdfUrl}"
                                                        width="100%"
                                                        height="600px"
                                                        id="gamma-embed"
                                                        class="gamma-embed"
                                                        style="display:block;position:relative;" 
                                                        allowfullscreen
                                                        frameborder="0"
                                                    ></iframe>`)}
                                                </MDBox>
                                            </MDBox>
                                        )}
                                        
                                        {activeEmbeddedContent === 'video' && videoUrl && (
                                            <MDBox>
                                                <MDBox display="flex" justifyContent="flex-end" mb={1}>
                                                    <MDButton
                                                        variant="text"
                                                        color="info"
                                                        href={videoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        startIcon={<LaunchIcon />}
                                                        size="small"
                                                    >
                                                        새 탭에서 열기
                                                    </MDButton>
                                                </MDBox>
                                                <MDBox sx={{ 
                                                    height: '650px', 
                                                    width: '100%',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <iframe 
                                                        src={getYoutubeEmbedUrl(videoUrl)} 
                                                        style={{ width: '100%', maxWidth: '100%', height: '100%' }}
                                                        allow="fullscreen"
                                                        title="강의 영상"
                                                    />
                                                </MDBox>
                                            </MDBox>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                        
                    </Grid>
                ) : (
                    <Card>
                        <CardContent>
                            <MDTypography variant="body2" color="error" textAlign="center" py={4}>
                                강의 정보를 찾을 수 없습니다.
                            </MDTypography>
                        </CardContent>
                    </Card>
                )}
            </MDBox>
            
            {/* 연결된 문제 리스트 */}
            {lecture && problems && problems.length > 0 && (
                <Card sx={{ mt: 3 }}>
                    <CardHeader
                        title={
                            <MDBox display="flex" alignItems="center">
                                <AssignmentIcon sx={{ mr: 1 }} />
                                <MDTypography variant="h5" fontWeight="medium">
                                    연결된 문제 ({problems.length})
                                </MDTypography>
                            </MDBox>
                        }
                    />
                    <CardContent>
                        <Grid container spacing={2}>
                            {problems.map((problem, index) => (
                                <Grid item xs={12} md={6} key={problem.id}>
                                    <MDBox 
                                        sx={{ 
                                            p: 2,
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            },
                                            transition: 'all 0.2s ease-in-out',
                                            display: 'flex',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigate(`/coding`, { state: { questionId: problem.id } })}
                                    >
                                        <MDBox>
                                            <MDTypography variant="h6" fontWeight="medium">
                                                {index + 1}. {problem.title}
                                            </MDTypography>
                                            <MDBox display="flex" alignItems="center" mt={0.5}>
                                                <MDBox 
                                                    component="span" 
                                                    sx={{ 
                                                        px: 1, 
                                                        py: 0.3, 
                                                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    {problem.language}
                                                </MDBox>
                                                <MDTypography variant="caption" color="text" sx={{ ml: 1 }}>
                                                    문제 보기 →
                                                </MDTypography>
                                            </MDBox>
                                        </MDBox>
                                    </MDBox>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            )}
            <Footer />
        </DashboardLayout>
    );
}

export default LectureDetail; 