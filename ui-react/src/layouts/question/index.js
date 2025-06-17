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
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormLabel from "@mui/material/FormLabel";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

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
        inputData: '',
        testCases: '',
        language: 'PYTHON',
        lv: 5,
        isCompare: false,
        compareCode: ''
    });
    
    const [inputMode, setInputMode] = useState('simple'); // 'simple' or 'testcases'
    const [testCasesArray, setTestCasesArray] = useState([
        { input: '', output: '' }
    ]);
    
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
                inputData: questionData.inputData,
                testCases: questionData.testCases,
                language: questionData.language,
                lv: questionData.lv,
                isCompare: questionData.isCompare || false,
                compareCode: questionData.compareCode || ''
            });
            
            // Set input mode based on isTestCase value
            if (questionData.isTestCase) {
                setInputMode('testcases');
                // Parse test cases if they exist
                if (questionData.testCases) {
                    try {
                        const parsedTestCases = JSON.parse(questionData.testCases);
                        if (Array.isArray(parsedTestCases) && parsedTestCases.length > 0) {
                            setTestCasesArray(parsedTestCases.map(tc => ({
                                input: Array.isArray(tc.input) ? tc.input.join('\n') : tc.input.toString(),
                                output: tc.output
                            })));
                        }
                    } catch (e) {
                        console.warn('Failed to parse test cases:', e);
                    }
                }
            } else {
                setInputMode('simple');
            }
            
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
    
    const handleInputDataChange = (e) => {
        setQuestion(prev => ({
            ...prev,
            inputData: e.target.value
        }));
    };

    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;
        setQuestion(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleInputModeChange = (e) => {
        setInputMode(e.target.value);
    };

    const handleTestCaseChange = (index, field, value) => {
        const updatedTestCases = [...testCasesArray];
        updatedTestCases[index][field] = value;
        setTestCasesArray(updatedTestCases);
    };

    const addTestCase = () => {
        setTestCasesArray([...testCasesArray, { input: '', output: '' }]);
    };

    const removeTestCase = (index) => {
        if (testCasesArray.length > 1) {
            const updatedTestCases = testCasesArray.filter((_, i) => i !== index);
            setTestCasesArray(updatedTestCases);
        }
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
            
            // Process test cases based on input mode
            let testCasesData = '';
            let inputDataString = question.inputData;
            
            if (inputMode === 'testcases') {
                // Convert test cases array to JSON string
                const formattedTestCases = testCasesArray.map(tc => ({
                    input: tc.input.split('\n').map(line => {
                        // Try to convert to number if possible
                        const trimmed = line.trim();
                        return /^\d+$/.test(trimmed) ? parseInt(trimmed) : trimmed;
                    }),
                    output: tc.output
                }));
                testCasesData = JSON.stringify(formattedTestCases);
                inputDataString = ''; // Clear simple input data when using test cases
            }
            
            // Prepare data for API according to backend structure
            const questionData = {
                title: question.title,
                content: question.content,
                language: question.language,
                lv: parseInt(question.lv),
                answer: question.answer,
                initialCode: question.initialCode,
                inputData: inputDataString,
                testCases: testCasesData,
                isTestCase: inputMode === 'testcases', // 테스트 케이스 배열인지 단순 입력 데이터인지 구분
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
                inputData: responseData.inputData,
                testCases: responseData.testCases,
                language: responseData.language,
                lv: responseData.lv,
                isCompare: responseData.isCompare || false,
                compareCode: responseData.compareCode || ''
            });
            
            // Set input mode based on isTestCase value from response
            if (responseData.isTestCase) {
                setInputMode('testcases');
                // Parse test cases if they exist
                if (responseData.testCases) {
                    try {
                        const parsedTestCases = JSON.parse(responseData.testCases);
                        if (Array.isArray(parsedTestCases) && parsedTestCases.length > 0) {
                            setTestCasesArray(parsedTestCases.map(tc => ({
                                input: Array.isArray(tc.input) ? tc.input.join('\n') : tc.input.toString(),
                                output: tc.output
                            })));
                        }
                    } catch (e) {
                        console.warn('Failed to parse test cases:', e);
                    }
                }
            } else {
                setInputMode('simple');
            }
            
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
                                <MDTypography variant="h6" color="text" gutterBottom>
                                    입력 데이터 설정
                                </MDTypography>
                                
                                <FormControl component="fieldset" margin="normal">
                                    <FormLabel component="legend">입력 방식 선택</FormLabel>
                                    <RadioGroup
                                        value={inputMode}
                                        onChange={handleInputModeChange}
                                        row
                                    >
                                        <FormControlLabel
                                            value="simple"
                                            control={<Radio />}
                                            label="단순 입력 데이터"
                                        />
                                        <FormControlLabel
                                            value="testcases"
                                            control={<Radio />}
                                            label="테스트 케이스 배열"
                                        />
                                    </RadioGroup>
                                </FormControl>

                                {inputMode === 'simple' ? (
                                    <Box>
                                        <MDTypography variant="body2" color="text" gutterBottom>
                                            Python의 input() 함수나 Java의 Scanner 등을 사용하는 문제의 경우 입력 데이터를 제공하세요. 
                                            여러 줄의 입력이 필요한 경우 줄바꿈으로 구분하여 입력하세요.
                                        </MDTypography>
                                        <TextField
                                            multiline
                                            rows={6}
                                            name="inputData"
                                            value={question.inputData}
                                            onChange={handleInputDataChange}
                                            variant="outlined"
                                            placeholder="테스트 케이스의 입력 데이터를 입력하세요 (예: 5\n3\nHello World)"
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Box>
                                ) : (
                                    <Box>
                                        <MDTypography variant="body2" color="text" gutterBottom>
                                            여러 개의 입력-출력 테스트 케이스를 정의하세요. 각 테스트 케이스마다 다른 입력값과 예상 출력값을 설정할 수 있습니다.
                                        </MDTypography>
                                        
                                        {testCasesArray.map((testCase, index) => (
                                            <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                    <MDTypography variant="h6" color="text">
                                                        테스트 케이스 {index + 1}
                                                    </MDTypography>
                                                    {testCasesArray.length > 1 && (
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => removeTestCase(index)}
                                                            size="small"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                                
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="입력값"
                                                            multiline
                                                            rows={4}
                                                            value={testCase.input}
                                                            onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                                            placeholder="입력값을 한 줄씩 입력하세요&#10;예:&#10;5&#10;10"
                                                            fullWidth
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="예상 출력값"
                                                            multiline
                                                            rows={4}
                                                            value={testCase.output}
                                                            onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                                            placeholder="예상되는 출력값을 입력하세요"
                                                            fullWidth
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        ))}
                                        
                                        <Box display="flex" justifyContent="center" mt={2}>
                                            <MDButton
                                                variant="outlined"
                                                color="info"
                                                startIcon={<AddIcon />}
                                                onClick={addTestCase}
                                            >
                                                테스트 케이스 추가
                                            </MDButton>
                                        </Box>
                                    </Box>
                                )}
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