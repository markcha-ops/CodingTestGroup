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
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

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
                                                    <TableCell>난이도</TableCell>
                                                    <TableCell>언어</TableCell>
                                                    <TableCell>생성일</TableCell>
                                                    <TableCell align="center">액션</TableCell>
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
                                                            <TableCell>Lv. {question.lv}</TableCell>
                                                            <TableCell>{programmingLanguages.find(lang => lang.value === question.language)?.label || question.language}</TableCell>
                                                            <TableCell>{formatDate(question.createdAt)}</TableCell>
                                                            <TableCell align="center">
                                                                <Tooltip title="문제 풀기">
                                                                    <IconButton 
                                                                        color="primary"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSolveQuestion(question.id);
                                                                        }}
                                                                    >
                                                                        <CodeIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="수정">
                                                                    <IconButton 
                                                                        color="info"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditQuestion(question.id);
                                                                        }}
                                                                    >
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="삭제">
                                                                    <IconButton 
                                                                        color="error"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteConfirmOpen(question.id);
                                                                        }}
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
                                
                                {/* Create new question button */}
                                <MDBox mt={3} display="flex" justifyContent="flex-end">
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
            
            <Footer />
        </DashboardLayout>
    );
}

export default QuestionList; 