/**
 * DevTool Page - Provides a coding environment for general coding practice without submission
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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CodeIcon from "@mui/icons-material/Code";
import { Resizable } from 're-resizable';
import DragHandleIcon from '@mui/icons-material/DragHandle';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Markdown and Syntax Highlighting
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

function DevTool() {
    // State variables
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('PYTHON');
    const [inputData, setInputData] = useState('');
    const [executionResult, setExecutionResult] = useState(null);
    const [executing, setExecuting] = useState(false);
    
    // Language options
    const languageOptions = [
        // { value: 'JAVA', label: 'Java', template: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello, World!");\n    }\n}' },
        // { value: 'C', label: 'C', template: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    printf("Hello, World!\\n");\n    return 0;\n}' },
        { value: 'PYTHON', label: 'Python', template: '# Your code here\nprint("Hello, World!")' },
        // { value: 'CPP', label: 'C++', template: '#include <iostream>\n\nint main() {\n    // Your code here\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
        // { value: 'JAVASCRIPT', label: 'JavaScript', template: '// Your code here\nconsole.log("Hello, World!");' },
        // { value: 'SQL', label: 'SQL', template: '-- Your SQL query here\nSELECT "Hello, World!" AS greeting;' },
    ];
    
    // Set initial code based on default language
    useEffect(() => {
        const template = languageOptions.find(opt => opt.value === language)?.template || '';
        setCode(template);
    }, []);
    
    // 코드 편집기 ref
    const editorRef = useRef(null);

    // 에디터 초기화 핸들러
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
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
            'JAVA': 'java',
            'C': 'c',
            'CPP': 'cpp',
            'PYTHON': 'python',
            'JAVASCRIPT': 'javascript',
            'TYPESCRIPT': 'typescript',
            'SQL': 'sql'
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
                language: language,
                inputData: inputData || null
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
    
    // Handle SQL debugging specifically
    const handleSqlDebug = async () => {
        setExecuting(true);
        setExecutionResult(null);
        
        try {
            const response = await api.post('/api/submissions/debug', {
                code: code,
                language: 'SQL',
                inputData: inputData || null
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
    
    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="medium">
                        <CodeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        코딩 연습장
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                        다양한 프로그래밍 언어로 코드를 작성하고 실행해볼 수 있습니다.
                    </MDTypography>
                </MDBox>
                
                <MDBox sx={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 200px)', gap: 2 }}>
                    {/* 코드 에디터 영역 - 왼쪽 열 */}
                    <Resizable
                        defaultSize={{ width: '50%', height: '100%' }}
                        enable={{ right: true }}
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
                        style={{ 
                            position: 'relative',
                            marginRight: '16px'
                        }}
                    >
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
                                
                                {/* 입력 데이터 섹션 */}
                                <MDBox sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
                                    <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
                                        입력 데이터 (Python input() 함수 등)
                                    </MDTypography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        variant="outlined"
                                        placeholder="프로그램에 입력할 데이터를 한 줄씩 입력하세요&#10;예: 5&#10;3&#10;Hello World"
                                        value={inputData}
                                        onChange={(e) => setInputData(e.target.value)}
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
                                                fontSize: '13px',
                                            }
                                        }}
                                    />
                                </MDBox>
                            </CardContent>
                        </Card>
                    </Resizable>
                    
                    {/* 실행 결과 영역 - 오른쪽 열 */}
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
                                            >
                                                {executing ? '실행 중...' : '실행'}
                                            </MDButton>
                                        )}
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
                                ) : (
                                    <MDBox textAlign="center" py={4}>
                                        <MDTypography variant="body2" color="text">
                                            코드를 실행하면 결과가 여기에 표시됩니다.
                                        </MDTypography>
                                    </MDBox>
                                )}
                            </CardContent>
                        </Card>
                    </MDBox>
                </MDBox>
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default DevTool; 