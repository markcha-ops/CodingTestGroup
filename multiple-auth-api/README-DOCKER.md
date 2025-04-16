# Docker로 multiple-auth-api 실행하기

이 프로젝트는 Docker와 Docker Compose를 사용하여 실행할 수 있습니다.

## 사전 요구사항

- Docker와 Docker Compose가 설치되어 있어야 합니다.

## 실행 방법

1. 환경 변수 설정하기
   
   `.env` 파일에서 필요한 환경 변수를 설정합니다. 기본값이 제공되지만, 필요에 따라 변경할 수 있습니다.
   
   ```
   # OAuth2 설정
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

2. Docker Compose로 실행하기
   
   ```bash
   docker-compose up -d
   ```

3. 로그 확인하기
   
   ```bash
   docker-compose logs -f multiple-auth-api
   ```

4. 애플리케이션 접속하기
   
   브라우저에서 `http://localhost:8080` 에 접속합니다.

## 환경 변수

Docker Compose 파일에서 사용되는 환경 변수:

- `DATABASE_HOST`: 데이터베이스 호스트 주소 (기본값: postgres)
- `DATABASE_NAME`: 데이터베이스 이름 (기본값: multiple_auth_db)
- `DATABASE_USER`: 데이터베이스 사용자 (기본값: postgres)
- `DATABASE_PASSWORD`: 데이터베이스 비밀번호 (기본값: postgres)
- `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿
- `GITHUB_CLIENT_ID`: GitHub OAuth 클라이언트 ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth 클라이언트 시크릿
- `AUTH_TOKEN_SECRET`: JWT 토큰 시크릿 키
- `baseUrl`: 애플리케이션 기본 URL

## 컨테이너 정보

- `multiple-auth-api`: Spring Boot 애플리케이션 (포트: 8080)
- `postgres`: PostgreSQL 데이터베이스 (포트: 5432) 