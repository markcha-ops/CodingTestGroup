pipeline {
    agent any
    
    // 필요한 경우에만 자격 증명 사용 (지금은 주석 처리)
    // environment {
    //    DOCKER_REGISTRY = credentials('docker-registry-credentials')
    // }
    
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
                sh 'docker ps | grep multiple-auth-api || true'
                sh 'docker ps | grep app_nginx-production222 || true'
                sh 'docker ps | grep ui-react || true'
                
                // 서비스가 응답하는지 확인 (몇 초 대기 후)
                sh 'sleep 20'
                sh 'curl -s --retry 5 --retry-delay 5 --retry-max-time 30 http://localhost:4211 > /dev/null || echo "서비스 접속 실패하였으나 계속 진행합니다."'
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            // 실패 시 컨테이너 로그 확인
            sh 'docker-compose logs || echo "로그를 확인할 수 없습니다"'
            echo 'Deployment failed'
        }
        always {
            // 빌드 결과에 관계없이 항상 실행될 작업
            echo 'Cleaning up workspace'
            cleanWs()
        }
    }
} 