// api.js
import React, { useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

let accessToken = Cookies.get("accessToken");

console.log(accessToken);

// (선택 사항) 토큰의 만료 여부를 확인하는 함수
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    // exp는 초 단위이므로 1000을 곱해 ms로 변환
    return exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};
export const ApiProvider = ({ children }) => {
    const navigate = useNavigate();
    console.log(123)
    useEffect(() => {
        const accessToken = Cookies.get("accessToken");
        if (!accessToken || isTokenExpired(accessToken)) {
            navigate("/login");
        }
    }, [navigate]);

    // 여기에 api 인터셉터 등 추가 설정

    return <>{children}</>;
};


const api = axios.create({
//   baseURL: 'https://api.example.com', // 백엔드 API URL
  withCredentials: true, // HttpOnly 쿠키(Refresh Token)를 자동 전송
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 현재 메모리의 accessToken이 있으면 헤더에 추가
api.interceptors.request.use(
  (config) => {
      console.log('tokne : ', JSON.stringify(config));
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터가 제거됨 - 401 에러 발생 시 토큰 갱신 시도 없음

export default api;