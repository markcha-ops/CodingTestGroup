/**
 * Question component - For creating and editing coding questions
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import SaveIcon from "@mui/icons-material/Save";
import CodeIcon from "@mui/icons-material/Code";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Markdown editor components
import ReactMarkdown from "react-markdown";
import MonacoEditor from "react-monaco-editor";

import api from '../../api';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Question() {
    const location = useLocation();
    const questionId = location.state?.questionId;
    const courseId = location.state?.courseId || '00000000-0000-0000-0000-000000000000'; // Default UUID
    const navigate = useNavigate();
    
    const [question, setQuestion] = useState({
        title: '',
        content: '',
        answer: '',
        initialCode: '',
        language: 'JAVA',
        lv: 5,
        isCompare: false,
        compareCode: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    const programmingLanguages = [
        // { value: 'JAVA', label: 'Java' },
        // { value: 'C', label: 'C' },
        { value: 'PYTHON', label: 'Python' },
        // { value: 'CPP', label: 'C++' },
        // { value: 'SQL', label: 'SQL' },
        // { value: 'JAVASCRIPT', label: 'JavaScript' },
        // { value: 'TYPESCRIPT', label: 'TypeScript' },
        // { value: 'KOTLIN', label: 'Kotlin' },
        // { value: 'SWIFT', label: 'Swift' },
        // { value: 'RUBY', label: 'Ruby' },
        // { value: 'PHP', label: 'PHP' },
        // { value: 'RUST', label: 'Rust' },
        // { value: 'GOLANG', label: 'Go' },
        // { value: 'SCALA', label: 'Scala' },
        // { value: 'HASKELL', label: 'Haskell' },
        // { value: 'ELIXIR', label: 'Elixir' }
    ];
    
    // Create an array of difficulty levels from 1 to 15
    const difficultyLevels = Array.from({ length: 15 }, (_, i) => ({
        value: i + 1, 
        label: `${i + 1}lv`
    }));
    
    // Monaco editor options
    const editorOptions = {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: "line",
        automaticLayout: true,
        minimap: { enabled: false }
    };

    useEffect(() => {
        if (questionId) {
            fetchQuestionData();
        }
    }, [questionId]);

    const fetchQuestionData = async () => {
        if (!questionId) return;
        
        setLoading(true);
        try {
            const response = await api.get(`/api/question/${questionId}`);
            const questionData = response.data;
            
            setQuestion({
                title: questionData.title,
                content: questionData.content,
                answer: questionData.answer,
                initialCode: questionData.initialCode,
                language: questionData.language,
                lv: questionData.lv,
                isCompare: questionData.isCompare || false,
                compareCode: questionData.compareCode || ''
            });
            
            setError(null);
        } catch (err) {
            console.error('Failed to fetch question details:', err);
            setError('문제 정보를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuestion(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleContentChange = (newContent) => {
        setQuestion(prev => ({
            ...prev,
            content: newContent
        }));
    };
    
    const handleInitCodeChange = (newCode) => {
        setQuestion(prev => ({
            ...prev,
            initialCode: newCode
        }));
    };

    const handleCompareCodeChange = (newCode) => {
        setQuestion(prev => ({
            ...prev,
            compareCode: newCode
        }));
    };
    
    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;
        setQuestion(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmit = async () => {
        // Validate form data
        if (!question.title.trim()) {
            setError('문제 제목을 입력해주세요.');
            return;
        }
        
        if (!question.content.trim()) {
            setError('문제 내용을 입력해주세요.');
            return;
        }
        
        // Validate compareCode when isCompare is true
        if (question.isCompare && !question.compareCode.trim()) {
            setError('비교 코드를 입력해주세요.');
            return;
        }
        
        try {
            setLoading(true);
            
            // Prepare data for API according to backend structure
            const questionData = {
                courseId: courseId, // Use the courseId from location state
                title: question.title,
                content: question.content,
                language: question.language,
                lv: parseInt(question.lv),
                answer: question.answer,
                initialCode: question.initialCode,
                isCompare: question.isCompare,
                compareCode: question.compareCode
            };
            
            let response;
            if (questionId) {
                // Update existing question
                response = await api.put(`/api/questions/${questionId}`, questionData);
                setSuccessMessage('문제가 성공적으로 수정되었습니다.');
            } else {
                // Create new question
                response = await api.post('/api/questions', questionData);
                setSuccessMessage('새로운 문제가 성공적으로 등록되었습니다.');
            }
            
            // Update state with the response
            const responseData = response.data;
            setQuestion({
                title: responseData.title,
                content: responseData.content,
                answer: responseData.answer,
                initialCode: responseData.initialCode,
                language: responseData.language,
                lv: responseData.lv,
                isCompare: responseData.isCompare || false,
                compareCode: responseData.compareCode || ''
            });
            
            // 3초 후 성공 메시지 숨기기
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
        } catch (error) {
            console.error('문제 저장 실패:', error);
            setError('문제 정보 저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={2} mb={3}>
                <MDBox mb={2}>
                    <MDTypography variant="h4" fontWeight="medium">
                        코딩 문제 {questionId ? '수정' : '생성'}
                    </MDTypography>
                </MDBox>
                
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
                            <TextField
                                fullWidth
                                label="문제 제목"
                                name="title"
                                value={question.title}
                                onChange={handleInputChange}
                                variant="outlined"
                                placeholder="문제의 제목을 입력하세요"
                                margin="normal"
                            />
                        } 
                    />
                    <CardContent>
                        <Grid container spacing={3}>
                            {/* Programming Language selection right after title */}
                            <Grid item xs={12} md={6}>
                                <MDTypography variant="h6" color="text" gutterBottom>
                                    프로그래밍 언어
                                </MDTypography>
                                <FormControl fullWidth margin="normal" sx={{ height: '45px' }}>
                                    <InputLabel id="language-label">프로그래밍 언어</InputLabel>
                                    <Select
                                        labelId="language-label"
                                        name="language"
                                        value={question.language}
                                        onChange={handleInputChange}
                                        label="프로그래밍 언어"
                                        sx={{ height: '100%' }}
                                    >
                                        {programmingLanguages.map((lang) => (
                                            <MenuItem key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            {/* Difficulty level selection */}
                            <Grid item xs={12} md={6}>
                                <MDTypography variant="h6" color="text" gutterBottom>
                                    난이도
                                </MDTypography>
                                <FormControl fullWidth margin="normal" sx={{ height: '45px' }}>
                                    <InputLabel id="lv-label">난이도</InputLabel>
                                    <Select
                                        labelId="lv-label"
                                        name="lv"
                                        value={question.lv}
                                        onChange={handleInputChange}
                                        label="난이도"
                                        sx={{ height: '100%' }}
                                    >
                                        {difficultyLevels.map((level) => (
                                            <MenuItem key={level.value} value={level.value}>
                                                {level.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <MDTypography variant="h6" color="text" gutterBottom>
                                    문제 내용 (Markdown)
                                </MDTypography>
                                <MDBox mb={2} sx={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}>
                                    <MonacoEditor
                                        width="100%"
                                        height="400"
                                        language="markdown"
                                        theme="vs-light"
                                        value={question.content}
                                        options={editorOptions}
                                        onChange={handleContentChange}
                                    />
                                </MDBox>
                                
                                <MDTypography variant="h6" color="text" gutterBottom>
                                    미리보기
                                </MDTypography>
                                <MDBox 
                                    p={3} 
                                    border="1px solid #eee" 
                                    borderRadius="8px" 
                                    bgcolor="#f9f9f9" 
                                    mb={3}
                                    height="300px"
                                    overflow="auto"
                                >
                                    <ReactMarkdown>{question.content}</ReactMarkdown>
                                </MDBox>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <MDTypography variant="h6" color="text" gutterBottom>
                                    정답 문자열
                                </MDTypography>
                                <TextField
                                    multiline
                                    rows={4}
                                    name="answer"
                                    value={question.answer}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    placeholder="문제의 정답 문자열을 입력하세요"
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <MDBox my={2}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={question.isCompare}
                                                onChange={handleSwitchChange}
                                                name="isCompare"
                                                color="primary"
                                            />
                                        }
                                        label="결과 비교 모드 사용"
                                    />
                                    <MDTypography variant="caption" color="text">
                                        {question.isCompare 
                                            ? "비교 코드의 실행 결과와 사용자 코드의 실행 결과가 동일해야 정답으로 처리됩니다." 
                                            : "일반적인 Python/Java 프로그램 답안 비교 방식으로 처리됩니다."}
                                    </MDTypography>
                                </MDBox>
                            </Grid>
                            
                            {question.isCompare && (
                                <Grid item xs={12}>
                                    <MDTypography variant="h6" color="text" gutterBottom>
                                        비교 코드
                                    </MDTypography>
                                    <MDBox mb={2} sx={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}>
                                        <MonacoEditor
                                            width="100%"
                                            height="300"
                                            language={question.language ? question.language.toLowerCase() : 'java'}
                                            theme="vs-light"
                                            value={question.compareCode}
                                            options={editorOptions}
                                            onChange={handleCompareCodeChange}
                                        />
                                    </MDBox>
                                </Grid>
                            )}
                            
                            <Grid item xs={12}>
                                <MDTypography variant="h6" color="text" gutterBottom>
                                    초기화 코드
                                </MDTypography>
                                <MDBox mb={2} sx={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}>
                                    <MonacoEditor
                                        width="100%"
                                        height="300"
                                        language={question.language ? question.language.toLowerCase() : 'java'}
                                        theme="vs-light"
                                        value={question.initialCode}
                                        options={editorOptions}
                                        onChange={handleInitCodeChange}
                                    />
                                </MDBox>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                
                <MDBox mt={3} display="flex" justifyContent="flex-end">
                    <MDButton 
                        variant="contained" 
                        color="info" 
                        startIcon={<SaveIcon />} 
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={24} color="inherit" />&nbsp;
                                저장 중...
                            </>
                        ) : (
                            questionId ? '문제 수정하기' : '문제 등록하기'
                        )}
                    </MDButton>
                </MDBox>
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default Question; 