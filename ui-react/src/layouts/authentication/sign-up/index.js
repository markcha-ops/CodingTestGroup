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

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";
import api from "api";

function Cover() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === "agreeTerms" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      setError("You must agree to the Terms and Conditions.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    try {
      const userData = {
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        password: formData.password,
        authority: "USER",
        provider: "local"
      };
      
      await api.post("/api/user", userData);
      navigate("/authentication/sign-in");
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred during registration.");
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your details to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput 
                type="email" 
                label="Email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                variant="standard" 
                fullWidth 
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput 
                type="text" 
                label="First Name" 
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                variant="standard" 
                fullWidth 
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput 
                type="text" 
                label="Last Name" 
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                variant="standard" 
                fullWidth 
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput 
                type="password" 
                label="Password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                variant="standard" 
                fullWidth 
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput 
                type="password" 
                label="Confirm Password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                variant="standard" 
                fullWidth 
                required
                error={formData.confirmPassword !== "" && formData.password !== formData.confirmPassword}
                helperText={formData.confirmPassword !== "" && formData.password !== formData.confirmPassword ? "Passwords do not match" : ""}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox 
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;I agree the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            {error && (
              <MDBox mt={2}>
                <MDTypography variant="caption" color="error" fontWeight="light">
                  {error}
                </MDTypography>
              </MDBox>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth>
                Sign Up
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
