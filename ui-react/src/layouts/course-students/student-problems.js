/**
 * Student Problems component - Shows specific student's coding problems progress
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CodeIcon from "@mui/icons-material/Code";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonIcon from "@mui/icons-material/Person";
import ListIcon from "@mui/icons-material/List";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from '../../api';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function StudentProblems() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get student information from location state
    const studentInfo = location.state?.student;
    const userId = studentInfo?.userId || studentInfo?.id;
    
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [showAllQuestions, setShowAllQuestions] = useState(false);
    
    useEffect(() => {
        if (userId) {
            fetchStudentQuestions();
        } else {
            setError('학생 정보를 찾을 수 없습니다.');
        }
    }, [userId]);

    const fetchStudentQuestions = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/questions/user/${userId}`);
            setAllQuestions(response.data);
            
            // Group questions by date and find the closest future date
            // Filter out questions with null doAt
            const questionsWithDates = response.data.filter(q => q.doAt != null);
            const dates = [...new Set(questionsWithDates.map(q => q.doAt.split('T')[0]))].sort();
            setAvailableDates(dates);
            
            // Find the closest future date to today
            if (dates.length > 0) {
                const today = new Date().toISOString().split('T')[0];
                const futureDate = dates.find(date => date >= today) || dates[dates.length - 1];
                setCurrentDate(futureDate);
            } else {
                setCurrentDate(null);
            }
            
            setError(null);
        } catch (err) {
            console.error('Failed to fetch student questions:', err);
            setError('학생의 문제 목록을 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (level) => {
        if (level <= 3) return 'success';
        if (level <= 7) return 'warning';
        if (level <= 10) return 'error';
        return 'secondary';
    };

    const getDifficultyLabel = (level) => {
        if (level <= 3) return '쉬움';
        if (level <= 7) return '보통';
        if (level <= 10) return '어려움';
        return '매우 어려움';
    };

    const getStudentName = (student) => {
        if (!student) return '알 수 없는 학생';
        if (student.firstname && student.lastname) {
            return `${student.firstname} ${student.lastname}`;
        }
        return student.email?.split('@')[0] || '이름 없음';
    };

    const handleBack = () => {
        navigate('/course-students');
    };

    const handlePreviousDate = () => {
        if (!currentDate || availableDates.length === 0) return;
        const currentIndex = availableDates.indexOf(currentDate);
        if (currentIndex > 0) {
            setCurrentDate(availableDates[currentIndex - 1]);
        }
    };

    const handleNextDate = () => {
        if (!currentDate || availableDates.length === 0) return;
        const currentIndex = availableDates.indexOf(currentDate);
        if (currentIndex < availableDates.length - 1) {
            setCurrentDate(availableDates[currentIndex + 1]);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    // Filter questions based on current view mode
    const getFilteredQuestions = () => {
        if (showAllQuestions) {
            return allQuestions;
        }
        // If no current date is set, show all questions
        if (!currentDate) {
            return allQuestions;
        }
        // Filter questions by current date, handle null doAt values
        return allQuestions.filter(q => q.doAt != null && q.doAt.split('T')[0] === currentDate);
    };

    // Group questions by lectureName
    const groupQuestionsByLecture = (questions) => {
        const grouped = {};
        questions.forEach(question => {
            const lectureName = question.lectureName || '강의명 없음';
            if (!grouped[lectureName]) {
                grouped[lectureName] = [];
            }
            grouped[lectureName].push(question);
        });
        return grouped;
    };

    const questions = getFilteredQuestions();
    const groupedByLecture = groupQuestionsByLecture(questions);
    const totalQuestions = questions.length;
    const passedQuestions = questions.filter(q => q.pass).length;

    if (loading) {
        return (
            <DashboardLayout>
                <DashboardNavbar />
                <MDBox mt={2} mb={3} display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress size={60} />
                </MDBox>
                <Footer />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={2} mb={3}>
                {/* Header Section */}
                <MDBox mb={3}>
                    <MDButton 
                        startIcon={<ArrowBackIcon />} 
                        onClick={handleBack}
                        sx={{ mb: 2 }}
                    >
                        학생 관리로 돌아가기
                    </MDButton>
                    
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                        <Grid item xs={12} md={6}>
                            <MDBox display="flex" alignItems="center">
                                <PersonIcon sx={{ mr: 1, fontSize: 28 }} color="primary" />
                                <MDTypography variant="h4" fontWeight="medium">
                                    {getStudentName(studentInfo)} - 문제 풀이 현황
                                </MDTypography>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MDBox display="flex" justifyContent="flex-end" gap={1}>
                                <MDButton
                                    variant={showAllQuestions ? "contained" : "outlined"}
                                    color="info"
                                    size="small"
                                    startIcon={<ListIcon />}
                                    onClick={() => setShowAllQuestions(!showAllQuestions)}
                                >
                                    전체 문제
                                </MDButton>
                                {!showAllQuestions && availableDates.length > 0 && (
                                    <>
                                        <MDButton
                                            variant="outlined"
                                            color="secondary"
                                            size="small"
                                            startIcon={<ArrowBackIcon />}
                                            onClick={handlePreviousDate}
                                            disabled={!currentDate || availableDates.indexOf(currentDate) === 0}
                                        >
                                            이전
                                        </MDButton>
                                        <MDButton
                                            variant="outlined"
                                            color="secondary"
                                            size="small"
                                            endIcon={<ArrowForwardIcon />}
                                            onClick={handleNextDate}
                                            disabled={!currentDate || availableDates.indexOf(currentDate) === availableDates.length - 1}
                                        >
                                            다음
                                        </MDButton>
                                    </>
                                )}
                            </MDBox>
                        </Grid>
                    </Grid>
                </MDBox>

                {/* Date Display */}
                {!showAllQuestions && (
                    <MDBox mb={3} textAlign="center">
                        <Card sx={{ backgroundColor: '#f5f5f5' }}>
                            <CardContent sx={{ py: 2 }}>
                                <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
                                    <CalendarTodayIcon color="primary" />
                                    <MDTypography variant="h5" fontWeight="medium" color="primary">
                                        {currentDate ? formatDate(currentDate) : '날짜 미지정'}
                                    </MDTypography>
                                </MDBox>
                            </CardContent>
                        </Card>
                    </MDBox>
                )}

                {/* View Mode Display */}
                {showAllQuestions && (
                    <MDBox mb={3} textAlign="center">
                        <Card sx={{ backgroundColor: '#e3f2fd' }}>
                            <CardContent sx={{ py: 2 }}>
                                <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
                                    <ListIcon color="info" />
                                    <MDTypography variant="h5" fontWeight="medium" color="info">
                                        전체 문제 목록
                                    </MDTypography>
                                </MDBox>
                            </CardContent>
                        </Card>
                    </MDBox>
                )}
                
                {error && (
                    <MDAlert color="warning" my={2}>
                        {error}
                    </MDAlert>
                )}

                {/* Student Info Card */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <MDTypography variant="h6" color="text">
                                    학생 이메일: <strong>{studentInfo?.email || '정보 없음'}</strong>
                                </MDTypography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <MDTypography variant="h6" color="text">
                                    상태: <strong>{studentInfo?.status === 'APPROVED' ? '승인됨' : studentInfo?.status || '정보 없음'}</strong>
                                </MDTypography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <MDTypography variant="h6" color="text">
                                    사용자 ID: <strong>{userId || '정보 없음'}</strong>
                                </MDTypography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Statistics Card */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <MDTypography variant="h6" color="text">
                                    총 문제 개수: <strong>{totalQuestions}개</strong>
                                </MDTypography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <MDTypography variant="h6" color="text">
                                    통과한 문제: <strong style={{ color: '#4CAF50' }}>{passedQuestions}개</strong>
                                </MDTypography>
                            </Grid>
                            <Grid item xs={12}>
                                <MDTypography variant="body2" color="text">
                                    진행률: {totalQuestions > 0 ? Math.round((passedQuestions / totalQuestions) * 100) : 0}%
                                </MDTypography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Questions List */}
                <Grid container spacing={3}>
                    {showAllQuestions ? (
                        // All questions mode: show individual questions with lecture names
                        questions.map((question) => (
                            <Grid item xs={12} key={question.id}>
                                <Card 
                                    sx={{ 
                                        border: question.pass ? '2px solid #4CAF50' : '1px solid #e0e0e0'
                                    }}
                                >
                                    <CardContent>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} md={8}>
                                                <MDBox display="flex" alignItems="center" mb={1}>
                                                    {question.pass ? (
                                                        <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                                                    ) : (
                                                        <RadioButtonUncheckedIcon sx={{ color: '#9e9e9e', mr: 1 }} />
                                                    )}
                                                    <MDTypography variant="h6" fontWeight="medium">
                                                        {question.title}
                                                    </MDTypography>
                                                </MDBox>
                                                <MDTypography variant="body2" color="text" sx={{ mb: 2 }}>
                                                    {question.content.length > 100 
                                                        ? question.content.substring(0, 100) + '...' 
                                                        : question.content}
                                                </MDTypography>
                                                <MDBox>
                                                    <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                                                        강의: {question.lectureName || '강의명 없음'}
                                                    </MDTypography>
                                                    <br />
                                                    <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                                                        날짜: {question.doAt ? formatDate(question.doAt.split('T')[0]) : '날짜 미지정'}
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <MDBox display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                                                    <Chip 
                                                        label={question.language}
                                                        variant="outlined"
                                                        size="small"
                                                        icon={<CodeIcon />}
                                                    />
                                                    <Chip 
                                                        label={`${question.lv}lv - ${getDifficultyLabel(question.lv)}`}
                                                        color={getDifficultyColor(question.lv)}
                                                        size="small"
                                                    />
                                                    {question.pass && (
                                                        <Chip 
                                                            label="통과"
                                                            color="success"
                                                            size="small"
                                                            variant="filled"
                                                        />
                                                    )}
                                                </MDBox>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        // Date-specific mode: group by lecture name
                        Object.entries(groupedByLecture).map(([lectureName, lectureQuestions]) => (
                            <Grid item xs={12} key={lectureName}>
                                <Accordion defaultExpanded>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                    >
                                        <MDBox display="flex" alignItems="center" gap={1}>
                                            <SchoolIcon />
                                            <MDTypography variant="h6" fontWeight="medium">
                                                {lectureName}
                                            </MDTypography>
                                            <Chip 
                                                label={`${lectureQuestions.length}개 문제`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ ml: 1 }}
                                            />
                                        </MDBox>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {lectureQuestions.map((question) => (
                                                <Grid item xs={12} key={question.id}>
                                                    <Card 
                                                        sx={{ 
                                                            border: question.pass ? '2px solid #4CAF50' : '1px solid #e0e0e0'
                                                        }}
                                                    >
                                                        <CardContent>
                                                            <Grid container spacing={2} alignItems="center">
                                                                <Grid item xs={12} md={8}>
                                                                    <MDBox display="flex" alignItems="center" mb={1}>
                                                                        {question.pass ? (
                                                                            <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                                                                        ) : (
                                                                            <RadioButtonUncheckedIcon sx={{ color: '#9e9e9e', mr: 1 }} />
                                                                        )}
                                                                        <MDTypography variant="h6" fontWeight="medium">
                                                                            {question.title}
                                                                        </MDTypography>
                                                                    </MDBox>
                                                                    <MDTypography variant="body2" color="text" sx={{ mb: 2 }}>
                                                                        {question.content.length > 100 
                                                                            ? question.content.substring(0, 100) + '...' 
                                                                            : question.content}
                                                                    </MDTypography>
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                    <MDBox display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                                                                        <Chip 
                                                                            label={question.language}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            icon={<CodeIcon />}
                                                                        />
                                                                        <Chip 
                                                                            label={`${question.lv}lv - ${getDifficultyLabel(question.lv)}`}
                                                                            color={getDifficultyColor(question.lv)}
                                                                            size="small"
                                                                        />
                                                                        {question.pass && (
                                                                            <Chip 
                                                                                label="통과"
                                                                                color="success"
                                                                                size="small"
                                                                                variant="filled"
                                                                            />
                                                                        )}
                                                                    </MDBox>
                                                                </Grid>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        ))
                    )}
                </Grid>

                {questions.length === 0 && !loading && (
                    <Card>
                        <CardContent>
                            <MDBox textAlign="center" py={6}>
                                <MDTypography variant="h6" color="text">
                                    {showAllQuestions 
                                        ? '이 학생에게 할당된 문제가 없습니다.' 
                                        : currentDate 
                                            ? '해당 날짜에 할당된 문제가 없습니다.' 
                                            : '날짜가 설정된 문제가 없습니다.'}
                                </MDTypography>
                            </MDBox>
                        </CardContent>
                    </Card>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default StudentProblems; 