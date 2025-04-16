/**
 * Admin Lecture List component - Shows a list of lectures with management capabilities
 */

// @mui material components
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from '../../api';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

function LectureAdmin() {
    const location = useLocation();
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [filteredLectures, setFilteredLectures] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeletingLecture, setIsDeletingLecture] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDateFiltered, setIsDateFiltered] = useState(false);
    const [eventData, setEventData] = useState({
        name: '',
        startTime: '09:00',
        endTime: '10:30',
        description: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    
    const locales = {
        'ko': ko,
    };

    const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

    useEffect(() => {
        // 상태 메시지가 있으면 알림 표시
        if (location.state?.message) {
            setAlertMessage(location.state.message);
            setAlertSeverity(location.state.severity || 'success');
            setAlertOpen(true);
            
            // 상태 정리 (메시지를 한 번만 표시하기 위해)
            navigate(location.pathname, { replace: true }); 
        }
        
        fetchAllLectures();
    }, [location, navigate]);

    useEffect(() => {
        // 검색어가 변경될 때마다 필터링
        let filtered = lectures;
        
        // 날짜 필터링 적용
        if (isDateFiltered) {
            const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
            filtered = filtered.filter(lecture => {
                const lectureDate = format(new Date(lecture.doAt), 'yyyy-MM-dd');
                return lectureDate === selectedDateStr;
            });
        }
        
        // 검색어 필터링 적용
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(lecture => 
                lecture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lecture.description && lecture.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        setFilteredLectures(filtered);
    }, [searchTerm, lectures, selectedDate, isDateFiltered]);

    const fetchAllLectures = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/lecture/all', {
                params: {
                    activate: false
                }
            });
            
            // 강의를 날짜 기준으로 정렬 (최신순)
            const sortedLectures = response.data.sort((a, b) => {
                return new Date(b.doAt) - new Date(a.doAt);
            });
            
            setLectures(sortedLectures);
            setFilteredLectures(sortedLectures);
        } catch (error) {
            console.error('강의 목록 조회 실패:', error);
            setAlertMessage('강의 목록을 불러오는데 실패했습니다.');
            setAlertSeverity('error');
            setAlertOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectSlot = (slotInfo) => {
        setSelectedDate(slotInfo.start);
        setIsDateFiltered(true);
        
        // 날짜 선택 알림
        const formattedDate = format(slotInfo.start, 'yyyy년 MM월 dd일');
        setAlertMessage(`${formattedDate} 강의를 표시합니다.`);
        setAlertSeverity('info');
        setAlertOpen(true);
    };

    const handleOpenForm = () => {
        setEventData({
            name: '',
            startTime: '09:00',
            endTime: '10:30',
            description: ''
        });
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData({
            ...eventData,
            [name]: value
        });
    };

    const handleSubmitForm = async () => {
        if (!eventData.name) {
            setAlertMessage('강의명은 필수입니다.');
            setAlertSeverity('error');
            setAlertOpen(true);
            return;
        }
        
        try {
            // 선택된 날짜 형식 변환 (YYYY-MM-DD)
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            
            // 날짜와 시간 결합하여 ISO-8601 형식 생성
            const startDateTime = `${formattedDate}T${eventData.startTime}:00`;
            const endDateTime = `${formattedDate}T${eventData.endTime}:00`;
            
            // API 요청
            const response = await api.post('/api/lecture', {
                name: eventData.name,
                doAt: startDateTime,
                theEnd: endDateTime,
                description: eventData.description
            });
            
            // 성공 시 처리
            setAlertMessage('강의가 성공적으로 생성되었습니다.');
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // 폼 초기화 및 닫기
            setEventData({
                name: '',
                startTime: '09:00',
                endTime: '10:30',
                description: ''
            });
            setOpenForm(false);
            
            // 강의가 생성된 후 목록 다시 불러오기
            fetchAllLectures();
        } catch (error) {
            console.error('강의 생성 실패:', error);
            setAlertMessage('강의 생성에 실패했습니다.');
            setAlertSeverity('error');
            setAlertOpen(true);
        }
    };

    const handleLectureClick = (lectureId) => {
        navigate('/lecture/admin-detail', { state: { lectureId } });
    };

    const handleDeleteLecture = async (event, lectureId) => {
        // 이벤트 버블링 방지
        event.stopPropagation();
        
        if (window.confirm('이 강의를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) {
            try {
                setIsDeletingLecture(true);
                await api.delete(`/api/lecture/${lectureId}`);
                
                setAlertMessage('강의가 성공적으로 삭제되었습니다.');
                setAlertSeverity('success');
                setAlertOpen(true);
                
                // 강의 목록 다시 불러오기
                fetchAllLectures();
            } catch (error) {
                console.error('강의 삭제 실패:', error);
                setAlertMessage('강의 삭제에 실패했습니다.');
                setAlertSeverity('error');
                setAlertOpen(true);
            } finally {
                setIsDeletingLecture(false);
            }
        }
    };

    const handleToggleActiveLecture = async (event, lectureId, isActive) => {
        // 이벤트 버블링 방지
        event.stopPropagation();
        
        try {
            const endpoint = isActive ? `/api/lecture/activate/${lectureId}` : `/api/lecture/deactivate/${lectureId}`;
            await api.post(endpoint);
            
            setAlertMessage(`강의가 성공적으로 ${isActive ? '활성화' : '비활성화'}되었습니다.`);
            setAlertSeverity('success');
            setAlertOpen(true);
            
            // 강의 목록 다시 불러오기
            fetchAllLectures();
        } catch (error) {
            console.error('강의 상태 변경 실패:', error);
            setAlertMessage(`강의 ${isActive ? '활성화' : '비활성화'}에 실패했습니다.`);
            setAlertSeverity('error');
            setAlertOpen(true);
        }
    };

    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleResetDateFilter = () => {
        setIsDateFiltered(false);
        setAlertMessage('모든 강의를 표시합니다.');
        setAlertSeverity('info');
        setAlertOpen(true);
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

    // 시간 범위 표시 함수 (시작 시간과 종료 시간을 "09:00-10:30" 형식으로)
    const formatTimeRange = (startTime, endTime) => {
        const start = formatTimeFromISO(startTime);
        const end = formatTimeFromISO(endTime);
        return `${start}-${end}`;
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

    // 캘린더 이벤트 생성
    const calendarEvents = lectures.map(lecture => ({
        id: lecture.id,
        title: lecture.name,
        start: new Date(lecture.doAt),
        end: new Date(lecture.theEnd)
    }));

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={2} mb={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                        <Card>
                            <CardHeader 
                                title={
                                    <MDTypography variant="h5" fontWeight="medium">
                                        강의 관리
                                        {isDateFiltered && (
                                            <MDTypography variant="caption" color="primary" sx={{ ml: 2 }}>
                                                {format(selectedDate, 'yyyy년 MM월 dd일')} 강의
                                            </MDTypography>
                                        )}
                                    </MDTypography>
                                } 
                                action={
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {isDateFiltered && (
                                            <MDButton 
                                                variant="outlined" 
                                                color="secondary" 
                                                size="small"
                                                onClick={handleResetDateFilter}
                                            >
                                                필터 해제
                                            </MDButton>
                                        )}
                                        <MDButton 
                                            variant="contained" 
                                            color="primary" 
                                            startIcon={<AddIcon />}
                                            onClick={handleOpenForm}
                                        >
                                            강의 생성
                                        </MDButton>
                                    </Box>
                                }
                            />
                            <CardContent>
                                <MDBox mb={3} display="flex">
                                    <TextField
                                        label="강의 검색"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        InputProps={{
                                            endAdornment: <SearchIcon />
                                        }}
                                    />
                                </MDBox>
                                
                                {isLoading ? (
                                    <MDTypography variant="body2" color="text" textAlign="center" py={4}>
                                        강의 목록을 불러오는 중...
                                    </MDTypography>
                                ) : filteredLectures.length === 0 ? (
                                    <MDTypography variant="body2" color="text" textAlign="center" py={4}>
                                        {isDateFiltered 
                                            ? `${format(selectedDate, 'yyyy년 MM월 dd일')}에 예정된 강의가 없습니다.`
                                            : searchTerm.trim() !== '' ? '검색 결과가 없습니다.' : '강의 목록이 없습니다.'}
                                    </MDTypography>
                                ) : (
                                    <List>
                                        {filteredLectures.map((lecture, index) => (
                                            <div key={lecture.id}>
                                                <ListItem 
                                                    button 
                                                    onClick={() => handleLectureClick(lecture.id)}
                                                    sx={{ borderRadius: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <MDTypography variant="h6" fontWeight="medium">
                                                                {lecture.name}
                                                            </MDTypography>
                                                        }
                                                        secondary={
                                                            <>
                                                                <MDTypography variant="caption" color="text">
                                                                    {formatDateFromISO(lecture.doAt)} ({formatTimeRange(lecture.doAt, lecture.theEnd)})
                                                                </MDTypography>
                                                                <br />
                                                                <MDTypography variant="caption" color="text" sx={{ 
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 1,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    {lecture.description || '설명 없음'}
                                                                </MDTypography>
                                                            </>
                                                        }
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    color="primary"
                                                                    checked={lecture.active || false}
                                                                    onChange={(e) => handleToggleActiveLecture(e, lecture.id, !lecture.active)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            }
                                                            label={lecture.active ? "활성" : "비활성"}
                                                            labelPlacement="start"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <IconButton 
                                                            edge="end" 
                                                            aria-label="delete"
                                                            onClick={(e) => handleDeleteLecture(e, lecture.id)}
                                                            color="error"
                                                            disabled={isDeletingLecture}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                {index < filteredLectures.length - 1 && <Divider component="li" />}
                                            </div>
                                        ))}
                                    </List>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <Card>
                            <CardContent>
                                <div style={{ height: '50vh' }}>
                                    <Calendar
                                        localizer={localizer}
                                        events={calendarEvents}
                                        startAccessor="start"
                                        endAccessor="end"
                                        step={15}
                                        style={{ height: '100%' }}
                                        timeslots={4}
                                        selectable
                                        onSelectSlot={handleSelectSlot}
                                        onSelectEvent={(event) => handleLectureClick(event.id)}
                                        views={['month']}
                                        date={selectedDate}
                                        onNavigate={date => {
                                            setSelectedDate(date);
                                            if (isDateFiltered) {
                                                setIsDateFiltered(false);
                                            }
                                        }}
                                    />
                                </div>
                                {isDateFiltered && (
                                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                                        <MDTypography variant="body2" color="primary">
                                            선택된 날짜: {format(selectedDate, 'yyyy년 MM월 dd일')}
                                        </MDTypography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </MDBox>

            {/* 강의 생성 다이얼로그 */}
            <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <DialogTitle>새 강의 생성</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="강의명"
                        type="text"
                        fullWidth
                        value={eventData.name}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                    />
                    
                    <TextField
                        margin="dense"
                        name="date"
                        label="날짜"
                        type="date"
                        fullWidth
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined"
                    />
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                name="startTime"
                                label="시작 시간"
                                type="time"
                                fullWidth
                                value={eventData.startTime}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                name="endTime"
                                label="종료 시간"
                                type="time"
                                fullWidth
                                value={eventData.endTime}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    
                    <TextField
                        margin="dense"
                        name="description"
                        label="강의 설명"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={eventData.description}
                        onChange={handleInputChange}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseForm} color="primary">
                        취소
                    </Button>
                    <Button onClick={handleSubmitForm} color="primary" variant="contained">
                        생성
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 알림 스낵바 */}
            <Snackbar 
                open={alertOpen} 
                autoHideDuration={6000} 
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>

            <Footer />
        </DashboardLayout>
    );
}

export default LectureAdmin; 