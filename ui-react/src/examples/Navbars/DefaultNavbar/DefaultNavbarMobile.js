/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

// @mui material components
import Menu from "@mui/material/Menu";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DefaultNavbarLink from "examples/Navbars/DefaultNavbar/DefaultNavbarLink";

// JWT decoding
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DefaultNavbarMobile({ open, close }) {
  const { width } = open && open.getBoundingClientRect();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and if admin from JWT token
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      setIsLoggedIn(true);
      try {
        const decodedToken = jwtDecode(accessToken);
        setIsAdmin(decodedToken.rule === "ADMIN" || decodedToken.rule === "SYSTEM_ADMIN");
      } catch (error) {
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    // Remove tokens from cookies
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    
    // Remove from localStorage if stored there
    localStorage.removeItem("token");
    
    // Clear Authorization header
    if (axios.defaults.headers.common["Authorization"]) {
      delete axios.defaults.headers.common["Authorization"];
    }
    
    // Update state
    setIsLoggedIn(false);
    setIsAdmin(false);
    
    // Close menu and redirect to home page
    close();
    navigate("/");
  };

  const handleLectureMove = async () => {
    try {
      // Get refreshToken from cookies
      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) {
        console.error("Refresh token not found");
        return;
      }

      // Send request to refresh token
      const response = await axios.post("/api/token/refresh", {
        refreshToken,
      });

      // Save new access token to cookie
      const { accessToken } = response.data;
      Cookies.set("accessToken", accessToken);

      // Navigate to lecture page
      navigate("/lecture");
      close(); // Close the mobile menu
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  return (
    <Menu
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      anchorEl={open}
      open={Boolean(open)}
      onClose={close}
      MenuListProps={{ style: { width: `calc(${width}px - 4rem)` } }}
    >
      <MDBox px={0.5}>
        <DefaultNavbarLink icon="dashboard" name="강좌" route="/course" />
        <DefaultNavbarLink icon="school" name="강의 이동" onClick={handleLectureMove} />
        {isAdmin && (
          <DefaultNavbarLink icon="manage" name="강좌 관리" route="/course-manage" />
        )}
        <DefaultNavbarLink icon="person" name="profile" route="/profile" />
        {isLoggedIn ? (
          <DefaultNavbarLink icon="logout" name="sign out" onClick={handleLogout} />
        ) : (
          <DefaultNavbarLink icon="key" name="sign in" route="/authentication/sign-in" />
        )}
      </MDBox>
    </Menu>
  );
}

// Typechecking props for the DefaultNavbarMenu
DefaultNavbarMobile.propTypes = {
  open: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired,
  close: PropTypes.oneOfType([PropTypes.func, PropTypes.bool, PropTypes.object]).isRequired,
};

export default DefaultNavbarMobile;
