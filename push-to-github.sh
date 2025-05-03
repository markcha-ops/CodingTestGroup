#!/bin/bash

# 스크립트 오류 발생 시 중단
set -e

# GitHub 저장소 URL
GITHUB_REPO="https://github.com/markcha-ops/codeing-test-group.git"

# Git 초기화가 필요한지 확인
if [ ! -d ".git" ]; then
  echo "=== Git 저장소 초기화 ==="
  git init
  git remote add origin $GITHUB_REPO
else
  echo "=== Git 원격 저장소 확인 ==="
  CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
  
  if [ "$CURRENT_REMOTE" != "$GITHUB_REPO" ]; then
    echo "원격 저장소 URL 업데이트"
    git remote remove origin
    git remote add origin $GITHUB_REPO
  fi
fi

# 변경사항 확인
echo "=== 변경사항 확인 ==="
git status

# 모든 파일 스테이징
echo "=== 파일 스테이징 ==="
git add .

# 커밋 메시지 입력 또는 기본 메시지 사용
echo "커밋 메시지를 입력하세요 (입력하지 않으면 기본 메시지 사용):"
read COMMIT_MESSAGE

if [ -z "$COMMIT_MESSAGE" ]; then
  COMMIT_MESSAGE="Docker Compose 설정 업데이트 $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 변경사항 커밋
echo "=== 변경사항 커밋 ==="
git commit -m "$COMMIT_MESSAGE"

# GitHub 저장소에 푸시
echo "=== GitHub 저장소에 푸시 ==="
git push -u origin master

echo "=== 완료 ==="
echo "코드가 $GITHUB_REPO 저장소에 성공적으로 푸시되었습니다." 