/**
 * Lecture Grading Management Page
 * Shows lectures by date and student grading status for selected lecture
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from '../../api';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

function LectureGrading() {
    const [lectures, setLectures] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [gradingData, setGradingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gradingLoading, setGradingLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all lectures on component mount
    useEffect(() => {
        fetchLectures();
    }, []);

    // Fetch lectures list
    const fetchLectures = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/lecture/all', { 
                params: { activate: false } 
            });
            
            // Sort lectures by date (newest first)
            const sortedLectures = (response.data || []).sort((a, b) => {
                return new Date(b.doAt) - new Date(a.doAt);
            });
            
            setLectures(sortedLectures);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch lectures:', err);
            setError('강의 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch grading data for a specific lecture
    const fetchGradingData = async (lectureId) => {
        setGradingLoading(true);
        try {
            const response = await api.get(`/api/lecture/grading/${lectureId}`);
            setGradingData(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch grading data:', err);
            setError('체점 현황을 불러오는데 실패했습니다.');
            setGradingData(null);
        } finally {
            setGradingLoading(false);
        }
    };

    // Handle lecture selection
    const handleLectureClick = (lecture) => {
        setSelectedLecture(lecture);
        fetchGradingData(lecture.id);
    };

    // Format date and time
    const formatDateTime = (dateString) => {
        if (!dateString) return '날짜 없음';
        try {
            return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
        } catch (e) {
            return '날짜 형식 오류';
        }
    };

    // Get score display
    const getScoreDisplay = (score) => {
        if (score === null || score === undefined) {
            return <Chip label="미제출" size="small" color="default" sx={{ minWidth: '70px' }} />;
        }
        
        const color = score === 100 ? "success" : score >= 50 ? "warning" : "error";
        return <Chip label={`${score}점`} size="small" color={color} sx={{ minWidth: '70px' }} />;
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox pt={6} pb={3}>
                <Grid container spacing={6}>
                    {/* Lectures List */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <MDBox
                                mx={2}
                                mt={-3}
                                py={3}
                                px={2}
                                variant="gradient"
                                bgColor="info"
                                borderRadius="lg"
                                coloredShadow="info"
                            >
                                <MDTypography variant="h6" color="white">
                                    강의 목록
                                </MDTypography>
                            </MDBox>
                            <CardContent>
                                {loading ? (
                                    <MDBox display="flex" justifyContent="center" p={3}>
                                        <CircularProgress />
                                    </MDBox>
                                ) : error && lectures.length === 0 ? (
                                    <Alert severity="error">{error}</Alert>
                                ) : lectures.length === 0 ? (
                                    <MDTypography variant="body2" color="text" textAlign="center" py={2}>
                                        등록된 강의가 없습니다.
                                    </MDTypography>
                                ) : (
                                    <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                                        {lectures.map((lecture) => (
                                            <div key={lecture.id}>
                                                <ListItem
                                                    button
                                                    selected={selectedLecture?.id === lecture.id}
                                                    onClick={() => handleLectureClick(lecture)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                        },
                                                        '&.Mui-selected': {
                                                            backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(33, 150, 243, 0.12)'
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={lecture.name}
                                                        secondary={
                                                            <>
                                                                <div>{formatDateTime(lecture.doAt)}</div>
                                                                <div style={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                                                    {lecture.description || '설명 없음'}
                                                                </div>
                                                            </>
                                                        }
                                                    />
                                                </ListItem>
                                                <Divider />
                                            </div>
                                        ))}
                                    </List>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Grading Status Table */}
                    <Grid item xs={12} md={8}>
                        <Card>
                            <MDBox
                                mx={2}
                                mt={-3}
                                py={3}
                                px={2}
                                variant="gradient"
                                bgColor="success"
                                borderRadius="lg"
                                coloredShadow="success"
                            >
                                <MDTypography variant="h6" color="white">
                                    {selectedLecture ? `${selectedLecture.name} - 학생별 체점 현황` : '체점 현황'}
                                </MDTypography>
                            </MDBox>
                            <CardContent>
                                {!selectedLecture ? (
                                    <MDBox display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                                        <MDTypography variant="body2" color="text">
                                            좌측에서 강의를 선택하세요
                                        </MDTypography>
                                    </MDBox>
                                ) : gradingLoading ? (
                                    <MDBox display="flex" justifyContent="center" p={3}>
                                        <CircularProgress />
                                    </MDBox>
                                ) : error && !gradingData ? (
                                    <Alert severity="error">{error}</Alert>
                                ) : !gradingData ? (
                                    <MDTypography variant="body2" color="text" textAlign="center" py={2}>
                                        데이터를 불러올 수 없습니다.
                                    </MDTypography>
                                ) : gradingData.questions.length === 0 ? (
                                    <MDTypography variant="body2" color="text" textAlign="center" py={2}>
                                        이 강의에 연결된 문제가 없습니다.
                                    </MDTypography>
                                ) : gradingData.studentGradings.length === 0 ? (
                                    <MDTypography variant="body2" color="text" textAlign="center" py={2}>
                                        코스에 등록된 학생이 없습니다.
                                    </MDTypography>
                                ) : (
                                    <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
                                        <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell 
                                                        sx={{ 
                                                            fontWeight: 'bold', 
                                                            backgroundColor: '#f5f5f5',
                                                            width: '25%',
                                                            minWidth: 250,
                                                            position: 'sticky',
                                                            left: 0,
                                                            zIndex: 2,
                                                            padding: '16px'
                                                        }}
                                                    >
                                                        학생
                                                    </TableCell>
                                                    {gradingData.questions.map((question, index) => (
                                                        <TableCell 
                                                            key={question.id}
                                                            align="center"
                                                            sx={{ 
                                                                fontWeight: 'bold', 
                                                                backgroundColor: '#f5f5f5',
                                                                minWidth: 150,
                                                                padding: '16px'
                                                            }}
                                                        >
                                                            {`문제 ${index + 1}`}
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                                                                {question.title}
                                                            </div>
                                                        </TableCell>
                                                    ))}
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ 
                                                            fontWeight: 'bold', 
                                                            backgroundColor: '#f5f5f5',
                                                            minWidth: 120,
                                                            padding: '16px'
                                                        }}
                                                    >
                                                        평균
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {gradingData.studentGradings.map((studentGrading) => {
                                                    // Calculate average score for this student
                                                    const scores = gradingData.questions.map(q => 
                                                        studentGrading.scores[q.id]
                                                    ).filter(s => s !== null && s !== undefined);
                                                    
                                                    const average = scores.length > 0
                                                        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                                                        : null;

                                                    return (
                                                        <TableRow key={studentGrading.student.id}>
                                            <TableCell 
                                                sx={{ 
                                                    fontWeight: 'medium',
                                                    position: 'sticky',
                                                    left: 0,
                                                    backgroundColor: 'white',
                                                    zIndex: 1,
                                                    width: '25%',
                                                    minWidth: 250,
                                                    padding: '16px'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '0.95rem' }}>
                                                        {studentGrading.student.name || '-'}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '4px' }}>
                                                        {studentGrading.student.firstname || '-'} {studentGrading.student.lastname || '-'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'gray' }}>
                                                        {studentGrading.student.email || '-'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                                            {gradingData.questions.map((question) => (
                                                                <TableCell 
                                                                    key={question.id} 
                                                                    align="center"
                                                                    sx={{ 
                                                                        minWidth: 150,
                                                                        padding: '16px'
                                                                    }}
                                                                >
                                                                    {getScoreDisplay(studentGrading.scores[question.id])}
                                                                </TableCell>
                                                            ))}
                                                            <TableCell 
                                                                align="center"
                                                                sx={{ 
                                                                    minWidth: 120,
                                                                    padding: '16px'
                                                                }}
                                                            >
                                                                {average !== null ? (
                                                                    <Chip 
                                                                        label={`${average}점`} 
                                                                        size="small" 
                                                                        color={average === 100 ? "success" : average >= 50 ? "info" : "default"}
                                                                        sx={{ fontWeight: 'bold', minWidth: '60px' }}
                                                                    />
                                                                ) : (
                                                                    <Chip label="-" size="small" color="default" sx={{ minWidth: '60px' }} />
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default LectureGrading;

