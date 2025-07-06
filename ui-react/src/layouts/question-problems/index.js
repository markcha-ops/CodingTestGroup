/**
 * Question Problems component - Read-only list of coding questions for students
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
import ListIcon from "@mui/icons-material/List";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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
import { useNavigate } from 'react-router-dom';

function QuestionProblems() {
    const navigate = useNavigate();
    
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [showAllQuestions, setShowAllQuestions] = useState(false);
    
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/questions/user');
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
            console.error('Failed to fetch questions:', err);
            setError('문제 목록을 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionClick = (questionId) => {
        // Navigate to the coding page to solve the problem
        navigate('/coding', { state: { questionId } });
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

    const questions = getFilteredQuestions();
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
                {/* Header with Date Navigation */}
                <MDBox mb={3}>
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                        <Grid item xs={12} md={6}>
                            <MDTypography variant="h4" fontWeight="medium">
                                코딩 문제
                            </MDTypography>
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
                    {questions.map((question) => (
                        <Grid item xs={12} key={question.id}>
                            <Card 
                                sx={{ 
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3
                                    },
                                    border: question.pass ? '2px solid #4CAF50' : '1px solid #e0e0e0'
                                }}
                                onClick={() => handleQuestionClick(question.id)}
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
                                            {showAllQuestions && (
                                                <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                                                    날짜: {question.doAt ? formatDate(question.doAt.split('T')[0]) : '날짜 미지정'}
                                                </MDTypography>
                                            )}
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

                {questions.length === 0 && !loading && (
                    <Card>
                        <CardContent>
                            <MDBox textAlign="center" py={6}>
                                <MDTypography variant="h6" color="text">
                                    {showAllQuestions 
                                        ? '등록된 문제가 없습니다.' 
                                        : currentDate 
                                            ? '해당 날짜에 등록된 문제가 없습니다.' 
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

export default QuestionProblems; 