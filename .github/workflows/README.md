# GitHub Actions CI/CD 설정 안내

이 프로젝트는 GitHub Actions를 사용하여 자동화된 CI/CD 파이프라인을 제공합니다.

## 사용 가능한 워크플로우

1. **Docker Compose CI/CD (`docker-compose-deploy.yml`)**
   - GitHub 호스팅 러너에서 직접 Docker Compose를 사용하여 빌드 및 배포
   - main 브랜치에 푸시할 때 자동으로 실행됨

2. **원격 서버 배포 (`remote-deploy.yml`)**
   - SSH를 통해 원격 서버에 배포
   - main 브랜치에 푸시할 때 자동으로 실행됨
   - GitHub에서 수동으로 트리거할 수도 있음

## 원격 서버 배포 설정 방법

원격 서버 배포를 위해서는 다음과 같은 GitHub Secrets을 설정해야 합니다:

1. **GitHub 저장소에서 Secrets 설정하기**
   - GitHub 저장소 > Settings > Secrets and variables > Actions > New repository secret

2. **필요한 Secrets 목록**
   - `SSH_PRIVATE_KEY`: 원격 서버 접속을 위한 SSH 개인키
   - `SSH_HOST`: 원격 서버 호스트 주소 (예: example.com 또는 IP 주소)
   - `SSH_USER`: 원격 서버 접속 사용자 이름 (예: ubuntu, root 등)
   - `DEPLOY_PATH`: 원격 서버에서 프로젝트를 배포할 경로 (예: /home/ubuntu/my-project)

3. **SSH 키 생성 및 등록**
   ```bash
   # SSH 키 생성
   ssh-keygen -t rsa -b 4096 -C "github-actions"
   
   # 공개키를 원격 서버의 authorized_keys에 추가
   cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
   
   # 개인키(id_rsa)의 내용을 GitHub Secrets의 SSH_PRIVATE_KEY로 설정
   ```

## 워크플로우 수동 실행

원격 서버 배포 워크플로우는 필요에 따라 수동으로 실행할 수 있습니다:

1. GitHub 저장소 > Actions 탭으로 이동
2. 왼쪽 메뉴에서 "Remote Server Deployment" 선택
3. "Run workflow" 버튼 클릭
4. 필요한 브랜치 선택 후 "Run workflow" 클릭

## 문제 해결

- 워크플로우 실행 중 오류가 발생하면 GitHub Actions 로그에서 자세한 정보를 확인할 수 있습니다.
- 원격 서버 배포 시 SSH 연결 문제가 발생하면 SSH 키와 호스트 설정을 확인하세요.
- Docker 관련 오류는 원격 서버에서 Docker가 올바르게 설치되어 있는지 확인하세요. 