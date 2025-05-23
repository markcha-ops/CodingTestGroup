import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import { jwtDecode } from 'jwt-decode';
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import { SelectedCourseProvider } from "./SelectedCourseContext";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const location = useLocation();
  const navigate = useNavigate();

  // Function to get cookie value by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Check token format and fields
  useEffect(() => {
    const token = getCookie('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("App.js - JWT Check:", {
          courseId: decoded.courseId,
          relationType: decoded.relationType
        });
      } catch (error) {
        console.error('App.js - JWT 디코딩 오류:', error);
      }
    } else {
      console.log("App.js - No token found in cookies");
    }
  }, []);

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const { exp } = jwtDecode(token);
      return exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // JWT 토큰에서 courseId 확인 후 null이면 강좌 페이지로 리다이렉트
  useEffect(() => {
    const token = getCookie('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.courseId === null) {
          navigate('/course');
        }
      } catch (error) {
        console.error('JWT 디코딩 오류:', error);
      }
    }
  }, [navigate, pathname]);

  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
      allRoutes.map((route) => {
        if (route.collapse) {
          return getRoutes(route.collapse);
        }
        if (route.route) {
          return <Route exact path={route.route} element={route.component} key={route.key} />;
        }
        return null;
      });

  const configsButton = (
      <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="3.25rem"
          height="3.25rem"
          bgColor="white"
          shadow="sm"
          borderRadius="50%"
          position="fixed"
          right="2rem"
          bottom="2rem"
          zIndex={99}
          color="dark"
          sx={{ cursor: "pointer" }}
          onClick={handleConfiguratorOpen}
      >
        <Icon fontSize="small" color="inherit">
          settings
        </Icon>
      </MDBox>
  );

  return (
      // SelectedCourseProvider로 전체 앱을 감싸서 Sidenav와 Routes 모두에서 context를 사용할 수 있게 함.
      <SelectedCourseProvider>
        {direction === "rtl" ? (
            <CacheProvider value={rtlCache}>
              <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
                <CssBaseline />
                {layout === "dashboard" && (
                    <>
                      <Sidenav
                          color={sidenavColor}
                          brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                          brandName="Material Dashboard 2"
                          routes={routes}
                          onMouseEnter={handleOnMouseEnter}
                          onMouseLeave={handleOnMouseLeave}
                      />
                      <Configurator />
                      {configsButton}
                    </>
                )}
                {layout === "vr" && <Configurator />}
                <Routes>
                  {getRoutes(routes)}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </ThemeProvider>
            </CacheProvider>
        ) : (
            <ThemeProvider theme={darkMode ? themeDark : theme}>
              <CssBaseline />
              {layout === "dashboard" && (
                  <>
                    <Sidenav
                        color={sidenavColor}
                        brandName="Study With Me"
                        routes={routes}
                        onMouseEnter={handleOnMouseEnter}
                        onMouseLeave={handleOnMouseLeave}
                    />
                    <Configurator />
                    {configsButton}
                  </>
              )}
              {layout === "vr" && <Configurator />}
              <Routes>
                {getRoutes(routes)}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </ThemeProvider>
        )}
      </SelectedCourseProvider>
  );
}