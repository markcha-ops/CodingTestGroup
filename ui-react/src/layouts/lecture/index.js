/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
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
import AddIcon from "@mui/icons-material/Add";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ProtectedRoute from '../../ProtectedRoute';
// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

import api from '../../api'
// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
//ef
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';

function Lecture() {
    const { sales, tasks } = reportsLineChartData;
    const [openForm, setOpenForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventData, setEventData] = useState({
        name: '',
        startTime: '09:00',
        endTime: '10:30',
        description: ''
    });
    const [lectures, setLectures] = useState([]);
    const [allLectures, setAllLectures] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const locales = {
        'ko': ko,
    };

    const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

    // 모든 강의 목록 가져오기
    useEffect(() => {
        fetchAllLectures();
    }, []);

    // 모든 강의 목록 가져오기
    const fetchAllLectures = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/lecture/all', { params: { activate: true } });
            const lecturesData = response.data || [];
            setAllLectures(lecturesData);
            
            // 캘린더에 표시할 이벤트 형식으로 변환
            const events = lecturesData.map(lecture => ({
                id: lecture.id,
                title: lecture.name,
                start: new Date(lecture.doAt),
                end: new Date(lecture.theEnd),
                resource: lecture
            }));
            
            setCalendarEvents(events);
        } catch (error) {
            console.error('모든 강의 목록 조회 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 선택된 날짜에 대한 강의 목록 조회
    const fetchLecturesForDate = async (date) => {
        if (!date) return;
        
        setIsLoading(true);
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            
            // 모든 강의 목록에서 해당 날짜 필터링
            const filteredLectures = allLectures.filter(lecture => {
                const lectureDate = format(new Date(lecture.doAt), 'yyyy-MM-dd');
                return lectureDate === formattedDate;
            });
            
            setLectures(filteredLectures);
        } catch (error) {
            console.error('강의 필터링 실패:', error);
            setLectures([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 캘린더 슬롯 선택 시 날짜 저장 및 해당 날짜의 강의 목록 조회
    const handleSelectSlot = (slotInfo) => {
        setSelectedDate(slotInfo.start);
        fetchLecturesForDate(slotInfo.start);
    };

    // 캘린더 이벤트 클릭 시 강의 상세 페이지로 이동
    const handleEventClick = (event) => {
        navigate('/lecture/detail', { state: { lectureId: event.id } });
    };

    // 강의 생성 버튼 클릭 시 팝업 표시
    const handleOpenForm = () => {
        if (!selectedDate) {
            alert('먼저 캘린더에서 날짜를 선택해주세요.');
            return;
        }
        setOpenForm(true);
    };

    // 강의 클릭 시 상세 페이지로 이동
    const handleLectureClick = (lectureId) => {
        navigate('/lecture/detail', { state: { lectureId } });
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
        if (!selectedDate) {
            alert('날짜를 선택해주세요.');
            return;
        }
        
        if (!eventData.name) {
            alert('강의명은 필수입니다.');
            return;
        }
        
        try {
            // 선택된 날짜 형식 변환 (YYYY-MM-DD)
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            
            // 날짜와 시간 결합하여 ISO-8601 형식 생성 (Spring Boot LocalDateTime 호환)
            const startDateTime = `${formattedDate}T${eventData.startTime}:00`;
            const endDateTime = `${formattedDate}T${eventData.endTime}:00`;
            
            // API 요청
            const response = await api.post('/api/lecture', {
                name: eventData.name,
                doAt: startDateTime,
                theEnd: endDateTime,
                description: eventData.description,
                activate: true
            });
            
            // 성공 시 처리
            console.log('강의 생성 성공:', response.data);
            alert('강의가 성공적으로 생성되었습니다.');
            
            // 폼 초기화 및 닫기
            setEventData({
                name: '',
                startTime: '09:00',
                endTime: '10:30',
                description: ''
            });
            setOpenForm(false);
            
            // 모든 강의 목록 다시 불러오기
            fetchAllLectures();
            
            // 선택된 날짜의 강의 목록 갱신
            if (selectedDate) {
                fetchLecturesForDate(selectedDate);
            }
        } catch (error) {
            console.error('강의 생성 실패:', error);
            alert('강의 생성에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 시간 포맷 변환 함수 (ISO 형식에서 HH:mm 형식으로)
    const formatTimeFromISO = (isoString) => {
        try {
            if (!isoString) return '';
            // ISO 문자열에서 시간 부분만 추출 (예: "2023-05-15T09:00:00" -> "09:00")
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

    // 이벤트 스타일 커스터마이징
    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: '#3788d8',
                borderRadius: '3px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
                fontWeight: 'normal',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                padding: '2px 4px',
                fontSize: '12px',
                lineHeight: '1.3'
            }
        };
    };

    // 이벤트에 표시할 내용 커스터마이징
    const eventPropGetter = (event) => {
        return { className: 'calendar-event' };
    };

    // 이벤트 제목을 커스터마이징
    const formats = {
        eventTimeRangeFormat: () => null, // 기본 시간 표시 숨기기
    };

    // 이벤트 컴포넌트 커스터마이징
    const components = {
        event: ({ event }) => (
            <div style={{ padding: '0px', margin: '0px' }}>
                <div style={{ fontWeight: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', lineHeight: '1.3' }}>
                    {event.title}
                </div>
                <div style={{ fontSize: '10px', lineHeight: '1.2' }}>
                    {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                </div>
            </div>
        )
    };

    return (
        <DashboardLayout>
            <DashboardNavbar/>
            <MDBox mb={3}>
                <div style={{
                    height: '50vh',
                    marginBottom: '20px'
                }}>
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        step={15}
                        style={{height: '100%'}}
                        timeslots={4}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleEventClick}
                        eventPropGetter={eventPropGetter}
                        eventStyleGetter={eventStyleGetter}
                        formats={formats}
                        components={components}
                        popup
                    />
                </div>
                
                <Card>
                    <CardHeader 
                        title={
                            <MDTypography variant="h5" fontWeight="medium">
                                강의 목록
                                {selectedDate && (
                                    <span style={{ marginLeft: '15px', fontSize: '0.9em', fontWeight: 'normal' }}>
                                        {format(selectedDate, 'yyyy년 MM월 dd일')} 선택됨
                                    </span>
                                )}
                            </MDTypography>
                        } 
                    />
                    <CardContent>
                        {isLoading ? (
                            <MDTypography variant="body2" color="text" textAlign="center" py={2}>
                                강의 목록을 불러오는 중...
                            </MDTypography>
                        ) : lectures.length > 0 ? (
                            <List>
                                {lectures.map((lecture) => (
                                    <React.Fragment key={lecture.id}>
                                        <ListItem 
                                            button 
                                            onClick={() => handleLectureClick(lecture.id)}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                }
                                            }}
                                        >
                                            <Grid container spacing={2}>
                                                <Grid item xs={7}>
                                                    <ListItemText
                                                        primary={lecture.name}
                                                        secondary={lecture.description || '설명 없음'}
                                                    />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <ListItemText primary={formatTimeRange(lecture.doAt, lecture.theEnd)} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <Divider variant="inset" component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <MDTypography variant="body2" color="text" textAlign="center" py={2}>
                                {selectedDate 
                                    ? `${format(selectedDate, 'yyyy년 MM월 dd일')}에 등록된 강의가 없습니다.` 
                                    : '날짜를 선택하여 강의 목록을 확인하세요.'}
                            </MDTypography>
                        )}
                    </CardContent>
                </Card>
            </MDBox>
            
            {/* 강의 생성 팝업 폼 */}
            <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <MDTypography variant="h5">
                        {selectedDate && `${format(selectedDate, 'yyyy년 MM월 dd일')} 강의 생성`}
                    </MDTypography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="강의명"
                                name="name"
                                value={eventData.name}
                                onChange={handleInputChange}
                                variant="outlined"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="시작 시간"
                                name="startTime"
                                type="time"
                                value={eventData.startTime}
                                onChange={handleInputChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="종료 시간"
                                name="endTime"
                                type="time"
                                value={eventData.endTime}
                                onChange={handleInputChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="설명"
                                name="description"
                                value={eventData.description}
                                onChange={handleInputChange}
                                variant="outlined"
                                multiline
                                rows={4}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseForm} color="secondary">
                        취소
                    </Button>
                    <Button onClick={handleSubmitForm} color="primary" variant="contained">
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Footer/>
        </DashboardLayout>
    );
}

export default Lecture;
