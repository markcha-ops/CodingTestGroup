/**
 * Admin Lecture Detail component - Shows detailed information about a specific lecture with management capabilities
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InputAdornment from "@mui/material/InputAdornment";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from "@mui/icons-material/Search";
import LaunchIcon from "@mui/icons-material/Launch";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import QuizIcon from '@mui/icons-material/Quiz';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

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
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, set, addHours } from 'date-fns';
import { debounce } from 'lodash';

function AdminLectureDetail() {
    const location = useLocation();
    const lectureId = location.state?.lectureId;
    const navigate = useNavigate();
    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [editedLecture, setEditedLecture] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [materialLink, setMaterialLink] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [materialsLoading, setMaterialsLoading] = useState(false);
    const [materialsError, setMaterialsError] = useState(null);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [newMaterialTitle, setNewMaterialTitle] = useState('');
    const [newMaterialUrl, setNewMaterialUrl] = useState('');
    const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [videoSearchTerm, setVideoSearchTerm] = useState('');
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(false);
    const [videosError, setVideosError] = useState(null);
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [videoLinkDialogOpen, setVideoLinkDialogOpen] = useState(false);
    const [videoLink, setVideoLink] = useState('');
    const [problemDialogOpen, setProblemDialogOpen] = useState(false);
    const [problemSearchTerm, setProblemSearchTerm] = useState('');
    const [problems, setProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [problemsLoading, setProblemsLoading] = useState(false);
    const [problemsError, setProblemsError] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedProblems, setSelectedProblems] = useState([]);
    
    // Language options
    const languageOptions = [
        'JAVA', 'C', 'PYTHON', 'CPP', 'SQL', 'JAVASCRIPT', 'TYPESCRIPT', 
        'KOTLIN', 'SWIFT', 'RUBY', 'PHP', 'RUST', 'GOLANG', 'SCALA', 
        'HASKELL', 'ELIXIR'
    ];
    
    // Add debounced search function
    const debouncedSearch = useCallback(
        debounce((searchTerm) => {
            fetchMaterials(searchTerm);
        }, 300),
        []
    );

    // Add debounced search function for videos
    const debouncedVideoSearch = useCallback(
        debounce((searchTerm) => {
            fetchVideos(searchTerm);
        }, 300),
        []
    );

    // Add debounced search function for problems
    const debouncedProblemSearch = useCallback(
        debounce((searchTerm, language) => {
            fetchProblems(searchTerm, language);
        }, 300),
        []
    );

    // Fetch materials from API
    useEffect(() => {
        fetchMaterials();
    }, []);

    // Add a new function to fetch materials with optional search term
    const fetchMaterials = async (searchTerm = '') => {
        setMaterialsLoading(true);
        try {
            const queryParams = new URLSearchParams({ type: 'pdf' });
            if (searchTerm.trim()) {
                queryParams.append('keyword', searchTerm.trim());
            }
            
            const response = await api.get(`/api/urls?${queryParams}`);
            // Assuming the API returns an array of objects with id, name and url properties
            const formattedMaterials = response.data.map(item => ({
                id: item.id,
                title: item.name,
                url: item.url
            }));
            setMaterials(formattedMaterials);
            setFilteredMaterials(formattedMaterials);
            setMaterialsError(null);
        } catch (err) {
            console.error('Failed to fetch materials:', err);
            setMaterialsError('교육 자료를 가져오는데 실패했습니다.');
            // Fallback to empty array
            setMaterials([]);
            setFilteredMaterials([]);
        } finally {
            setMaterialsLoading(false);
        }
    };

    // Fetch videos from API
    const fetchVideos = async (searchTerm = '') => {
        setVideosLoading(true);
        try {
            const queryParams = new URLSearchParams({ type: 'video' });
            if (searchTerm.trim()) {
                queryParams.append('keyword', searchTerm.trim());
            }
            
            const response = await api.get(`/api/urls?${queryParams}`);
            // Assuming the API returns an array of objects with id, name and url properties
            const formattedVideos = response.data.map(item => ({
                id: item.id,
                title: item.name,
                url: item.url
            }));
            setVideos(formattedVideos);
            setFilteredVideos(formattedVideos);
            setVideosError(null);
        } catch (err) {
            console.error('Failed to fetch videos:', err);
            setVideosError('영상 자료를 가져오는데 실패했습니다.');
            // Fallback to empty array
            setVideos([]);
            setFilteredVideos([]);
        } finally {
            setVideosLoading(false);
        }
    };

    // Fetch problems from API
    const fetchProblems = async (searchTerm = '', language = '') => {
        setProblemsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm.trim()) {
                queryParams.append('keyword', searchTerm.trim());
            }
            if (language.trim()) {
                queryParams.append('language', language.trim());
            }
            
            const response = await api.get(`/api/questions?${queryParams}`);
            // Assuming the API returns an array of problem objects
            const formattedProblems = response.data.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                language: item.language
            }));
            setProblems(formattedProblems);
            setFilteredProblems(formattedProblems);
            setProblemsError(null);
        } catch (err) {
            console.error('Failed to fetch problems:', err);
            setProblemsError('문제를 가져오는데 실패했습니다.');
            // Fallback to empty array
            setProblems([]);
            setFilteredProblems([]);
        } finally {
            setProblemsLoading(false);
        }
    };

    // Function to check if a lecture exists at the given time
    const checkLectureTimeConflict = async (date, startTime) => {
        try {
            // Format the date to YYYY-MM-DD
            const formattedDate = format(new Date(date), 'yyyy-MM-dd');
            // Create the full datetime string
            const startTimeISO = `${formattedDate}T${startTime}:00`;
            
            // Call API to check if there are lectures at this time
            const response = await api.get(`/api/lecture/check-conflict?date=${formattedDate}&time=${startTime}`);
            
            return response.data.hasConflict;
        } catch (err) {
            console.error('Failed to check lecture conflicts:', err);
            return false; // If API fails, assume no conflict
        }
    };

    // Function to set default time with conflict resolution
    const setupInitialLecture = async () => {
        // Start with 7 PM as default
        let currentDate = new Date();
        let defaultStartTime = '19:00';
        let defaultEndTime = '20:00';
        
        // Check if there's a conflict at 7 PM
        const hasConflictAt7 = await checkLectureTimeConflict(currentDate, defaultStartTime);
        
        if (hasConflictAt7) {
            // Try 8 PM
            defaultStartTime = '20:00';
            defaultEndTime = '21:00';
            
            const hasConflictAt8 = await checkLectureTimeConflict(currentDate, defaultStartTime);
            
            if (hasConflictAt8) {
                // Try 9 PM
                defaultStartTime = '21:00';
                defaultEndTime = '22:00';
            }
        }
        
        // Set up initial lecture with resolved time
        const startDate = set(currentDate, { 
            hours: parseInt(defaultStartTime.split(':')[0]), 
            minutes: parseInt(defaultStartTime.split(':')[1]),
            seconds: 0,
            milliseconds: 0
        });
        
        const endDate = set(currentDate, { 
            hours: parseInt(defaultEndTime.split(':')[0]), 
            minutes: parseInt(defaultEndTime.split(':')[1]),
            seconds: 0,
            milliseconds: 0
        });

        setLecture({
            id: lectureId || 'temp-id',
            name: '새 강의',
            doAt: startDate.toISOString(),
            theEnd: endDate.toISOString(),
            description: '',
            materialLink: ''
        });

        setLoading(false);
    };

    useEffect(() => {
        if (!editedLecture) {
            setEditedLecture(lecture);
        }
    }, [lecture]);

    useEffect(() => {
        const fetchLectureData = async () => {
            if (!lectureId) {
                console.log('개발 모드: 기본 강의 폼 표시');
                // Initialize with default values for new lecture
                await setupInitialLecture();
                return;
            }
            
            setLoading(true);
            try {
                const response = await api.get(`/api/lecture/detail/${lectureId}`);
                setLecture(response.data.lecture);
                setEditedLecture(response.data.lecture);
                
                // PDF 자료 설정
                if (response.data.pdfUrl) {
                    setMaterialLink(response.data.pdfUrl.url || '');
                }
                
                // 영상 자료 설정
                if (response.data.videoUrl) {
                    setVideoLink(response.data.videoUrl.url || '');
                }
                
                // 문제 목록 설정
                if (response.data.questions && Array.isArray(response.data.questions)) {
                    setSelectedProblems(response.data.questions.map(q => ({
                        id: q.id,
                        title: q.title,
                        description: q.content,
                        language: q.language
                    })));
                }
                
                setError(null);
            } catch (err) {
                console.error('Failed to fetch lecture details:', err);
                setError('강의 정보를 가져오는데 실패했습니다. 개발 모드에서는 기본 폼이 표시됩니다.');
                // Initialize with default values if fetching existing lecture fails
                await setupInitialLecture();
            } finally {
                setLoading(false);
            }
        };

        fetchLectureData();
    }, [lectureId]);

    const handleBack = () => {
        navigate('/lecture/admin');
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

    // 날짜와 시간에서 ISO 문자열을 생성하는 함수
    const createISOString = (date, time) => {
        try {
            const dateStr = format(new Date(date), 'yyyy-MM-dd');
            return `${dateStr}T${time}:00`;
        } catch (error) {
            console.error('ISO 문자열 생성 실패:', error);
            return null;
        }
    };

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditedLecture(lecture);
        setEditMode(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedLecture(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTimeChange = (e) => {
        const { name, value } = e.target;
        
        // 시작 시간이나 종료 시간 변경 시 ISO 문자열 업데이트
        if (name === 'startTime') {
            const newDoAt = createISOString(new Date(editedLecture.doAt), value);
            setEditedLecture(prev => ({
                ...prev,
                doAt: newDoAt
            }));
        } else if (name === 'endTime') {
            const newTheEnd = createISOString(new Date(editedLecture.theEnd), value);
            setEditedLecture(prev => ({
                ...prev,
                theEnd: newTheEnd
            }));
        }
    };

    const handleSaveEdit = async () => {
        try {
            // Send API request to update lecture information
            const response = await api.put(`/api/lecture/${lecture.id}`, editedLecture);
            
            // Update local state with the response data
            setLecture(response.data.lecture || editedLecture);
            setEditMode(false);
            setSuccessMessage('강의 정보가 성공적으로 업데이트되었습니다.');
            
            // 3초 후 성공 메시지 숨기기
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('강의 업데이트 실패:', error);
            setError('강의 정보 업데이트에 실패했습니다.');
        }
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    const handleConfirmDelete = async () => {
        try {
            // 개발 모드에서는 API 호출 없이 바로 상태 업데이트
            console.log('개발 모드: 강의 삭제', lectureId);
            
            // 실제 API 호출 (개발 중에는 주석 처리)
            // await api.delete(`/api/lecture/${lectureId}`);
            
            setDeleteDialogOpen(false);
            navigate('/lecture/admin', { state: { message: '강의가 삭제되었습니다.' } });
        } catch (error) {
            console.error('강의 삭제 실패:', error);
            setError('강의 삭제에 실패했습니다.');
            setDeleteDialogOpen(false);
        }
    };

    const handleMaterialMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
        setMaterialSearchTerm('');
        fetchMaterials(); // Reset search and fetch all materials when opening the menu
    };

    const handleMaterialMenuClose = () => {
        setAnchorEl(null);
    };

    const handleOpenMaterialDialog = () => {
        setMaterialDialogOpen(true);
        setMaterialSearchTerm('');
        fetchMaterials();
    };

    const handleCloseMaterialDialog = () => {
        setMaterialDialogOpen(false);
    };

    const handleCloseLinkDialog = () => {
        setLinkDialogOpen(false);
        setNewMaterialTitle('');
        setNewMaterialUrl('');
    };

    const handleMaterialSearch = (e) => {
        const value = e.target.value;
        setMaterialSearchTerm(value);
        debouncedSearch(value);
    };

    const handleMaterialSelect = async (material) => {
        try {
            // 선택한 자료 링크 설정
            setMaterialLink(material.url);
            
            // API에 강의 자료 연결 요청 (urlID와 type을 params로 전송)
            await api.post(`/api/lecture/add/${lecture.id}?urlID=${material.id}&type=pdf`);
            
            // 성공 메시지 표시
            setSuccessMessage('교육 자료가 성공적으로 연결되었습니다.');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
            // 메뉴 닫기
            handleMaterialMenuClose();
        } catch (error) {
            console.error('교육 자료 연결 실패:', error);
            setError('교육 자료 연결에 실패했습니다.');
        }
    };

    const handleOpenNewMaterialDialog = () => {
        handleMaterialMenuClose();
        setLinkDialogOpen(true);
    };

    const handleNewMaterialTitleChange = (e) => {
        setNewMaterialTitle(e.target.value);
    };

    const handleNewMaterialUrlChange = (e) => {
        setNewMaterialUrl(e.target.value);
    };

    const handleLinkChange = (e) => {
        setMaterialLink(e.target.value);
    };

    const handleSaveNewMaterial = async () => {
        // 새 자료 추가
        if (newMaterialTitle && newMaterialUrl) {
            try {
                // API 호출: 새 교육 자료 등록
                await api.post('/api/urls', {
                    name: newMaterialTitle,
                    url: newMaterialUrl,
                    type: 'pdf'
                });
                
                // 자료 목록 새로고침
                await fetchMaterials(materialSearchTerm);
                
                // 자료 링크 설정
                setMaterialLink(newMaterialUrl);
                
                // 강의 자료 링크 저장 API 호출
                handleSaveLink();
                
                // 다이얼로그 닫기
                setLinkDialogOpen(false);
                
                // 입력 필드 초기화
                setNewMaterialTitle('');
                setNewMaterialUrl('');
                
                setSuccessMessage('새 교육 자료가 성공적으로 등록되었습니다.');
                
                // 3초 후 성공 메시지 숨기기
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } catch (error) {
                console.error('교육 자료 등록 실패:', error);
                setError('교육 자료 등록에 실패했습니다.');
            }
        }
    };

    const handleSaveLink = async () => {
        try {
            // 개발 모드에서는 API 호출 없이 바로 상태 업데이트
            console.log('개발 모드: 교육 자료 링크 저장', materialLink);
            
            // 실제 API 호출 (개발 중에는 주석 처리)
            // await api.put(`/api/lecture/${lectureId}/material`, {
            //     materialLink: materialLink
            // });
            
            // 직접 상태 업데이트
            setLecture(prev => ({
                ...prev,
                materialLink: materialLink
            }));
            
            setLinkDialogOpen(false);
            setSuccessMessage('교육 자료 링크가 성공적으로 저장되었습니다.');
            
            // 3초 후 성공 메시지 숨기기
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('교육 자료 링크 저장 실패:', error);
            setError('교육 자료 링크 저장에 실패했습니다.');
            setLinkDialogOpen(false);
        }
    };

    const handleOpenVideoDialog = () => {
        setVideoDialogOpen(true);
        setVideoSearchTerm('');
        fetchVideos();
    };

    const handleCloseVideoDialog = () => {
        setVideoDialogOpen(false);
    };

    const handleVideoSearch = (e) => {
        const value = e.target.value;
        setVideoSearchTerm(value);
        debouncedVideoSearch(value);
    };

    const handleOpenNewVideoDialog = () => {
        setVideoLinkDialogOpen(true);
    };

    const handleCloseVideoLinkDialog = () => {
        setVideoLinkDialogOpen(false);
        setNewVideoTitle('');
        setNewVideoUrl('');
    };

    const handleNewVideoTitleChange = (e) => {
        setNewVideoTitle(e.target.value);
    };

    const handleNewVideoUrlChange = (e) => {
        setNewVideoUrl(e.target.value);
    };

    const handleVideoSelect = async (video) => {
        try {
            // 선택한 자료 링크 설정
            setVideoLink(video.url);
            
            // API에 강의 자료 연결 요청 (urlID와 type을 params로 전송)
            await api.post(`/api/lecture/add/${lecture.id}?urlID=${video.id}&type=video`);
            
            // 성공 메시지 표시
            setSuccessMessage('영상 자료가 성공적으로 연결되었습니다.');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
            // 다이얼로그 닫기
            handleCloseVideoDialog();
        } catch (error) {
            console.error('영상 자료 연결 실패:', error);
            setError('영상 자료 연결에 실패했습니다.');
        }
    };

    const handleSaveNewVideo = async () => {
        // 새 자료 추가
        if (newVideoTitle && newVideoUrl) {
            try {
                // API 호출: 새 영상 자료 등록
                await api.post('/api/urls', {
                    name: newVideoTitle,
                    url: newVideoUrl,
                    type: 'video'
                });
                
                // 자료 목록 새로고침
                await fetchVideos(videoSearchTerm);
                
                // 자료 링크 설정
                setVideoLink(newVideoUrl);
                
                // 영상 자료 연결 요청
                // API에 응답이 온 후에 id 값을 알 수 있으므로, 새로 등록된 영상을 찾기 위해 다시 조회
                const response = await api.get(`/api/urls?type=video&keyword=${encodeURIComponent(newVideoTitle)}`);
                const newVideo = response.data.find(item => item.name === newVideoTitle && item.url === newVideoUrl);
                
                if (newVideo) {
                    await api.post(`/api/lecture/add/${lecture.id}?urlID=${newVideo.id}&type=video`);
                }
                
                // 다이얼로그 닫기
                setVideoLinkDialogOpen(false);
                setVideoDialogOpen(false);
                
                // 입력 필드 초기화
                setNewVideoTitle('');
                setNewVideoUrl('');
                
                setSuccessMessage('새 영상 자료가 성공적으로 등록 및 연결되었습니다.');
                
                // 3초 후 성공 메시지 숨기기
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } catch (error) {
                console.error('영상 자료 등록 실패:', error);
                setError('영상 자료 등록에 실패했습니다.');
            }
        }
    };

    // Handle opening problem dialog
    const handleOpenProblemDialog = () => {
        setProblemDialogOpen(true);
        setProblemSearchTerm('');
        setSelectedLanguage('');
        fetchProblems();
    };

    // Handle closing problem dialog
    const handleCloseProblemDialog = () => {
        setProblemDialogOpen(false);
    };

    // Handle problem search
    const handleProblemSearch = (e) => {
        const value = e.target.value;
        setProblemSearchTerm(value);
        debouncedProblemSearch(value, selectedLanguage);
    };

    // Handle language selection
    const handleLanguageChange = (e) => {
        const value = e.target.value;
        setSelectedLanguage(value);
        debouncedProblemSearch(problemSearchTerm, value);
    };

    // Handle problem selection
    const handleProblemSelect = async (problem) => {
        try {
            // Check if problem is already selected
            if (selectedProblems.some(p => p.id === problem.id)) {
                setError('이미 선택된 문제입니다.');
                setTimeout(() => {
                    setError('');
                }, 3000);
                return;
            }
            
            // API에 강의 문제 연결 요청 (questionId를 params로 전송)
            await api.post(`/api/lecture/question/${lecture.id}?questionId=${problem.id}`);
            
            // Add to selected problems
            setSelectedProblems(prev => [...prev, problem]);
            
            // 성공 메시지 표시
            setSuccessMessage('문제가 성공적으로 연결되었습니다.');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
            // 다이얼로그 닫지 않고 유지
        } catch (error) {
            console.error('문제 연결 실패:', error);
            setError('문제 연결에 실패했습니다.');
        }
    };

    // Remove a selected problem
    const handleRemoveProblem = async (problemId) => {
        try {
            console.log(`Removing problem ${problemId} from lecture ${lecture.id}`);
            
            // API에 강의 문제 연결 해제 요청
            const response = await api.delete(`/api/lecture/question/${lecture.id}?questionId=${problemId}`);
            console.log('API Response:', response);
            
            // Remove from selected problems
            setSelectedProblems(prev => prev.filter(p => p.id !== problemId));
            
            // 성공 메시지 표시
            setSuccessMessage('문제가 성공적으로 제거되었습니다.');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('문제 제거 실패:', error);
            setError('문제 제거에 실패했습니다.');
        }
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={2} mb={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={handleBack}
                    >
                        강의 관리 목록으로 돌아가기
                    </Button>
                    
                    <MDBox>
                        {lecture && !editMode && (
                            <>
                                <MDButton 
                                    variant="outlined" 
                                    color="info" 
                                    endIcon={<KeyboardArrowDownIcon />}
                                    onClick={handleMaterialMenuOpen}
                                    sx={{ mr: 1 }}
                                >
                                    교육 자료
                                </MDButton>
                                <MDButton 
                                    variant="outlined" 
                                    color="primary" 
                                    startIcon={<EditIcon />} 
                                    onClick={handleEditClick}
                                    sx={{ mr: 1 }}
                                >
                                    수정
                                </MDButton>
                                <MDButton 
                                    variant="outlined" 
                                    color="error" 
                                    startIcon={<DeleteIcon />} 
                                    onClick={handleDeleteClick}
                                >
                                    삭제
                                </MDButton>
                            </>
                        )}
                        
                        {lecture && editMode && (
                            <>
                                <MDButton 
                                    variant="contained" 
                                    color="success" 
                                    startIcon={<SaveIcon />} 
                                    onClick={handleSaveEdit}
                                    sx={{ mr: 1 }}
                                >
                                    저장
                                </MDButton>
                                <MDButton 
                                    variant="outlined" 
                                    color="error" 
                                    startIcon={<CloseIcon />} 
                                    onClick={handleCancelEdit}
                                >
                                    취소
                                </MDButton>
                            </>
                        )}
                    </MDBox>
                </MDBox>

                {/* 교육 자료 메뉴 */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMaterialMenuClose}
                    PaperProps={{
                        style: {
                            width: '300px',
                            maxHeight: '400px',
                        },
                    }}
                >
                    <MenuItem sx={{ p: 0 }}>
                        <TextField
                            placeholder="자료 검색..."
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={materialSearchTerm}
                            onChange={handleMaterialSearch}
                            onClick={(e) => e.stopPropagation()}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ p: 1 }}
                        />
                    </MenuItem>
                    <Divider />
                    
                    {materialsLoading ? (
                        <MenuItem disabled>
                            <ListItemText primary="교육 자료를 불러오는 중..." />
                        </MenuItem>
                    ) : materialsError ? (
                        <MenuItem disabled>
                            <ListItemText primary={materialsError} />
                        </MenuItem>
                    ) : filteredMaterials.length > 0 ? (
                        filteredMaterials.map((material) => (
                            <MenuItem 
                                key={material.id} 
                                onClick={() => handleMaterialSelect(material)}
                            >
                                <ListItemIcon>
                                    <DescriptionIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={material.title} />
                            </MenuItem>
                        ))
                    ) : materialSearchTerm ? (
                        <MenuItem disabled>
                            <ListItemText primary="검색 결과가 없습니다" />
                        </MenuItem>
                    ) : null}
                    
                    <Divider />
                    <MenuItem onClick={handleOpenNewMaterialDialog}>
                        <ListItemIcon>
                            <AddIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="새 교육 자료 등록" />
                    </MenuItem>
                </Menu>

                {successMessage && (
                    <MDAlert color="success" my={2}>
                        {successMessage}
                    </MDAlert>
                )}

                {error && (
                    <MDAlert color="warning" my={2}>
                        {error}
                    </MDAlert>
                )}

                <Card>
                    <CardHeader 
                        title={
                            editMode ? (
                                <TextField
                                    fullWidth
                                    label="강의명"
                                    name="name"
                                    value={editedLecture?.name || ''}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    margin="normal"
                                />
                            ) : (
                                <MDTypography variant="h4" fontWeight="medium">
                                    {lecture?.name || ''}
                                </MDTypography>
                            )
                        } 
                    />
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <MDTypography variant="h6" color="text" gutterBottom>
                                    날짜
                                </MDTypography>
                                {editMode ? (
                                    <TextField
                                        type="date"
                                        name="date"
                                        value={editedLecture?.doAt ? format(new Date(editedLecture.doAt), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                    />
                                ) : (
                                    <MDTypography variant="body1" mb={3}>
                                        {formatDateFromISO(lecture?.doAt)}
                                    </MDTypography>
                                )}
                                
                                <MDTypography variant="h6" color="text" gutterBottom>
                                    시간
                                </MDTypography>
                                {editMode ? (
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                type="time"
                                                label="시작 시간"
                                                name="startTime"
                                                value={editedLecture?.doAt ? formatTimeFromISO(editedLecture.doAt) : '09:00'}
                                                onChange={handleTimeChange}
                                                variant="outlined"
                                                fullWidth
                                                margin="normal"
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                type="time"
                                                label="종료 시간"
                                                name="endTime"
                                                value={editedLecture?.theEnd ? formatTimeFromISO(editedLecture.theEnd) : '10:00'}
                                                onChange={handleTimeChange}
                                                variant="outlined"
                                                fullWidth
                                                margin="normal"
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <MDTypography variant="body1" mb={3}>
                                        {formatTimeFromISO(lecture?.doAt)} - {formatTimeFromISO(lecture?.theEnd)}
                                    </MDTypography>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <MDTypography variant="h6" color="text" gutterBottom>
                                    강의 설명
                                </MDTypography>
                                {editMode ? (
                                    <TextField
                                        multiline
                                        rows={4}
                                        name="description"
                                        value={editedLecture?.description || ''}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                    />
                                ) : (
                                    <MDTypography variant="body1" component="div" mb={3}>
                                        {lecture?.description || '설명이 없습니다.'}
                                    </MDTypography>
                                )}
                            </Grid>

                            {lecture?.materialLink && (
                                <Grid item xs={12}>
                                    <MDAlert color="info" my={2} dismissible={false}>
                                        <MDBox display="flex" alignItems="center" justifyContent="space-between">
                                            <MDBox>
                                                <MDTypography variant="subtitle2" fontWeight="medium">
                                                    현재 등록된 교육 자료: {lecture.materialLink}
                                                </MDTypography>
                                            </MDBox>
                                            <MDButton
                                                variant="text"
                                                color="info"
                                                href={lecture.materialLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                startIcon={<LaunchIcon />}
                                                size="small"
                                            >
                                                열기
                                            </MDButton>
                                        </MDBox>
                                    </MDAlert>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                    <MDBox p={3}>
                        <Grid container spacing={2}>
                            {/* 교육 자료 섹션 */}
                            <Grid item xs={12} container spacing={2}>
                                <Grid item xs={12} md={3}>
                                    <MDButton 
                                        variant="contained" 
                                        color="info" 
                                        startIcon={<AddIcon />}
                                        onClick={() => setMaterialDialogOpen(true)}
                                        fullWidth
                                    >
                                        강의 자료 등록
                                    </MDButton>
                                </Grid>
                                <Grid item xs={12} md={9}>
                                    {materialLink && (
                                        <MDAlert color="info" dismissible={false}>
                                            <MDBox display="flex" alignItems="center" justifyContent="space-between">
                                                <MDBox>
                                                    <MDTypography variant="subtitle2" fontWeight="medium">
                                                        선택된 강의 자료
                                                    </MDTypography>
                                                    <MDTypography variant="caption" sx={{ mt: 0.5, wordBreak: 'break-all' }}>
                                                        {materialLink}
                                                    </MDTypography>
                                                </MDBox>
                                                <MDButton
                                                    variant="text"
                                                    color="info"
                                                    href={materialLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    startIcon={<LaunchIcon fontSize="small" />}
                                                    size="small"
                                                    sx={{ py: 0.5, px: 1 }}
                                                >
                                                    열기
                                                </MDButton>
                                            </MDBox>
                                        </MDAlert>
                                    )}
                                </Grid>
                            </Grid>
                            
                            {/* 영상 자료 섹션 */}
                            <Grid item xs={12} container spacing={2} mt={1}>
                                <Grid item xs={12} md={3}>
                                    <MDButton 
                                        variant="contained" 
                                        color="warning" 
                                        startIcon={<VideoLibraryIcon />}
                                        onClick={handleOpenVideoDialog}
                                        fullWidth
                                    >
                                        영상 자료 등록
                                    </MDButton>
                                </Grid>
                                <Grid item xs={12} md={9}>
                                    {videoLink && (
                                        <MDAlert color="warning" dismissible={false}>
                                            <MDBox display="flex" alignItems="center" justifyContent="space-between">
                                                <MDBox>
                                                    <MDTypography variant="subtitle2" fontWeight="medium">
                                                        선택된 영상 자료
                                                    </MDTypography>
                                                    <MDTypography variant="caption" sx={{ mt: 0.5, wordBreak: 'break-all' }}>
                                                        {videoLink}
                                                    </MDTypography>
                                                </MDBox>
                                                <MDButton
                                                    variant="text"
                                                    color="warning"
                                                    href={videoLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    startIcon={<LaunchIcon fontSize="small" />}
                                                    size="small"
                                                    sx={{ py: 0.5, px: 1 }}
                                                >
                                                    열기
                                                </MDButton>
                                            </MDBox>
                                        </MDAlert>
                                    )}
                                </Grid>
                            </Grid>
                            
                            {/* 문제 섹션 */}
                            <Grid item xs={12} container spacing={2} mt={1}>
                                <Grid item xs={12} md={3}>
                                    <MDButton 
                                        variant="contained" 
                                        color="success" 
                                        startIcon={<QuizIcon />}
                                        onClick={handleOpenProblemDialog}
                                        fullWidth
                                    >
                                        문제 등록
                                    </MDButton>
                                </Grid>
                                <Grid item xs={12} md={9}>
                                    {selectedProblems.length > 0 ? (
                                        <MDBox>
                                            <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                                                선택된 문제 ({selectedProblems.length})
                                            </MDTypography>
                                            {selectedProblems.map((problem) => (
                                                <MDAlert 
                                                    key={problem.id} 
                                                    color="success" 
                                                    dismissible={true}
                                                    onClose={() => handleRemoveProblem(problem.id)}
                                                    sx={{ mb: 1, py: 1 }}
                                                >
                                                    <MDBox display="flex" alignItems="center" justifyContent="space-between">
                                                        <MDBox>
                                                            <MDTypography variant="subtitle2" fontWeight="medium">
                                                                {problem.title}
                                                            </MDTypography>
                                                            <MDTypography variant="caption" sx={{ mt: 0.5 }}>
                                                                {problem.language}
                                                            </MDTypography>
                                                        </MDBox>
                                                        <IconButton 
                                                            size="small" 
                                                            color="error" 
                                                            onClick={() => handleRemoveProblem(problem.id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </MDBox>
                                                </MDAlert>
                                            ))}
                                        </MDBox>
                                    ) : (
                                        <MDBox textAlign="center" py={2}>
                                            <MDTypography variant="body2" color="text">
                                                선택된 문제가 없습니다
                                            </MDTypography>
                                        </MDBox>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </MDBox>
                </Card>
            </MDBox>

            {/* 삭제 확인 다이얼로그 */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>강의 삭제</DialogTitle>
                <DialogContent>
                    <MDTypography variant="body1">
                        이 강의를 정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
                    </MDTypography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>취소</Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 교육 자료 검색 다이얼로그 */}
            <Dialog 
                open={materialDialogOpen} 
                onClose={handleCloseMaterialDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <MDBox display="flex" alignItems="center" justifyContent="space-between">
                        <MDTypography variant="h6">강의 자료 검색</MDTypography>
                        <IconButton onClick={handleCloseMaterialDialog} size="small">
                            <CloseIcon />
                        </IconButton>
                    </MDBox>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        placeholder="자료 검색..."
                        fullWidth
                        variant="outlined"
                        value={materialSearchTerm}
                        onChange={handleMaterialSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                    />
                    
                    <MDBox sx={{ maxHeight: '400px', overflow: 'auto' }}>
                        {materialsLoading ? (
                            <MDBox textAlign="center" py={3}>
                                <MDTypography variant="body1">
                                    교육 자료를 불러오는 중...
                                </MDTypography>
                            </MDBox>
                        ) : materialsError ? (
                            <MDAlert color="error" my={2}>
                                {materialsError}
                            </MDAlert>
                        ) : filteredMaterials.length > 0 ? (
                            <List>
                                {filteredMaterials.map((material) => (
                                    <ListItem 
                                        key={material.id}
                                        divider
                                        sx={{ 
                                            py: 1.5,
                                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } 
                                        }}
                                    >
                                        <MDBox width="100%">
                                            <MDTypography variant="h6" fontWeight="medium">
                                                {material.title}
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text" sx={{ mt: 0.5 }}>
                                                {material.url}
                                            </MDTypography>
                                            <MDBox display="flex" justifyContent="flex-end" mt={1}>
                                                <MDButton 
                                                    variant="text" 
                                                    color="info"
                                                    size="small"
                                                    onClick={() => {
                                                        handleMaterialSelect(material);
                                                        handleCloseMaterialDialog();
                                                    }}
                                                    sx={{ mr: 1 }}
                                                >
                                                    선택
                                                </MDButton>
                                                <MDButton 
                                                    variant="text" 
                                                    color="info"
                                                    size="small"
                                                    href={material.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    startIcon={<LaunchIcon />}
                                                >
                                                    열기
                                                </MDButton>
                                            </MDBox>
                                        </MDBox>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <MDBox textAlign="center" py={3}>
                                <MDTypography variant="body1">
                                    {materialSearchTerm ? '검색 결과가 없습니다' : '자료를 검색해주세요'}
                                </MDTypography>
                            </MDBox>
                        )}
                    </MDBox>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleOpenNewMaterialDialog} startIcon={<AddIcon />} color="primary">
                        새 교육 자료 등록
                    </Button>
                    <Button onClick={handleCloseMaterialDialog}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 교육 자료 링크 다이얼로그 */}
            <Dialog open={linkDialogOpen} onClose={handleCloseLinkDialog}>
                <DialogTitle>새 교육 자료 등록</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="교육 자료 제목"
                        type="text"
                        fullWidth
                        variant="outlined"
                        placeholder="예: 파이썬 기초 문법"
                        sx={{ mb: 2 }}
                        value={newMaterialTitle}
                        onChange={handleNewMaterialTitleChange}
                    />
                    <TextField
                        margin="dense"
                        label="교육 자료 URL"
                        type="url"
                        fullWidth
                        variant="outlined"
                        value={newMaterialUrl}
                        onChange={handleNewMaterialUrlChange}
                        placeholder="https://gamma.app/docs/..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseLinkDialog}>취소</Button>
                    <Button onClick={handleSaveNewMaterial} color="primary" disabled={!newMaterialTitle || !newMaterialUrl}>
                        저장
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 영상 자료 검색 다이얼로그 */}
            <Dialog 
                open={videoDialogOpen} 
                onClose={handleCloseVideoDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <MDBox display="flex" alignItems="center" justifyContent="space-between">
                        <MDTypography variant="h6">영상 자료 검색</MDTypography>
                        <IconButton onClick={handleCloseVideoDialog} size="small">
                            <CloseIcon />
                        </IconButton>
                    </MDBox>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        placeholder="영상 자료 검색..."
                        fullWidth
                        variant="outlined"
                        value={videoSearchTerm}
                        onChange={handleVideoSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                    />
                    
                    <MDBox sx={{ maxHeight: '400px', overflow: 'auto' }}>
                        {videosLoading ? (
                            <MDBox textAlign="center" py={3}>
                                <MDTypography variant="body1">
                                    영상 자료를 불러오는 중...
                                </MDTypography>
                            </MDBox>
                        ) : videosError ? (
                            <MDAlert color="error" my={2}>
                                {videosError}
                            </MDAlert>
                        ) : filteredVideos.length > 0 ? (
                            <List>
                                {filteredVideos.map((video) => (
                                    <ListItem 
                                        key={video.id}
                                        divider
                                        sx={{ 
                                            py: 1.5,
                                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } 
                                        }}
                                    >
                                        <MDBox width="100%">
                                            <MDTypography variant="h6" fontWeight="medium">
                                                {video.title}
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text" sx={{ mt: 0.5 }}>
                                                {video.url}
                                            </MDTypography>
                                            <MDBox display="flex" justifyContent="flex-end" mt={1}>
                                                <MDButton 
                                                    variant="text" 
                                                    color="warning"
                                                    size="small"
                                                    onClick={() => handleVideoSelect(video)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    선택
                                                </MDButton>
                                                <MDButton 
                                                    variant="text" 
                                                    color="info"
                                                    size="small"
                                                    href={video.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    startIcon={<LaunchIcon />}
                                                >
                                                    열기
                                                </MDButton>
                                            </MDBox>
                                        </MDBox>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <MDBox textAlign="center" py={3}>
                                <MDTypography variant="body1">
                                    {videoSearchTerm ? '검색 결과가 없습니다' : '영상 자료를 검색해주세요'}
                                </MDTypography>
                            </MDBox>
                        )}
                    </MDBox>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleOpenNewVideoDialog} startIcon={<AddIcon />} color="primary">
                        새 영상 자료 등록
                    </Button>
                    <Button onClick={handleCloseVideoDialog}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 새 영상 자료 등록 다이얼로그 */}
            <Dialog open={videoLinkDialogOpen} onClose={handleCloseVideoLinkDialog}>
                <DialogTitle>새 영상 자료 등록</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="영상 자료 제목"
                        type="text"
                        fullWidth
                        variant="outlined"
                        placeholder="예: JavaScript 입문 강의"
                        sx={{ mb: 2 }}
                        value={newVideoTitle}
                        onChange={handleNewVideoTitleChange}
                    />
                    <TextField
                        margin="dense"
                        label="영상 자료 URL"
                        type="url"
                        fullWidth
                        variant="outlined"
                        value={newVideoUrl}
                        onChange={handleNewVideoUrlChange}
                        placeholder="https://www.youtube.com/watch?v=..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseVideoLinkDialog}>취소</Button>
                    <Button onClick={handleSaveNewVideo} color="primary" disabled={!newVideoTitle || !newVideoUrl}>
                        저장
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 문제 검색 다이얼로그 */}
            <Dialog 
                open={problemDialogOpen} 
                onClose={handleCloseProblemDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <MDBox display="flex" alignItems="center" justifyContent="space-between">
                        <MDTypography variant="h6">문제 검색</MDTypography>
                        <IconButton onClick={handleCloseProblemDialog} size="small">
                            <CloseIcon />
                        </IconButton>
                    </MDBox>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                autoFocus
                                margin="dense"
                                placeholder="문제 검색..."
                                fullWidth
                                variant="outlined"
                                value={problemSearchTerm}
                                onChange={handleProblemSearch}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>언어</InputLabel>
                                <Select
                                    value={selectedLanguage}
                                    onChange={handleLanguageChange}
                                    label="언어"
                                >
                                    <MenuItem value="">전체</MenuItem>
                                    {languageOptions.map((lang) => (
                                        <MenuItem key={lang} value={lang}>
                                            {lang}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    
                    <MDBox sx={{ maxHeight: '400px', overflow: 'auto' }}>
                        {problemsLoading ? (
                            <MDBox textAlign="center" py={3}>
                                <MDTypography variant="body1">
                                    문제를 불러오는 중...
                                </MDTypography>
                            </MDBox>
                        ) : problemsError ? (
                            <MDAlert color="error" my={2}>
                                {problemsError}
                            </MDAlert>
                        ) : filteredProblems.length > 0 ? (
                            <List>
                                {filteredProblems.map((problem) => (
                                    <ListItem 
                                        key={problem.id}
                                        divider
                                        sx={{ 
                                            py: 1.5,
                                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } 
                                        }}
                                    >
                                        <MDBox width="100%">
                                            <MDBox display="flex" justifyContent="space-between" alignItems="center">
                                                <MDTypography variant="h6" fontWeight="medium">
                                                    {problem.title}
                                                </MDTypography>
                                                <MDTypography variant="caption" color="text" sx={{ 
                                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1
                                                }}>
                                                    {problem.language}
                                                </MDTypography>
                                            </MDBox>
                                            <MDTypography variant="body2" color="text" sx={{ mt: 0.5 }}>
                                                {problem.description && problem.description.length > 100 
                                                    ? `${problem.description.substring(0, 100)}...` 
                                                    : problem.description}
                                            </MDTypography>
                                            <MDBox display="flex" justifyContent="flex-end" mt={1}>
                                                <MDButton 
                                                    variant="text" 
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleProblemSelect(problem)}
                                                >
                                                    선택
                                                </MDButton>
                                            </MDBox>
                                        </MDBox>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <MDBox textAlign="center" py={3}>
                                <MDTypography variant="body1">
                                    {problemSearchTerm || selectedLanguage ? '검색 결과가 없습니다' : '문제를 검색해주세요'}
                                </MDTypography>
                            </MDBox>
                        )}
                    </MDBox>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseProblemDialog}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            <Footer />
        </DashboardLayout>
    );
}

export default AdminLectureDetail; 