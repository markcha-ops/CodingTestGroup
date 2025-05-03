pipeline {
    agent any
    
    environment {
        // Docker Hub 또는 사설 레지스트리 정보를 환경변수로 설정 (필요시 사용)
        DOCKER_REGISTRY = credentials('docker-registry-credentials')
    }
    
    stages {
        stage('Checkout') {
            steps {
                // 소스코드 체크아웃
                checkout scm
            }
        }
        
        stage('Build Images') {
            steps {
                // Docker Compose를 사용하여 이미지 빌드
                sh 'docker-compose build'
            }
        }
        
        stage('Stop & Remove Old Containers') {
            steps {
                // 오류가 발생해도 계속 진행하도록 설정
                sh 'docker-compose down || true'
            }
        }
        
        stage('Start Services') {
            steps {
                // Docker Compose로 서비스 시작 (백그라운드 모드)
                sh 'docker-compose up -d'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                // 컨테이너가 실행 중인지 확인
                sh 'docker-compose ps'
                
                // 각 서비스가 실행 중인지 확인 (선택 사항)
                sh 'docker ps | grep multiple-auth-api'
                sh 'docker ps | grep app_nginx-production222'
                sh 'docker ps | grep ui-react'
                
                // 서비스가 응답하는지 확인 (몇 초 대기 후)
                sh 'sleep 20'
                sh 'curl -s --retry 5 --retry-delay 5 --retry-max-time 30 http://localhost:4211 > /dev/null'
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            // 실패 시 컨테이너 로그 확인
            sh 'docker-compose logs'
            echo 'Deployment failed'
        }
        always {
            // 빌드 결과에 관계없이 항상 실행될 작업
            echo 'Cleaning up workspace'
            cleanWs()
        }
    }
} 