/**
 * Course Students Management - For managing students in a course
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import { jwtDecode } from "jwt-decode";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import api from '../../api';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';

function CourseStudents() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get courseId from JWT token
    const getTokenCourseId = () => {
        try {
            const token = localStorage.getItem('accessToken'); // Assuming the token is stored in localStorage
            if (token) {
                const decodedToken = jwtDecode(token);
                return decodedToken.courseId; // Assuming courseId is in the token payload
            }
            return null;
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    };
    
    // Get courseId from token or fallback to location state/URL parameters
    const courseId = getTokenCourseId() || location.state?.courseId || new URLSearchParams(location.search).get('courseId');
    const courseName = location.state?.courseName || '';
    
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (courseId) {
            fetchStudents();
        } else {
            setError('코스 ID를 찾을 수 없습니다.');
        }
    }, [courseId]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/course/students`);
            setStudents(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch course students:', err);
            setError('학생 정보를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveStudent = async (relationId) => {
        try {
            await api.post(`/api/course/students/${relationId}/approve`);
            // Update student status locally
            setStudents(students.map(student => 
                student.relationId === relationId 
                    ? { ...student, status: 'APPROVED' } 
                    : student
            ));
            setSuccessMessage('학생이 성공적으로 승인되었습니다.');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            console.error('Failed to approve student:', err);
            setError('학생 승인에 실패했습니다.');
            setTimeout(() => {
                setError('');
            }, 3000);
        }
    };

    const handleRemoveStudent = async (relationId) => {
        try {
            await api.delete(`/api/course/students/${relationId}`);
            // Remove student from local state
            setStudents(students.filter(student => student.relationId !== relationId));
            setSuccessMessage('학생이 성공적으로 제거되었습니다.');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            console.error('Failed to remove student:', err);
            setError('학생 제거에 실패했습니다.');
            setTimeout(() => {
                setError('');
            }, 3000);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        try {
            // Convert timestamp to date
            const date = new Date(parseInt(timestamp, 10));
            return format(date, 'yyyy-MM-dd HH:mm');
        } catch (error) {
            return '-';
        }
    };

    const formatLastLoginTime = (lastLoginTime) => {
        if (!lastLoginTime) return '-';
        try {
            // lastLoginTime is already a LocalDateTime string from backend
            const date = new Date(lastLoginTime);
            return format(date, 'yyyy-MM-dd HH:mm');
        } catch (error) {
            return '-';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'WAITING':
                return <MDBadge badgeContent="대기중" color="warning" variant="gradient" size="sm" />;
            case 'APPROVED':
                return <MDBadge badgeContent="승인됨" color="success" variant="gradient" size="sm" />;
            case 'REJECTED':
                return <MDBadge badgeContent="거부됨" color="error" variant="gradient" size="sm" />;
            default:
                return <MDBadge badgeContent="알 수 없음" color="dark" variant="gradient" size="sm" />;
        }
    };

    const getStudentName = (student) => {
        if (student.firstname && student.lastname) {
            return `${student.firstname} ${student.lastname}`;
        }
        return student.email.split('@')[0] || '이름 없음';
    };

    const handleViewStudentProblems = (student) => {
        navigate('/course-students/student-problems', { 
            state: { 
                student: student 
            } 
        });
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={2} mb={3}>
                <MDBox mb={2} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h4" fontWeight="medium">
                        코스 학생 관리 {courseName && `- ${courseName}`}
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
                            <MDTypography variant="h5" fontWeight="medium">
                                학생 목록
                            </MDTypography>
                        } 
                    />
                    <CardContent>
                        {loading ? (
                            <MDBox display="flex" justifyContent="center" p={3}>
                                <CircularProgress />
                            </MDBox>
                        ) : students.length === 0 ? (
                            <MDTypography variant="body1" color="text" textAlign="center" p={3}>
                                등록된 학생이 없습니다.
                            </MDTypography>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="students table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>이메일</TableCell>
                                            <TableCell>이름</TableCell>
                                            <TableCell>상태</TableCell>
                                            <TableCell>등록일</TableCell>
                                            <TableCell>수정일</TableCell>
                                            <TableCell>마지막 로그인</TableCell>
                                            <TableCell align="right">작업</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((student) => (
                                            <TableRow
                                                key={student.relationId}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell>{student.email}</TableCell>
                                                <TableCell component="th" scope="row">
                                                    <MDBox display="flex" alignItems="center">
                                                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                                                            {student.email ? student.email.charAt(0).toUpperCase() : '?'}
                                                        </Avatar>
                                                        {getStudentName(student)}
                                                    </MDBox>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(student.status)}</TableCell>
                                                <TableCell>{formatDate(student.createdAt)}</TableCell>
                                                <TableCell>{formatDate(student.updatedAt)}</TableCell>
                                                <TableCell>{formatLastLoginTime(student.lastLoginTime)}</TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Tooltip title="문제 풀이 현황">
                                                            <IconButton 
                                                                color="primary" 
                                                                onClick={() => handleViewStudentProblems(student)}
                                                            >
                                                                <AssignmentIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {student.status === 'WAITING' && (
                                                            <Tooltip title="승인">
                                                                <IconButton 
                                                                    color="success" 
                                                                    onClick={() => handleApproveStudent(student.relationId)}
                                                                >
                                                                    <CheckCircleIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip title="나가기">
                                                            <IconButton 
                                                                color="error" 
                                                                onClick={() => handleRemoveStudent(student.relationId)}
                                                            >
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
                
                <MDBox mt={3} display="flex" justifyContent="flex-end">
                    <MDButton 
                        variant="contained" 
                        color="info" 
                        onClick={() => navigate('/course-manage')}
                    >
                        코스 관리로 돌아가기
                    </MDButton>
                </MDBox>
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default CourseStudents; 