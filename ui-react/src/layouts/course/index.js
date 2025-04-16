import { useState, useEffect } from "react";
import api from "../../api";
import BasicLayout from "../authentication/components/BasicLayout";
import MDBox from "../../components/MDBox";
import Grid from "@mui/material/Grid";
import Footer from "../../examples/Footer";
import MDInput from "../../components/MDInput";
import backgroundImage from "../../assets/images/bg-profile.jpeg";
import Card from "@mui/material/Card";
import CourseItem from "./item";

function Basic() {
    const [courses, setCourses] = useState([]);
    const [tabsOrientation, setTabsOrientation] = useState("horizontal");
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        // baseurl 부분은 실제 API URL로 대체하세요.
        api
            .get("/api/course/all")
            .then((response) => {
                // 응답이 배열 형태인 경우
                setCourses(response.data);
            })
            .catch((error) => {
                console.error("Error fetching courses:", error);
            });
    }, []);

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
                        <MDBox pr={1}>
                            <MDInput label="Search here" />
                        </MDBox>
                        {/* API에서 가져온 course 데이터를 map()을 이용해 렌더링 */}
                        {courses.map((course) => (
                            <CourseItem
                                key={course.id}
                                id={course.id}
                                name={course.name}
                                // API 응답에 teacher, email 필드가 없다면 필요에 따라 기본값을 지정하거나 다른 필드를 사용하세요.
                                teacher={course.teacher || "Default Teacher"}
                                email={course.email || "default@example.com"}
                            />
                        ))}
                    </Card>
                </MDBox>
                <Footer />
            </Grid>
        </BasicLayout>
    );
}

export default Basic;