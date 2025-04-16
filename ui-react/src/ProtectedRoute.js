import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const { exp } = jwtDecode(token);
        return exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
};

const ProtectedRoute = ({ children }) => {
    const accessToken = localStorage.getItem('accessToken');
    console.log(123)
    if (!accessToken || isTokenExpired(accessToken)) {
        return <Navigate to="/login" />;
    }
    return children;
};

export default ProtectedRoute;