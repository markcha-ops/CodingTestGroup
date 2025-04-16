// TokenHandler.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
// js-cookie import
import Cookies from "js-cookie";
const TokenHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // URL 쿼리 파라미터에서 token 값을 추출합니다.
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    console.log(token);
    console.log(refreshToken);
    
    if (token) {
      // 토큰을 쿠키에 저장
      Cookies.set("accessToken", token, { expires: 7 }); // 7일 동안 유효하게 설정
      
      // refreshToken이 있으면 쿠키에 저장
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, { expires: 30 }); // 30일 동안 유효하게 설정
      }
      
      // 필요하다면 API 호출로 사용자 정보를 불러올 수 있습니다.

      // 토큰 처리 후 페이지 새로고침과 함께 리다이렉트
      window.location.href = "/lecture";
    } else {
      // token이 없으면 페이지 새로고침과 함께 리다이렉트
      window.location.href = "/lecture";
    }
  }, [searchParams, navigate]);

  return (
    <div>
      <p>토큰을 처리하는 중입니다...</p>
    </div>
  );
};

export default TokenHandler;