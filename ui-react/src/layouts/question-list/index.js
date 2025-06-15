/**
 * Question List Component - For viewing and searching coding questions
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CodeIcon from "@mui/icons-material/Code";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

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

function QuestionList() {
    const navigate = useNavigate();
    
    // State variables
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [language, setLanguage] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const [bulkCreateDialogOpen, setBulkCreateDialogOpen] = useState(false);
    const [bulkCreateData, setBulkCreateData] = useState('');
    const [bulkCreating, setBulkCreating] = useState(false);
    const [bulkCreateProgress, setBulkCreateProgress] = useState(0);
    const [bulkCreateResult, setBulkCreateResult] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [activatingQuestionId, setActivatingQuestionId] = useState(null);
    
    // Available programming languages
    const programmingLanguages = [
        { value: '', label: '모든 언어' },
        { value: 'JAVA', label: 'Java' },
        { value: 'C', label: 'C' },
        { value: 'PYTHON', label: 'Python' },
        { value: 'CPP', label: 'C++' },
        { value: 'SQL', label: 'SQL' },
        { value: 'JAVASCRIPT', label: 'JavaScript' },
        { value: 'TYPESCRIPT', label: 'TypeScript' },
        { value: 'KOTLIN', label: 'Kotlin' },
        { value: 'SWIFT', label: 'Swift' },
        { value: 'RUBY', label: 'Ruby' },
        { value: 'PHP', label: 'PHP' },
        { value: 'RUST', label: 'Rust' },
        { value: 'GOLANG', label: 'Go' },
        { value: 'SCALA', label: 'Scala' },
        { value: 'HASKELL', label: 'Haskell' },
        { value: 'ELIXIR', label: 'Elixir' }
    ];
    
    // Fetch questions based on filters
    const fetchQuestions = async (languageFilter = language, keywordFilter = keyword) => {
        setLoading(true);
        try {
            // Prepare query parameters for the API call
            const params = {};
            if (languageFilter) params.language = languageFilter;
            if (keywordFilter) params.keyword = keywordFilter;
            
            const response = await api.get('/api/questions', { params });
            setQuestions(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch questions:', err);
            setError('문제 목록을 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchQuestions();
    }, []);

    // Handle search action
    const handleSearch = () => {
        fetchQuestions(language, keyword);
    };

    // Handle language filter change
    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        fetchQuestions(newLanguage, keyword);
    };

    // Handle keyword search input
    const handleKeywordChange = (e) => {
        setKeyword(e.target.value);
    };
    
    // Handle Enter key press in search field
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Navigate to edit question page
    const handleEditQuestion = (questionId) => {
        navigate('/question', { state: { questionId } });
    };

    // Open delete confirmation dialog
    const handleDeleteConfirmOpen = (questionId) => {
        setSelectedQuestionId(questionId);
        setDeleteDialogOpen(true);
    };

    // Close delete confirmation dialog
    const handleDeleteConfirmClose = () => {
        setDeleteDialogOpen(false);
        setSelectedQuestionId(null);
    };

    // Delete a question
    const handleDeleteQuestion = async () => {
        if (!selectedQuestionId) return;
        
        try {
            await api.delete(`/api/questions/${selectedQuestionId}`);
            // Remove the deleted question from the state
            setQuestions(questions.filter(q => q.id !== selectedQuestionId));
            // Close the dialog
            handleDeleteConfirmClose();
        } catch (err) {
            console.error('Failed to delete question:', err);
            setError('문제 삭제에 실패했습니다.');
            handleDeleteConfirmClose();
        }
    };

    // Navigate to solving page
    const handleSolveQuestion = (questionId) => {
        navigate('/coding', { state: { questionId } });
    };

    // Format creation date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { 
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    // Open bulk create dialog
    const handleBulkCreateOpen = () => {
        setBulkCreateDialogOpen(true);
        setBulkCreateData('');
        setBulkCreateResult(null);
        setBulkCreateProgress(0);
    };

    // Close bulk create dialog
    const handleBulkCreateClose = () => {
        if (!bulkCreating) {
            setBulkCreateDialogOpen(false);
            setBulkCreateData('');
            setBulkCreateResult(null);
            setBulkCreateProgress(0);
        }
    };

    // Handle bulk create
    const handleBulkCreate = async () => {
        if (!bulkCreateData.trim()) {
            setError('JSON 데이터를 입력해주세요.');
            return;
        }

        setBulkCreating(true);
        setBulkCreateProgress(0);
        setBulkCreateResult(null);

        try {
            // Parse JSON data
            const questionsData = JSON.parse(bulkCreateData);
            
            if (!Array.isArray(questionsData)) {
                throw new Error('JSON 데이터는 배열 형태여야 합니다.');
            }

            const total = questionsData.length;
            let successCount = 0;
            let failureCount = 0;
            const errors = [];

            // Process each question
            for (let i = 0; i < questionsData.length; i++) {
                const questionData = questionsData[i];
                
                try {
                    // Prepare data for API (exclude server-generated fields)
                    const apiData = {
                        courseId: '00000000-0000-0000-0000-000000000000', // Default courseId
                        title: questionData.title || '',
                        content: questionData.content || '',
                        language: questionData.language || 'PYTHON',
                        lv: questionData.lv || 1,
                        answer: questionData.answer || '',
                        initialCode: questionData.initialCode || '',
                        isCompare: questionData.isCompare || false,
                        compareCode: questionData.compareCode || ''
                    };

                    await api.post('/api/questions', apiData);
                    successCount++;
                } catch (err) {
                    failureCount++;
                    errors.push(`문제 ${i + 1}: ${err.response?.data?.message || err.message}`);
                }

                // Update progress
                setBulkCreateProgress(((i + 1) / total) * 100);
            }

            // Set result
            setBulkCreateResult({
                total,
                successCount,
                failureCount,
                errors
            });

            // Refresh question list if any questions were created successfully
            if (successCount > 0) {
                fetchQuestions();
            }

        } catch (err) {
            console.error('Bulk create error:', err);
            setError('JSON 파싱 오류: ' + err.message);
        } finally {
            setBulkCreating(false);
        }
    };

    // Activate/Deactivate handlers
    const handleActivateQuestion = async (questionId, isActive) => {
        setActivatingQuestionId(questionId);
        try {
            const endpoint = isActive ? 'deactivate' : 'activate';
            const response = await fetch(`/api/questions/${questionId}/${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                // Refresh the questions list
                await fetchQuestions();
            } else {
                console.error(`Failed to ${endpoint} question`);
            }
        } catch (error) {
            console.error(`Error ${isActive ? 'deactivating' : 'activating'} question:`, error);
        } finally {
            setActivatingQuestionId(null);
        }
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox pt={6} pb={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <MDBox
                                variant="gradient"
                                bgColor="info"
                                borderRadius="lg"
                                coloredShadow="info"
                                mx={2}
                                mt={-3}
                                p={2}
                                mb={1}
                                textAlign="center"
                            >
                                <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
                                    코딩 문제 목록
                                </MDTypography>
                            </MDBox>
                            <MDBox p={3}>
                                {error && (
                                    <MDAlert color="warning" mt={2} mb={2}>
                                        {error}
                                    </MDAlert>
                                )}
                                
                                {/* Filters */}
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="문제 검색"
                                            value={keyword}
                                            onChange={handleKeywordChange}
                                            onKeyPress={handleKeyPress}
                                            placeholder="문제 제목 또는 내용 검색"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={handleSearch}>
                                                            <SearchIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth variant="outlined">
                                            <InputLabel id="language-select-label">프로그래밍 언어</InputLabel>
                                            <Select
                                                labelId="language-select-label"
                                                value={language}
                                                onChange={handleLanguageChange}
                                                label="프로그래밍 언어"
                                            >
                                                {programmingLanguages.map((lang) => (
                                                    <MenuItem key={lang.value} value={lang.value}>
                                                        {lang.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                {/* Questions Table */}
                                {loading ? (
                                    <MDBox display="flex" justifyContent="center" p={3}>
                                        <CircularProgress color="info" />
                                    </MDBox>
                                ) : (
                                    <TableContainer component={Paper}>
                                        <Table sx={{ minWidth: 650 }} aria-label="question table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>제목</TableCell>
                                                    <TableCell>태그</TableCell>
                                                    <TableCell>난이도</TableCell>
                                                    <TableCell>언어</TableCell>
                                                    <TableCell>상태</TableCell>
                                                    <TableCell>생성일</TableCell>
                                                    <TableCell align="right">작업</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {questions.length > 0 ? (
                                                    questions.map((question) => (
                                                        <TableRow
                                                            key={question.id}
                                                            sx={{
                                                                '&:hover': { backgroundColor: '#f5f5f5', cursor: 'pointer' },
                                                            }}
                                                            onClick={() => handleSolveQuestion(question.id)}
                                                        >
                                                            <TableCell component="th" scope="row">
                                                                {question.title}
                                                            </TableCell>
                                                            <TableCell>{question.tags.map(tag => tag.name).join(', ')}</TableCell>
                                                            <TableCell>Lv. {question.lv}</TableCell>
                                                            <TableCell>{programmingLanguages.find(lang => lang.value === question.language)?.label || question.language}</TableCell>
                                                            <TableCell>{question.isActive ? "활성" : "비활성"}</TableCell>
                                                            <TableCell>{formatDate(question.createdAt)}</TableCell>
                                                            <TableCell align="right">
                                                                <Tooltip title="문제 풀기">
                                                                    <IconButton
                                                                        onClick={() => handleSolveQuestion(question.id)}
                                                                        color="primary"
                                                                        size="small"
                                                                    >
                                                                        <CodeIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                
                                                                <Tooltip title={question.isActive ? "비활성화" : "활성화"}>
                                                                    <IconButton
                                                                        onClick={() => handleActivateQuestion(question.id, question.isActive)}
                                                                        color={question.isActive ? "error" : "success"}
                                                                        size="small"
                                                                        disabled={activatingQuestionId === question.id}
                                                                    >
                                                                        {activatingQuestionId === question.id ? (
                                                                            <CircularProgress size={20} />
                                                                        ) : question.isActive ? (
                                                                            <PauseIcon />
                                                                        ) : (
                                                                            <PlayArrowIcon />
                                                                        )}
                                                                    </IconButton>
                                                                </Tooltip>
                                                                
                                                                <Tooltip title="수정">
                                                                    <IconButton
                                                                        onClick={() => handleEditQuestion(question.id)}
                                                                        color="primary"
                                                                        size="small"
                                                                    >
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                
                                                                <Tooltip title="삭제">
                                                                    <IconButton
                                                                        onClick={() => handleDeleteConfirmOpen(question.id)}
                                                                        color="error"
                                                                        size="small"
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center">
                                                            문제가 없습니다. 새 문제를 추가하세요.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                                
                                {/* Create new question buttons */}
                                <MDBox mt={3} display="flex" justifyContent="flex-end" gap={2}>
                                    <MDButton 
                                        variant="outlined" 
                                        color="info" 
                                        onClick={handleBulkCreateOpen}
                                    >
                                        문제 일괄 생성
                                    </MDButton>
                                    <MDButton 
                                        variant="contained" 
                                        color="info" 
                                        startIcon={<CodeIcon />} 
                                        onClick={() => navigate('/question')}
                                    >
                                        새 문제 만들기
                                    </MDButton>
                                </MDBox>
                            </MDBox>
                        </Card>
                    </Grid>
                </Grid>
            </MDBox>
            
            {/* Confirmation Dialog for Deleting Question */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteConfirmClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"문제 삭제 확인"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        이 문제를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteConfirmClose} color="primary">
                        취소
                    </Button>
                    <Button onClick={handleDeleteQuestion} color="error" autoFocus>
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Create Dialog */}
            <Dialog
                open={bulkCreateDialogOpen}
                onClose={handleBulkCreateClose}
                maxWidth="md"
                fullWidth
                aria-labelledby="bulk-create-dialog-title"
            >
                <DialogTitle id="bulk-create-dialog-title">
                    문제 일괄 생성
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        JSON 형식으로 여러 문제를 한 번에 생성할 수 있습니다. 다음 형식의 배열을 입력하세요:
                    </DialogContentText>
                    <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
{`[
  {
    "title": "문제 제목",
    "content": "문제 내용",
    "language": "PYTHON",
    "lv": 5,
    "answer": "정답",
    "initialCode": "초기 코드",
    "isCompare": false,
    "compareCode": ""
  }
]`}
                        </Typography>
                    </Box>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="JSON 데이터"
                        multiline
                        rows={10}
                        fullWidth
                        variant="outlined"
                        value={bulkCreateData}
                        onChange={(e) => setBulkCreateData(e.target.value)}
                        placeholder="문제 데이터를 JSON 배열 형식으로 입력하세요..."
                        disabled={bulkCreating}
                    />
                    
                    {bulkCreating && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" gutterBottom>
                                문제 생성 중... ({Math.round(bulkCreateProgress)}%)
                            </Typography>
                            <LinearProgress variant="determinate" value={bulkCreateProgress} />
                        </Box>
                    )}
                    
                    {bulkCreateResult && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" gutterBottom>
                                생성 완료: 전체 {bulkCreateResult.total}개 중 성공 {bulkCreateResult.successCount}개, 실패 {bulkCreateResult.failureCount}개
                            </Typography>
                            {bulkCreateResult.errors.length > 0 && (
                                <Box sx={{ maxHeight: 200, overflow: 'auto', mt: 1 }}>
                                    <Typography variant="body2" color="error" gutterBottom>
                                        오류 목록:
                                    </Typography>
                                    {bulkCreateResult.errors.map((error, index) => (
                                        <Typography key={index} variant="body2" color="error" sx={{ fontSize: '0.75rem' }}>
                                            • {error}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleBulkCreateClose} disabled={bulkCreating}>
                        {bulkCreateResult ? '닫기' : '취소'}
                    </Button>
                    {!bulkCreateResult && (
                        <Button 
                            onClick={handleBulkCreate} 
                            variant="contained" 
                            disabled={bulkCreating || !bulkCreateData.trim()}
                        >
                            {bulkCreating ? '생성 중...' : '일괄 생성'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
            
            <Footer />
        </DashboardLayout>
    );
}

export default QuestionList; 