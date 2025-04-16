import { useState, useEffect } from "react";
import api from "../../api";
import BasicLayout from "../authentication/components/BasicLayout";
import MDBox from "../../components/MDBox";
import Grid from "@mui/material/Grid";
import Footer from "../../examples/Footer";
import backgroundImage from "../../assets/images/bg-profile.jpeg";
import Card from "@mui/material/Card";
import CourseItem from "../course/item";
import MDButton from "../../components/MDButton";
import MDSnackbar from "../../components/MDSnackbar";

// MUI Dialog 관련 컴포넌트 임포트
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import CourseManageItem from "./item";

function CourseManage() {
    const [courses, setCourses] = useState([]);
    const [successSB, setSuccessSB] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [courseForm, setCourseForm] = useState({
        name: "테스트 강의",
        description: "",
        maxUserSize: 10,
        isActive: true,
    });

    // Snackbar 관련 함수
    const openSuccessSB = (message) => {
        setSuccessMessage(message);
        setSuccessSB(true);
    };
    const closeSuccessSB = () => setSuccessSB(false);
    const renderSuccessSB = (
        <MDSnackbar
            color="success"
            icon="check"
            title="알림"
            content={successMessage}
            open={successSB}
            onClose={closeSuccessSB}
            close={closeSuccessSB}
            bgWhite
        />
    );

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = () => {
        // 강좌 관리 API 호출 (실제 API URL로 대체)
        api
            .get("/api/course/manage")
            .then((response) => {
                setCourses(response.data);
            })
            .catch((error) => {
                console.error("Error fetching courses:", error);
            });
    };

    // 입력값 변경 핸들러 (텍스트필드)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseForm({
            ...courseForm,
            [name]: value,
        });
    };

    // Switch (활성화 여부) 변경 핸들러
    const handleSwitchChange = (e) => {
        setCourseForm({
            ...courseForm,
            isActive: e.target.checked,
        });
    };

    // 입력 폼 제출 핸들러 (POST 요청)
    const handleFormSubmit = () => {
        api
            .post("/api/course", courseForm)
            .then((response) => {
                console.log("Course created:", response.data);
                // 강좌 리스트 갱신
                setCourses([...courses, response.data]);
                setDialogOpen(false);
                openSuccessSB("강좌가 성공적으로 생성되었습니다.");
            })
            .catch((error) => {
                console.error("Error creating course:", error);
            });
    };

    // 강좌 삭제 핸들러
    const handleCourseDelete = (courseId) => {
        // API 호출은 CourseItem 컴포넌트 내에서 처리됩니다.
        // 이 함수는 UI 업데이트만 담당합니다.
        setCourses(courses.filter(course => course.id !== courseId));
        openSuccessSB("강좌가 성공적으로 삭제되었습니다.");
    };

    // 강좌 업데이트 핸들러
    const handleCourseUpdate = (courseId, updatedCourse) => {
        // 업데이트된 강좌 정보로 UI 갱신
        setCourses(courses.map(course => 
            course.id === courseId ? {...course, ...updatedCourse} : course
        ));
        openSuccessSB("강좌가 성공적으로 수정되었습니다.");
    };

    return (
        <BasicLayout>
            <Grid item xs={11} sm={9} md={5} lg={4} xl={64}>
                <MDBox position="relative" mb={5}>
                    <MDBox
                        display="flex"
                        alignItems="center"
                        position="relative"
                        minHeight="18.75rem"
                        borderRadius="xl"
                        color="gray"
                        sx={{
                            backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
                                `${linearGradient(
                                    rgba(gradients.info.main, 0.6),
                                    rgba(gradients.info.state, 0.6)
                                )}, url(${backgroundImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "50%",
                            overflow: "hidden",
                        }}
                    />
                    <Card
                        sx={{
                            position: "relative",
                            mt: -8,
                            mx: 3,
                            py: 2,
                            px: 2,
                        }}
                    >
                        <Grid item xs={12} sm={6} lg={1} sx={{ mb: 2 }}>
                            <MDButton variant="gradient" color="primary" onClick={() => setDialogOpen(true)} fullWidth>
                                강좌 개설
                            </MDButton>
                            {renderSuccessSB}
                        </Grid>
                        {/* API에서 가져온 course 데이터를 map()을 이용해 렌더링 */}
                        {courses.map((course) => (
                            <CourseManageItem
                                key={course.id}
                                id={course.id}
                                name={course.name}
                                teacher={course.teacher || "Default Teacher"}
                                email={course.email || "default@example.com"}
                                onDelete={handleCourseDelete}
                                onUpdate={handleCourseUpdate}
                            />
                        ))}
                    </Card>
                </MDBox>
                <Footer />
            </Grid>

            {/* 강좌 개설 폼 팝업 */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>강좌 개설</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="강좌명"
                        type="text"
                        fullWidth
                        name="name"
                        value={courseForm.name}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        label="설명"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        name="description"
                        value={courseForm.description}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        label="최대 수강 인원"
                        type="number"
                        fullWidth
                        name="maxUserSize"
                        value={courseForm.maxUserSize}
                        onChange={handleInputChange}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={courseForm.isActive}
                                onChange={handleSwitchChange}
                                name="isActive"
                                color="primary"
                            />
                        }
                        label="활성화 여부"
                    />
                </DialogContent>
                <DialogActions>
                    <MDButton onClick={() => setDialogOpen(false)} color="secondary">
                        취소
                    </MDButton>
                    <MDButton onClick={handleFormSubmit} color="primary">
                        제출
                    </MDButton>
                </DialogActions>
            </Dialog>
        </BasicLayout>
    );
}

export default CourseManage;