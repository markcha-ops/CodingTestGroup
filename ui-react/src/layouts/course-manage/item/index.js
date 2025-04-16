import PropTypes from "prop-types";
import Icon from "@mui/material/Icon";
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import MDButton from "../../../components/MDButton";
import { useMaterialUIController } from "../../../context";
import Grid from "@mui/material/Grid";
import { useState, useEffect } from "react";
import MDSnackbar from "../../../components/MDSnackbar";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import api from "../../../api";

function CourseItem({ name, teacher, email, id, noGutter, onDelete, onUpdate }) {
    const [controller] = useMaterialUIController();
    const { darkMode } = controller;
    const [successSB, setSuccessSB] = useState(false);
    const [errorSB, setErrorSB] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("참여 신청이 완료되었습니다.");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [courseForm, setCourseForm] = useState({
        name: name,
        description: "",
        maxUserSize: 10,
        isActive: true
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize form data with passed props
        setCourseForm(prevState => ({
            ...prevState,
            name: name
        }));
        
        // Fetch full course details including description, maxUserSize, etc.
        api.get(`/api/course/${id}`)
            .then(response => {
                const courseData = response.data;
                setCourseForm({
                    name: courseData.name || name,
                    description: courseData.description || "",
                    maxUserSize: courseData.maxUserSize || 10,
                    isActive: courseData.isActive !== undefined ? courseData.isActive : true
                });
            })
            .catch(error => {
                console.error("Error fetching course details:", error);
            });
    }, [id, name]);

    const openSuccessSB = (message = "참여 신청이 완료되었습니다.") => {
        setSuccessMessage(message);
        setSuccessSB(true);
    };
    const closeSuccessSB = () => setSuccessSB(false);
    
    const openErrorSB = (message) => {
        setErrorMessage(message);
        setErrorSB(true);
    };
    const closeErrorSB = () => setErrorSB(false);

    const handleStudentsClick = () => {
        navigate('/course-students', { 
            state: { 
                courseId: id,
                courseName: name
            } 
        });
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseForm({
            ...courseForm,
            [name]: value,
        });
    };

    const handleSwitchChange = (e) => {
        setCourseForm({
            ...courseForm,
            isActive: e.target.checked,
        });
    };
    
    const handleCourseInvite = () => {
        setIsLoading(true);
        api.post(`/api/course/invite/${id}`)
            .then((response) => {
                setIsLoading(false);
                openSuccessSB("참여 신청이 완료되었습니다.");
            })
            .catch((error) => {
                setIsLoading(false);
                console.error("Error inviting to course:", error);
                openErrorSB("참여 신청 중 오류가 발생했습니다.");
            });
    };
    
    const handleDeleteCourse = () => {
        setIsLoading(true);
        api.delete(`/api/course/${id}`)
            .then((response) => {
                setIsLoading(false);
                openSuccessSB("강좌가 성공적으로 삭제되었습니다.");
                if (onDelete) {
                    onDelete(id);
                }
                setDeleteDialogOpen(false);
            })
            .catch((error) => {
                setIsLoading(false);
                console.error("Error deleting course:", error);
                openErrorSB("강좌 삭제 중 오류가 발생했습니다.");
                setDeleteDialogOpen(false);
            });
    };
    
    const handleUpdateCourse = () => {
        setIsLoading(true);
        api.put(`/api/course/${id}`, courseForm)
            .then((response) => {
                setIsLoading(false);
                openSuccessSB("강좌가 성공적으로 수정되었습니다.");
                if (onUpdate) {
                    onUpdate(id, response.data);
                }
                setEditDialogOpen(false);
            })
            .catch((error) => {
                setIsLoading(false);
                console.error("Error updating course:", error);
                openErrorSB("강좌 수정 중 오류가 발생했습니다.");
            });
    };

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
    
    const renderErrorSB = (
        <MDSnackbar
            color="error"
            icon="warning"
            title="오류"
            content={errorMessage}
            open={errorSB}
            onClose={closeErrorSB}
            close={closeErrorSB}
            bgWhite
        />
    );

    return (
        <MDBox
            component="li"
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            bgColor={darkMode ? "transparent" : "back"}
            borderRadius="lg"
            p={3}
            mt={2}
            mb={noGutter ? 0 : 1}
            border="1px solid"
            borderColor={darkMode ? "grey.700" : "#90caf9"}
            boxShadow={darkMode ? "none" : "0px 2px 5px rgba(0, 0, 0, 0.1)"}
        >
            <MDBox width="100%" display="flex" flexDirection="column">
                <MDBox
                    display="flex"
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    flexDirection={{ xs: "column", sm: "row" }}
                    mb={2}
                >
                    <MDTypography variant="button" fontWeight="medium" textTransform="capitalize">
                        {name}
                    </MDTypography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <MDButton 
                            variant="outlined" 
                            color="info" 
                            onClick={handleStudentsClick}
                            startIcon={<PeopleIcon />}
                            size="small"
                        >
                            학생 관리
                        </MDButton>
                        <MDButton 
                            variant="outlined" 
                            color="warning" 
                            onClick={() => setEditDialogOpen(true)}
                            startIcon={<EditIcon />}
                            size="small"
                        >
                            수정
                        </MDButton>
                        <MDButton 
                            variant="outlined" 
                            color="error" 
                            onClick={() => setDeleteDialogOpen(true)}
                            startIcon={<DeleteIcon />}
                            size="small"
                        >
                            삭제
                        </MDButton>
                        <MDButton 
                            variant="gradient" 
                            color="success" 
                            onClick={handleCourseInvite}
                            disabled={isLoading}
                            size="small"
                        >
                            {isLoading ? "처리 중..." : "참여 신청"}
                        </MDButton>
                    </Stack>
                    {renderSuccessSB}
                    {renderErrorSB}
                </MDBox>
                <MDBox mb={1} lineHeight={0}>
                    <MDTypography variant="caption" color="text">
                        강사:&nbsp;&nbsp;&nbsp;
                        <MDTypography variant="caption" fontWeight="medium" textTransform="capitalize">
                            {teacher}
                        </MDTypography>
                    </MDTypography>
                </MDBox>
                <MDBox mb={1} lineHeight={0}>
                    <MDTypography variant="caption" color="text">
                        Email Address:&nbsp;&nbsp;&nbsp;
                        <MDTypography variant="caption" fontWeight="medium">
                            {email}
                        </MDTypography>
                    </MDTypography>
                </MDBox>
            </MDBox>
            
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"강좌 삭제 확인"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        '{name}' 강좌를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <MDButton onClick={() => setDeleteDialogOpen(false)} color="primary">
                        취소
                    </MDButton>
                    <MDButton onClick={handleDeleteCourse} color="error" autoFocus>
                        삭제
                    </MDButton>
                </DialogActions>
            </Dialog>
            
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>강좌 수정</DialogTitle>
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
                    <MDButton onClick={() => setEditDialogOpen(false)} color="secondary">
                        취소
                    </MDButton>
                    <MDButton onClick={handleUpdateCourse} color="primary">
                        저장
                    </MDButton>
                </DialogActions>
            </Dialog>
        </MDBox>
    );
}

CourseItem.defaultProps = {
    noGutter: false,
    onDelete: null,
    onUpdate: null
};

CourseItem.propTypes = {
    name: PropTypes.string.isRequired,
    teacher: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    noGutter: PropTypes.bool,
    onDelete: PropTypes.func,
    onUpdate: PropTypes.func
};

export default CourseItem;