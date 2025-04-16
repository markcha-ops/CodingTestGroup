# Docker 배포 설정 가이드

이 문서는 multiple-auth-api (Spring Boot)와 ui-react (React) 애플리케이션의 Docker 배포 설정에 대한 가이드입니다.

## 구성 요소

1. **multiple-auth-api**: Spring Boot 기반 백엔드 애플리케이션 (Docker-in-Docker 기능 포함)
2. **ui-react**: React 기반 프론트엔드 애플리케이션
3. **PostgreSQL**: 데이터베이스
4. **Nginx**: 리버스 프록시 및 정적 파일 서빙

## 시작하기

### 1. 전체 시스템 시작

```bash
docker-compose up -d
```

이 명령을 실행하면 다음 컨테이너들이 생성됩니다:
- multiple-auth-api: 8081 포트 (호스트) → 8080 포트 (컨테이너)
- ui-react: 3002 포트 (호스트)
- PostgreSQL: 5432 포트
- Nginx: 80 포트 (메인 프록시)

### 2. 전체 시스템 종료

```bash
docker-compose down
```

## Docker-in-Docker 기능 사용

multiple-auth-api 컨테이너는 Docker-in-Docker 기능을 지원합니다. 이를 통해 Spring Boot 애플리케이션에서 다른 Docker 컨테이너를 실행할 수 있습니다.

### Java에서 Docker 컨테이너 관리

이 프로젝트에는 DockerContainerService와 DockerController가 포함되어 있어 API를 통해 Docker 컨테이너를 생성, 중지, 삭제할 수 있습니다.

```
POST /api/docker/containers
GET /api/docker/containers
POST /api/docker/containers/{name}/stop
DELETE /api/docker/containers/{name}
```

### 직접 컨테이너에 접속하여 Docker 명령 실행

```bash
docker exec -it multiple-auth-api sh
```

그리고 다음과 같은 Docker 명령을 실행할 수 있습니다:

```bash
docker ps
docker run -d --name test-container nginx
```

또는 포함된 도우미 스크립트를 사용할 수 있습니다:

```bash
/app/docker-helper.sh create test-container nginx 8080:80 "ENV1=value1,ENV2=value2"
/app/docker-helper.sh list
/app/docker-helper.sh stop test-container
/app/docker-helper.sh remove test-container
```

## 문제 해결

### Docker 데몬이 실행되지 않을 경우

```bash
docker exec -it multiple-auth-api sh -c "ps aux | grep dockerd"
```

Docker 데몬이 보이지 않으면 다음을 실행합니다:

```bash
docker exec -it multiple-auth-api sh -c "dockerd > /dev/null 2>&1 &"
```

### Nginx가 시작되지 않을 경우

Nginx 로그를 확인합니다:

```bash
docker logs app_nginx-production
```

구성 파일을 확인합니다:

```bash
docker exec -it app_nginx-production sh -c "nginx -t"
```

## 배포 구성 사용자 정의

### 환경 변수 수정

docker-compose.yaml 파일에서 각 서비스의 환경 변수를 수정할 수 있습니다.

### 포트 매핑 변경

docker-compose.yaml 파일에서 포트 매핑을 변경할 수 있습니다:

```yaml
ports:
  - "새로운_호스트_포트:컨테이너_포트"
```

### Nginx 구성 수정

nginx/default-production.conf 파일을 수정하여 Nginx 설정을 변경할 수 있습니다. 