#!/bin/bash

# 스크립트 오류 발생 시 중단
set -e

# 환경 확인
echo "=== 배포 환경 확인 ==="
docker --version
docker-compose --version

# 이전 컨테이너 중지 및 제거
echo "=== 이전 컨테이너 중지 및 제거 ==="
docker-compose down || true

# Git pull로 최신 코드 가져오기
echo "=== 최신 코드 가져오기 ==="
git pull

# Docker 이미지 빌드
echo "=== Docker 이미지 빌드 ==="
docker-compose build

# Docker 컨테이너 실행
echo "=== Docker 컨테이너 실행 ==="
docker-compose up -d

# 컨테이너 상태 확인
echo "=== 컨테이너 상태 확인 ==="
docker-compose ps

# 로그 확인을 위한 함수
show_logs() {
  echo "=== $1 로그 확인 ==="
  docker-compose logs $1 | tail -n 30
}

# 각 서비스 로그 확인
sleep 5
show_logs multiple-auth-api
show_logs nginx2
show_logs ui-react

echo "=== 배포 완료 ==="
echo "API 서비스: http://localhost:8080"
echo "UI 서비스: http://localhost:4211"

# 헬스체크 (선택사항)
echo "=== 헬스체크 수행 중 ==="
if curl -s -f http://localhost:4211 > /dev/null; then
  echo "웹 서비스가 정상적으로 응답합니다."
else
  echo "웹 서비스 응답이 없습니다. 로그를 확인하세요."
  exit 1
fi 