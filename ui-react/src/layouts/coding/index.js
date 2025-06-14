/**
 * Coding Page - Shows a problem and provides coding interface
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SendIcon from "@mui/icons-material/Send";
import CodeIcon from "@mui/icons-material/Code";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Resizable } from 're-resizable';
import DragHandleIcon from '@mui/icons-material/DragHandle';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Markdown and Syntax Highlighting
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Editor from '@monaco-editor/react';

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// API client
import api from '../../api';

// React hooks
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function CodingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get question ID from location state
    const questionId = location.state?.questionId;
    
    // State variables
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('');
    const [executionResult, setExecutionResult] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [questionSolved, setQuestionSolved] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    
    // Language options
    const languageOptions = [
        { value: 'JAVA', label: 'Java', template: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}' },
        { value: 'C', label: 'C', template: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}' },
        { value: 'PYTHON', label: 'Python', template: '# Your code here' },
        { value: 'CPP', label: 'C++', template: '#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}' },
        { value: 'JAVASCRIPT', label: 'JavaScript', template: '// Your code here' },
        { value: 'SQL', label: 'SQL', template: '-- Your SQL query here\nSELECT * FROM table_name;' },
    ];
    
    // 코드 편집기 ref
    const editorRef = useRef(null);

    // 에디터 초기화 핸들러
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        // 에디터 마운트 후 필요한 작업 수행 가능
    };
    
    // Fetch question data when component mounts
    useEffect(() => {
        const fetchQuestionData = async () => {
            setLoading(true);
            try {
                if (!questionId) {
                    setError('문제 ID가 없습니다. 강의 페이지로 돌아가 다시 시도해주세요.');
                    setLoading(false);
                    return;
                }
                
                const response = await api.get(`/api/question/${questionId}`);
                
                if (response.data) {
                    setQuestion(response.data);
                    
                    // Set default language if available
                    if (response.data.language) {
                        setLanguage(response.data.language);
                        
                        // Set template code based on language
                        const template = languageOptions.find(opt => opt.value === response.data.language)?.template || '';
                        setCode(template);
                    }
                    
                    // Check if question has been solved
                    await checkQuestionStatus(questionId);
                } else {
                    setError('문제 정보를 찾을 수 없습니다.');
                }
                
                setError(null);
            } catch (err) {
                console.error('Failed to fetch question details:', err);
                setError('문제 정보를 가져오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestionData();
    }, [questionId]);
    
    // Check question status (whether it has been solved with score 100)
    const checkQuestionStatus = async (questionId) => {
        setStatusLoading(true);
        try {
            const response = await api.post(`/api/submissions/questions/status/${questionId}`, {
                code: "dummy", // API에서 요구하는 필수 필드
                language: "JAVA" // API에서 요구하는 필수 필드
            });
            
            setQuestionSolved(response.data === true);
        } catch (err) {
            console.error('Failed to check question status:', err);
            // 상태 확인 실패는 치명적이지 않으므로 에러 표시하지 않음
            setQuestionSolved(false);
        } finally {
            setStatusLoading(false);
        }
    };
    
    // Handle changes in language selection
    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        setLanguage(newLanguage);
        
        // Set template code based on language
        const template = languageOptions.find(opt => opt.value === newLanguage)?.template || '';
        setCode(template);
    };
    
    // Language mapping for Monaco Editor
    const getMonacoLanguage = (lang) => {
        const languageMap = {
            // 'JAVA': 'java',
            // 'C': 'c',
            // 'CPP': 'cpp',
            'PYTHON': 'python',
            // 'JAVASCRIPT': 'javascript',
            // 'TYPESCRIPT': 'typescript',
            // 'SQL': 'sql'
        };
        return languageMap[lang] || 'plaintext';
    };

    // Handle Monaco Editor Change
    const handleEditorChange = (value) => {
        setCode(value || '');
    };
    
    // Execute code
    const handleExecute = async () => {
        setExecuting(true);
        setExecutionResult(null);
        
        try {
            const response = await api.post('/api/submissions/debug', {
                code: code,
                language: language
            });
            
            setExecutionResult(response.data);
        } catch (err) {
            console.error('Failed to execute code:', err);
            setExecutionResult({
                success: false,
                message: '코드 실행에 실패했습니다.',
                error: err.response?.data?.message || '서버 오류가 발생했습니다.'
            });
        } finally {
            setExecuting(false);
        }
    };
    
    // Submit code
    const handleSubmit = async () => {
        setSubmitting(true);
        setSubmissionResult(null);
        
        try {
            const response = await api.post(`/api/submissions/questions/${questionId}`, {
                code: code,
                language: language
            });
            
            setSubmissionResult(response.data);
            
            // If submission was successful with perfect score, update question status
            if (response.data && response.data.score === 100) {
                setQuestionSolved(true);
            }
        } catch (err) {
            console.error('Failed to submit code:', err);
            setSubmissionResult({
                success: false,
                message: '코드 제출에 실패했습니다.',
                error: err.response?.data?.message || '서버 오류가 발생했습니다.'
            });
        } finally {
            setSubmitting(false);
        }
    };
    
    // Handle SQL debugging specifically
    const handleSqlDebug = async () => {
        setExecuting(true);
        setExecutionResult(null);
        
        try {
            const response = await api.post('/api/submissions/debug', {
                code: code,
                language: 'SQL'
            });
            
            setExecutionResult(response.data);
        } catch (err) {
            console.error('Failed to debug SQL code:', err);
            setExecutionResult({
                success: false,
                message: 'SQL 쿼리 실행에 실패했습니다.',
                error: err.response?.data?.message || '서버 오류가 발생했습니다.'
            });
        } finally {
            setExecuting(false);
        }
    };
    
    // Go back to lecture page
    const handleBack = () => {
        navigate(-1);
    };
    
    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={handleBack}
                    >
                        강의로 돌아가기
                    </Button>
                </MDBox>
                
                {loading ? (
                    <Card>
                        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                            <CircularProgress />
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Card>
                        <CardContent>
                            <Alert severity="error">{error}</Alert>
                        </CardContent>
                    </Card>
                ) : question ? (
                    <MDBox sx={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
                        {/* Problem Description - Left Side */}
                        <Resizable
                            defaultSize={{ width: '50%', height: 'auto' }}
                            minWidth="30%"
                            maxWidth="70%"
                            enable={{ 
                                right: true 
                            }}
                            handleComponent={{
                                right: (
                                    <MDBox
                                        sx={{
                                            width: '16px',
                                            height: '100%',
                                            position: 'absolute',
                                            right: '-8px',
                                            top: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'col-resize',
                                            zIndex: 10,
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                borderRadius: '4px',
                                            }
                                        }}
                                    >
                                        <DragHandleIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
                                    </MDBox>
                                )
                            }}
                            handleStyles={{
                                right: {
                                    width: '16px',
                                    right: '-8px',
                                }
                            }}
                            style={{ marginRight: '16px' }}
                            onResizeStop={(e, direction, ref, d) => {
                                // 필요한 경우 크기 조절 후 추가 작업을 수행할 수 있습니다
                                console.log('Resize stopped');
                            }}
                        >
                            <Card sx={{ 
                                height: '100%',
                                position: 'sticky',
                                top: '1.5rem',
                                width: '100%'
                            }}>
                                <CardHeader 
                                    title={
                                        <MDBox display="flex" alignItems="center" justifyContent="space-between">
                                            <MDBox display="flex" alignItems="center">
                                                <CodeIcon sx={{ mr: 1 }} />
                                                <MDTypography variant="h5" fontWeight="medium">
                                                    {question.title}
                                                </MDTypography>
                                            </MDBox>
                                            {statusLoading ? (
                                                <CircularProgress size={20} />
                                            ) : questionSolved ? (
                                                <Chip
                                                    icon={<CheckCircleIcon />}
                                                    label="해결됨"
                                                    color="success"
                                                    variant="filled"
                                                    size="small"
                                                />
                                            ) : (
                                                <Chip
                                                    label="미해결"
                                                    color="default"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            )}
                                        </MDBox>
                                    }
                                />
                                <Divider />
                                <CardContent>
                                    <MDBox mb={2}>
                                        <MDBox 
                                            component="span" 
                                            sx={{ 
                                                px: 1, 
                                                py: 0.5, 
                                                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                mb: 2,
                                                display: 'inline-block'
                                            }}
                                        >
                                            {question.language}
                                        </MDBox>
                                    </MDBox>
                                    
                                    <MDBox 
                                        sx={{ 
                                            whiteSpace: 'pre-wrap',
                                            overflowY: 'auto',
                                            maxHeight: 'calc(100vh - 180px)',
                                            '& .markdown-body': {
                                                fontFamily: 'inherit',
                                                lineHeight: 1.6,
                                            },
                                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                                                marginTop: '1.5em',
                                                marginBottom: '0.5em',
                                                fontWeight: 600,
                                            },
                                            '& p': {
                                                marginBottom: '1em',
                                            },
                                            '& ul, & ol': {
                                                paddingLeft: '2em',
                                                marginBottom: '1em',
                                            },
                                            '& li': {
                                                marginBottom: '0.5em',
                                            },
                                            '& pre': {
                                                marginBottom: '1em',
                                                padding: 0,
                                            },
                                            '& code': {
                                                fontFamily: 'monospace',
                                                padding: '0.2em 0.4em',
                                                borderRadius: '3px',
                                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                                fontSize: '85%',
                                            },
                                            '& img': {
                                                maxWidth: '100%',
                                                height: 'auto',
                                            },
                                            '& table': {
                                                borderCollapse: 'collapse',
                                                width: '100%',
                                                marginBottom: '1em',
                                            },
                                            '& th, & td': {
                                                border: '1px solid #ddd',
                                                padding: '8px',
                                            },
                                            '& blockquote': {
                                                borderLeft: '4px solid #ddd',
                                                paddingLeft: '1em',
                                                marginLeft: 0,
                                                marginBottom: '1em',
                                                color: 'rgba(0, 0, 0, 0.6)',
                                            },
                                        }}
                                        className="markdown-body"
                                    >
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({node, inline, className, children, ...props}) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={vscDarkPlus}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {question.content || question.description}
                                        </ReactMarkdown>
                                    </MDBox>
                                </CardContent>
                            </Card>
                        </Resizable>
                        
                        {/* Coding Area - Right Side */}
                        <MDBox sx={{ 
                            flex: 1, 
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            height: 'calc(100vh - 200px)' // 고정 높이 설정
                        }}>
                            {/* 전체 MDBox를 두 부분으로 나누는 Resizable */}
                            <Resizable
                                defaultSize={{ width: '100%', height: '60%' }}
                                enable={{ bottom: true }}
                                handleComponent={{
                                    bottom: (
                                        <MDBox
                                            sx={{
                                                width: '100%',
                                                height: '16px',
                                                position: 'absolute',
                                                bottom: '-8px',
                                                left: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'row-resize',
                                                zIndex: 10,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                    borderRadius: '4px',
                                                }
                                            }}
                                        >
                                            <DragHandleIcon fontSize="small" />
                                        </MDBox>
                                    )
                                }}
                                style={{ 
                                    position: 'relative',
                                    marginBottom: '16px'
                                }}
                            >
                                {/* 코드 에디터 영역 */}
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardHeader 
                                        title={
                                            <MDBox display="flex" justifyContent="space-between" alignItems="center">
                                                <MDTypography variant="h5" fontWeight="medium">
                                                    코드 작성
                                                </MDTypography>
                                                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                                                    <InputLabel>언어</InputLabel>
                                                    <Select
                                                        value={language}
                                                        onChange={handleLanguageChange}
                                                        label="언어"
                                                    >
                                                        {languageOptions.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </MDBox>
                                        }
                                    />
                                    <Divider />
                                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, minHeight: 0 }}>
                                        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                                            <Editor
                                                height="100%"
                                                language={getMonacoLanguage(language)}
                                                value={code}
                                                onChange={handleEditorChange}
                                                onMount={handleEditorDidMount}
                                                theme="vs-dark"
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
                                                    scrollBeyondLastLine: false,
                                                    automaticLayout: true,
                                                    tabSize: 4,
                                                    wordWrap: 'on',
                                                    lineNumbers: 'on',
                                                    folding: true,
                                                    renderLineHighlight: 'all',
                                                    formatOnPaste: true,
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Resizable>
                            
                            {/* 실행 결과 영역 - 나머지 공간 차지 */}
                            <MDBox sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardHeader 
                                        title={
                                            <MDTypography variant="h5" fontWeight="medium">
                                                실행 결과
                                            </MDTypography>
                                        }
                                        action={
                                            <MDBox>
                                                {language === 'SQL' ? (
                                                    <MDButton
                                                        color="primary"
                                                        variant="contained"
                                                        startIcon={<PlayArrowIcon />}
                                                        onClick={handleSqlDebug}
                                                        disabled={!code || executing}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        {executing ? 'SQL 실행 중...' : 'SQL 실행'}
                                                    </MDButton>
                                                ) : (
                                                    <MDButton
                                                        color="info"
                                                        variant="contained"
                                                        startIcon={<PlayArrowIcon />}
                                                        onClick={handleExecute}
                                                        disabled={!code || executing || !language}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        {executing ? '실행 중...' : '실행'}
                                                    </MDButton>
                                                )}
                                                <MDButton
                                                    color="success"
                                                    variant="contained"
                                                    startIcon={<SendIcon />}
                                                    onClick={handleSubmit}
                                                    disabled={!code || submitting || !language}
                                                >
                                                    {submitting ? '제출 중...' : '제출'}
                                                </MDButton>
                                            </MDBox>
                                        }
                                    />
                                    <Divider />
                                    <CardContent sx={{ flex: 1, overflowY: 'auto', maxHeight: 'none', p: 2 }}>
                                        {executing ? (
                                            <MDBox display="flex" justifyContent="center" alignItems="center" py={3}>
                                                <CircularProgress />
                                            </MDBox>
                                        ) : executionResult ? (
                                            <MDBox>
                                                <Alert 
                                                    severity={executionResult.successful ? "success" : "error"} 
                                                    sx={{ mb: 2 }}
                                                >
                                                    {executionResult.successful ? "실행 성공" : "실행 실패"}
                                                </Alert>
                                                
                                                {executionResult.output && (
                                                    <MDBox 
                                                        sx={{ 
                                                            p: 0,
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                            maxHeight: '200px',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        <SyntaxHighlighter
                                                            style={vscDarkPlus}
                                                            language="plaintext"
                                                            customStyle={{
                                                                margin: 0,
                                                                maxHeight: '200px',
                                                            }}
                                                        >
                                                            {executionResult.output}
                                                        </SyntaxHighlighter>
                                                    </MDBox>
                                                )}
                                                
                                                {executionResult.error && (
                                                    <MDBox 
                                                        sx={{ 
                                                            p: 0,
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                            maxHeight: '200px',
                                                            fontSize: '14px',
                                                            mt: 2
                                                        }}
                                                    >
                                                        <SyntaxHighlighter
                                                            style={vscDarkPlus}
                                                            language="plaintext"
                                                            customStyle={{
                                                                margin: 0,
                                                                maxHeight: '200px',
                                                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                                            }}
                                                        >
                                                            {executionResult.error}
                                                        </SyntaxHighlighter>
                                                    </MDBox>
                                                )}
                                            </MDBox>
                                        ) : submitting ? (
                                            <MDBox display="flex" justifyContent="center" alignItems="center" py={3}>
                                                <CircularProgress />
                                            </MDBox>
                                        ) : submissionResult ? (
                                            <MDBox>
                                                {/* 정답/오답 판정 */}
                                                {submissionResult.output !== undefined && submissionResult.expectedOutput !== undefined && (
                                                    <Alert 
                                                        severity={submissionResult.output === submissionResult.expectedOutput ? "success" : "error"} 
                                                        sx={{ mb: 2 }}
                                                    >
                                                        {submissionResult.output === submissionResult.expectedOutput ? "정답입니다!" : "오답입니다."}
                                                    </Alert>
                                                )}
                                                
                                                {/* 점수 표시 */}
                                                {submissionResult.score !== undefined && (
                                                    <MDBox sx={{ mb: 2 }}>
                                                        <MDTypography variant="h6" fontWeight="medium">
                                                            점수: {submissionResult.score}/100
                                                        </MDTypography>
                                                    </MDBox>
                                                )}
                                                
                                                {/* 실행 시간 표시 */}
                                                {submissionResult.executionTime && (
                                                    <MDBox sx={{ mb: 2 }}>
                                                        <MDTypography variant="body2" color="text">
                                                            실행 시간: {submissionResult.executionTime}ms
                                                        </MDTypography>
                                                    </MDBox>
                                                )}
                                                
                                                {/* 사용자 출력 */}
                                                {submissionResult.output && (
                                                    <MDBox sx={{ mb: 2 }}>
                                                        <MDTypography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                                                            당신의 출력:
                                                        </MDTypography>
                                                        <MDBox 
                                                            sx={{ 
                                                                p: 0,
                                                                borderRadius: '4px',
                                                                overflow: 'hidden',
                                                                maxHeight: '200px',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language="plaintext"
                                                                customStyle={{
                                                                    margin: 0,
                                                                    maxHeight: '200px',
                                                                }}
                                                            >
                                                                {submissionResult.output}
                                                            </SyntaxHighlighter>
                                                        </MDBox>
                                                    </MDBox>
                                                )}
                                                
                                                {/* 기대 출력 */}
                                                {submissionResult.expectedOutput && (
                                                    <MDBox sx={{ mb: 2 }}>
                                                        <MDTypography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                                                            기대 출력:
                                                        </MDTypography>
                                                        <MDBox 
                                                            sx={{ 
                                                                p: 0,
                                                                borderRadius: '4px',
                                                                overflow: 'hidden',
                                                                maxHeight: '200px',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language="plaintext"
                                                                customStyle={{
                                                                    margin: 0,
                                                                    maxHeight: '200px',
                                                                }}
                                                            >
                                                                {submissionResult.expectedOutput}
                                                            </SyntaxHighlighter>
                                                        </MDBox>
                                                    </MDBox>
                                                )}
                                                
                                                {/* 에러 메시지 */}
                                                {submissionResult.error && (
                                                    <MDBox sx={{ mb: 2 }}>
                                                        <MDTypography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                                                            오류:
                                                        </MDTypography>
                                                        <MDBox 
                                                            sx={{ 
                                                                p: 0,
                                                                borderRadius: '4px',
                                                                overflow: 'hidden',
                                                                maxHeight: '200px',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language="plaintext"
                                                                customStyle={{
                                                                    margin: 0,
                                                                    maxHeight: '200px',
                                                                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                                                }}
                                                            >
                                                                {submissionResult.error}
                                                            </SyntaxHighlighter>
                                                        </MDBox>
                                                    </MDBox>
                                                )}
                                            </MDBox>
                                        ) : (
                                            <MDBox textAlign="center" py={4}>
                                                <MDTypography variant="body2" color="text">
                                                    코드를 실행하거나 제출하면 결과가 여기에 표시됩니다.
                                                </MDTypography>
                                            </MDBox>
                                        )}
                                    </CardContent>
                                </Card>
                            </MDBox>
                        </MDBox>
                    </MDBox>
                ) : (
                    <Card>
                        <CardContent>
                            <MDTypography variant="body2" color="error" textAlign="center" py={4}>
                                문제 정보를 찾을 수 없습니다.
                            </MDTypography>
                        </CardContent>
                    </Card>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default CodingPage; 