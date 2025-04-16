import PropTypes from "prop-types";
import Icon from "@mui/material/Icon";
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import MDButton from "../../../components/MDButton";
import { useMaterialUIController } from "../../../context";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import MDSnackbar from "../../../components/MDSnackbar";
import api from "../../../api";

function CourseItem({ name, teacher, email, id, noGutter }) {
    const [controller] = useMaterialUIController();
    const { darkMode } = controller;
    const [successSB, setSuccessSB] = useState(false);
    const [errorSB, setErrorSB] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const openSuccessSB = () => setSuccessSB(true);
    const closeSuccessSB = () => setSuccessSB(false);
    const openErrorSB = () => setErrorSB(true);
    const closeErrorSB = () => setErrorSB(false);

    const handleCourseInvite = () => {
        setIsLoading(true);
        api.post(`/api/course/invite/${id}`)
            .then((response) => {
                setIsLoading(false);
                openSuccessSB();
            })
            .catch((error) => {
                setIsLoading(false);
                console.error("Error inviting to course:", error);
                openErrorSB();
            });
    };

    const renderSuccessSB = (
        <MDSnackbar
            color="success"
            icon="check"
            title="신청 완료"
            content="참여 신청이 완료되었습니다."
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
            title="신청 실패"
            content="참여 신청 중 오류가 발생했습니다."
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
            // 다크모드가 아닐 때는 식별하기 쉬운 파스텔 블루 배경을 적용합니다.
            bgColor={darkMode ? "transparent" : "back"}
            borderRadius="lg"
            p={3}
            mt={2}
            mb={noGutter ? 0 : 1}
            // 경계와 그림자 효과로 요소 구분을 명확하게 합니다.
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
                    <Grid item xs={12} sm={6} lg={1}>
                        <MDButton 
                            variant="gradient" 
                            color="success" 
                            onClick={handleCourseInvite} 
                            disabled={isLoading}
                            fullWidth
                        >
                            {isLoading ? "처리 중..." : "참여 신청"}
                        </MDButton>
                        {renderSuccessSB}
                        {renderErrorSB}
                    </Grid>
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
        </MDBox>
    );
}

CourseItem.defaultProps = {
    noGutter: false,
};

CourseItem.propTypes = {
    name: PropTypes.string.isRequired,
    teacher: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    noGutter: PropTypes.bool,
};

export default CourseItem;