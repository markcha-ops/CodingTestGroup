import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";
import { useEffect, useState } from "react";
import {
    useMaterialUIController,
    setMiniSidenav,
    setTransparentSidenav,
    setWhiteSidenav,
} from "context";
import api from "../../api";
import { useSelectedCourse } from "../../SelectedCourseContext";
import { useUserRole } from "../../UserRoleContext";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
    const [controller, dispatch] = useMaterialUIController();
    const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
    const location = useLocation();
    const collapseName = location.pathname.replace("/", "");
    const [courses, setCourses] = useState([]);

    // Context를 통해 전역 상태 관리
    const { selectedCourse, setSelectedCourse } = useSelectedCourse();
    const { isManager } = useUserRole(); // Get manager status

    let textColor = "white";
    if (transparentSidenav || (whiteSidenav && !darkMode)) {
        textColor = "dark";
    } else if (whiteSidenav && darkMode) {
        textColor = "inherit";
    }

    const closeSidenav = () => setMiniSidenav(dispatch, true);

    useEffect(() => {
        function handleMiniSidenav() {
            setMiniSidenav(dispatch, window.innerWidth < 1200);
            setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
            setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
        }

        // 강좌 목록을 가져오는 API 호출
        api
            .get("/api/course/self")
            .then((response) => {
                setCourses(response.data);
            })
            .catch((error) => {
                console.error("Error fetching courses:", error);
            });

        // 현재 선택된 강좌를 가져와 초기 <Select> 값을 설정
        api
            .get("/api/course/current")
            .then((response) => {
                // 응답 데이터가 강좌 객체라고 가정 (예: { id: "123", name: "강좌명", ... })
                if (response.data && response.data.id) {
                    setSelectedCourse(response.data.id);
                }
            })
            .catch((error) => {
                console.error("Error fetching current course:", error);
            });

        window.addEventListener("resize", handleMiniSidenav);
        handleMiniSidenav();
        return () => window.removeEventListener("resize", handleMiniSidenav);
    }, [dispatch, location, setSelectedCourse, transparentSidenav, whiteSidenav]);

    useEffect(() => {
        // Log user role status when component mounts or role changes
        console.log("🧑‍💼 Sidenav - Current user role status:", { isManager });
    }, [isManager]);

    // Helper function to determine if a route should be shown
    const shouldShowRoute = (route) => {
        // If route is already hidden, don't show it
        if (route.hide === true) {
            console.log(`Route ${route.name || route.title || route.key}: hidden by configuration`);
            return false;
        }
        
        // For admin routes, check manager status
        if (route.isAdminRoute) {
            const visible = !!isManager;
            console.log(`Admin route ${route.name || route.title || route.key}: visible=${visible}, isManager=${isManager}`);
            return visible;
        }
        
        // Non-admin routes are always shown
        return true;
    };

    // Log all routes to help debugging
    useEffect(() => {
        console.log("All routes:", routes.map(r => ({ 
            name: r.name || r.title || r.key,
            isAdminRoute: !!r.isAdminRoute,
            hidden: r.hide === true
        })));
    }, [routes]);

    const renderRoutes = routes
        .filter(route => shouldShowRoute(route))
        .map(({ type, name, icon, title, noCollapse, key, href, route, isAdminRoute }) => {
            console.log(`Rendering route: ${name || title || key}, type=${type}, isManager=${isManager}`);
            
            if (type === "collapse") {
                return href ? (
                    <Link href={href} key={key} target="_blank" rel="noreferrer" sx={{ textDecoration: "none" }}>
                        <SidenavCollapse name={name} icon={icon} active={key === collapseName} noCollapse={noCollapse} />
                    </Link>
                ) : (
                    <NavLink key={key} to={route}>
                        <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
                    </NavLink>
                );
            } else if (type === "title") {
                return (
                    <MDTypography
                        key={key}
                        color={textColor}
                        display="block"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="uppercase"
                        pl={3}
                        mt={2}
                        mb={1}
                        ml={1}
                    >
                        {title}
                    </MDTypography>
                );
            } else if (type === "divider") {
                return (
                    <Divider
                        key={key}
                        light={
                            (!darkMode && !whiteSidenav && !transparentSidenav) ||
                            (darkMode && !transparentSidenav && whiteSidenav)
                        }
                    />
                );
            }
            return null;
        });

    // 선택 이벤트 핸들러
    const handleCourseSelect = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        api
            .post("/api/course/select", { id: courseId })
            .then((response) => {
                // 필요시 응답 처리
                console.log("Course selected:", response.data);
            })
            .catch((error) => {
                console.error("Error selecting course:", error);
            });
    };

    return (
        <SidenavRoot
            {...rest}
            variant="permanent"
            ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
        >
            <MDBox pt={3} pb={1} px={4} textAlign="center">
                <MDBox
                    display={{ xs: "block", xl: "none" }}
                    position="absolute"
                    top={0}
                    right={0}
                    p={1.625}
                    onClick={closeSidenav}
                    sx={{ cursor: "pointer" }}
                >
                    <MDTypography variant="h6" color="secondary">
                        <Icon sx={{ fontWeight: "bold" }}>close</Icon>
                    </MDTypography>
                </MDBox>
                <MDBox component={NavLink} to="/" display="flex" alignItems="center">
                    {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
                    <MDBox width={!brandName && "100%"} sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}>
                        <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
                            {brandName}
                        </MDTypography>
                    </MDBox>
                </MDBox>
            </MDBox>
            <MDBox display="flex" alignItems="center" pl={2} mt={2} mb={1} ml={1}>
                <MDTypography
                    color={textColor}
                    display="inline"
                    variant="caption"
                    fontWeight="bold"
                    textTransform="uppercase"
                    mr={1}
                >
                    {"강좌"}
                </MDTypography>
                <Select
                    color={textColor}
                    value={selectedCourse}
                    onChange={handleCourseSelect}
                    displayEmpty={false}
                    fullWidth
                    MenuProps={{
                        sx: {
                            "& .MuiPaper-root": {
                                backgroundColor: "rgba(21, 21, 21, 0.95)",
                                "& .MuiMenuItem-root": { 
                                    color: "white",
                                    padding: "8px 16px" 
                                },
                                "& .MuiMenuItem-root.Mui-selected": { 
                                    color: "white !important", 
                                    backgroundColor: "rgba(255, 255, 255, 0.15)" 
                                }
                            }
                        }
                    }}
                    sx={{
                        height: "30px",
                        color: "white",
                        "& .MuiSelect-select": { 
                            color: "white", 
                            fontWeight: "500",
                            padding: "8px 14px" 
                        },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.7)" },
                        "& .MuiSvgIcon-root": { color: "white" },
                        "& .MuiSelect-icon": { color: "white" },
                        "& .MuiMenuItem-root": { color: "white" },
                        "& .Mui-selected": { color: "white !important" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                        "& .MuiSelect-select:focus": { backgroundColor: "transparent" },
                        mr: "35px",
                    }}
                    renderValue={(selected) => {
                        const selectedCourseName = courses.find(course => course.id === selected)?.name;
                        return selectedCourseName || "코스를 선택하세요";
                    }}
                >
                    {courses.map((course) => (
                        <MenuItem 
                            key={course.id} 
                            value={course.id}
                            sx={{ minHeight: "auto" }}
                        >
                            {course.name}
                        </MenuItem>
                    ))}
                </Select>
            </MDBox>
            <Divider
                light={
                    (!darkMode && !whiteSidenav && !transparentSidenav) ||
                    (darkMode && !transparentSidenav && whiteSidenav)
                }
            />

            <List>{renderRoutes}</List>
        </SidenavRoot>
    );
}

Sidenav.defaultProps = {
    color: "info",
    brand: "",
};

Sidenav.propTypes = {
    color: PropTypes.oneOf([
        "primary",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
        "dark",
    ]),
    brand: PropTypes.string,
    brandName: PropTypes.string.isRequired,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;