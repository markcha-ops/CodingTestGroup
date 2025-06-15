/**
 * Lecture List component - Displays all lectures in a list view
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InfoIcon from "@mui/icons-material/Info";
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from '@mui/icons-material/Assignment';

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

function LectureList() {
    const [lectures, setLectures] = useState([]);
    const [filteredLectures, setFilteredLectures] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const navigate = useNavigate();

    // 초기 강의 목록 가져오기
    useEffect(() => {
        fetchLectures();
    }, []);

    // 검색어가 변경될 때마다 강의 필터링
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredLectures(lectures);
        } else {
            const filtered = lectures.filter(lecture => 
                lecture.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (lecture.description && lecture.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredLectures(filtered);
        }
    }, [searchTerm, lectures]);

    // 강의 목록 가져오기
    const fetchLectures = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/lecture/all', { params: { activate: true } });
            setLectures(response.data || []);
            setFilteredLectures(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch lectures:', err);
            setError('강의 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 강의 클릭 시 상세 페이지로 이동
    const handleLectureClick = (lectureId) => {
        navigate('/lecture/detail', { state: { lectureId } });
    };

    // 시간 포맷 변환 함수
    const formatTimeFromISO = (isoString) => {
        try {
            if (!isoString) return '-';
            const date = new Date(isoString);
            return format(date, 'yyyy-MM-dd HH:mm');
        } catch (error) {
            console.error('Time format error:', error);
            return '-';
        }
    };

    // 자료 유무에 따른 아이콘 및 태그 표시
    const getLectureResourceTags = (lecture) => {
        const tags = [];
        
        if (lecture.hasPdf) {
            tags.push(
                <Chip 
                    key="pdf" 
                    icon={<DescriptionIcon />} 
                    label="PDF" 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ mr: 0.5 }} 
                />
            );
        }
        
        if (lecture.hasVideo) {
            tags.push(
                <Chip 
                    key="video" 
                    icon={<VideoLibraryIcon />} 
                    label="비디오" 
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                    sx={{ mr: 0.5 }} 
                />
            );
        }
        
        if (lecture.hasQuestions) {
            tags.push(
                <Chip 
                    key="questions" 
                    icon={<AssignmentIcon />} 
                    label="문제" 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                />
            );
        }
        
        return tags.length > 0 ? tags : null;
    };

    // 강의 활성화/비활성화
    const handleActivateToggle = async (lectureId, currentStatus) => {
        try {
            const endpoint = currentStatus ? 
                `/api/lecture/${lectureId}/deactivate` : 
                `/api/lecture/${lectureId}/activate`;
            
            await api.put(endpoint);
            
            // 강의 목록 상태 업데이트
            const updatedLectures = lectures.map(lecture => 
                lecture.id === lectureId 
                    ? { ...lecture, activate: !currentStatus }
                    : lecture
            );
            
            setLectures(updatedLectures);
            setFilteredLectures(updatedLectures.filter(lecture => 
                searchTerm.trim() === '' || 
                lecture.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (lecture.description && lecture.description.toLowerCase().includes(searchTerm.toLowerCase()))
            ));
            
            setSnackbar({
                open: true,
                message: currentStatus ? '강의가 비활성화되었습니다.' : '강의가 활성화되었습니다.',
                severity: 'success'
            });
        } catch (err) {
            console.error('Failed to toggle lecture status:', err);
            setSnackbar({
                open: true,
                message: '강의 상태 변경에 실패했습니다.',
                severity: 'error'
            });
        }
    };

    // 스낵바 닫기
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox pt={2} pb={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader 
                                title={
                                    <MDTypography variant="h5" fontWeight="medium">
                                        강의 목록
                                    </MDTypography>
                                }
                                action={
                                    <TextField
                                        placeholder="강의 검색..."
                                        variant="outlined"
                                        size="small"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ width: '250px' }}
                                    />
                                }
                            />
                            <CardContent>
                                {loading ? (
                                    <MDBox display="flex" justifyContent="center" p={3}>
                                        <CircularProgress />
                                    </MDBox>
                                ) : error ? (
                                    <MDBox display="flex" justifyContent="center" p={3}>
                                        <MDTypography variant="body2" color="error">
                                            {error}
                                        </MDTypography>
                                    </MDBox>
                                ) : filteredLectures.length === 0 ? (
                                    <MDBox display="flex" justifyContent="center" p={3}>
                                        <MDTypography variant="body2" color="text">
                                            검색 결과가 없습니다.
                                        </MDTypography>
                                    </MDBox>
                                ) : (
                                    <List sx={{ width: '100%' }}>
                                        {filteredLectures.map((lecture, index) => (
                                            <div key={lecture.id}>
                                                <ListItem 
                                                    sx={{ 
                                                        borderRadius: 1, 
                                                        '&:hover': { bgcolor: '#f5f5f5' },
                                                        py: 2
                                                    }}
                                                >
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item xs={12} md={6}>
                                                            <Box 
                                                                onClick={() => handleLectureClick(lecture.id)}
                                                                sx={{ cursor: 'pointer' }}
                                                            >
                                                                <MDTypography variant="h6" fontWeight="medium">
                                                                    {lecture.name}
                                                                </MDTypography>
                                                                {lecture.description && (
                                                                    <MDTypography variant="body2" color="text">
                                                                        {lecture.description}
                                                                    </MDTypography>
                                                                )}
                                                                <Box mt={1}>
                                                                    {getLectureResourceTags(lecture)}
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} md={3}>
                                                            <MDTypography variant="body2" color="text">
                                                                시작: {formatTimeFromISO(lecture.doAt)}
                                                            </MDTypography>
                                                            <MDTypography variant="body2" color="text">
                                                                종료: {formatTimeFromISO(lecture.theEnd)}
                                                            </MDTypography>
                                                        </Grid>
                                                        <Grid item xs={12} md={2}>
                                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                                <FormControlLabel
                                                                    control={
                                                                        <Switch
                                                                            checked={lecture.activate || false}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                handleActivateToggle(lecture.id, lecture.activate);
                                                                            }}
                                                                            color="primary"
                                                                            size="small"
                                                                        />
                                                                    }
                                                                    label={
                                                                        <MDTypography variant="caption" color="text">
                                                                            {lecture.activate ? '활성' : '비활성'}
                                                                        </MDTypography>
                                                                    }
                                                                    labelPlacement="top"
                                                                    sx={{ 
                                                                        m: 0,
                                                                        '& .MuiFormControlLabel-label': {
                                                                            fontSize: '0.75rem'
                                                                        }
                                                                    }}
                                                                />
                                                                <IconButton 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleLectureClick(lecture.id);
                                                                    }}
                                                                    color="primary"
                                                                    size="small"
                                                                >
                                                                    <ArrowForwardIcon />
                                                                </IconButton>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                                {index < filteredLectures.length - 1 && <Divider component="li" />}
                                            </div>
                                        ))}
                                    </List>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </MDBox>
            
            {/* 스낵바 - 상태 변경 알림 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
            
            <Footer />
        </DashboardLayout>
    );
}

export default LectureList; 