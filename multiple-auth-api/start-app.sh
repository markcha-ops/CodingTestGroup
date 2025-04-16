#!/bin/bash

# Docker 서비스 시작
service docker start

# 환경 변수 JVM 인자로 전달
JAVA_OPTS=""
JAVA_OPTS="$JAVA_OPTS -DdatabaseHost=$DATABASE_HOST"
JAVA_OPTS="$JAVA_OPTS -DdatabaseName=$DATABASE_NAME"
JAVA_OPTS="$JAVA_OPTS -DdatabaseUser=$DATABASE_USER"
JAVA_OPTS="$JAVA_OPTS -DdatabasePassword=$DATABASE_PASSWORD"
JAVA_OPTS="$JAVA_OPTS -DgoogleClientId=$GOOGLE_CLIENT_ID"
JAVA_OPTS="$JAVA_OPTS -DgoogleClientSecret=$GOOGLE_CLIENT_SECRET"
JAVA_OPTS="$JAVA_OPTS -DgithubClientId=$GITHUB_CLIENT_ID"
JAVA_OPTS="$JAVA_OPTS -DgithubClientSecret=$GITHUB_CLIENT_SECRET"
JAVA_OPTS="$JAVA_OPTS -DauthTokenSecret=$AUTH_TOKEN_SECRET"
JAVA_OPTS="$JAVA_OPTS -DbaseUrl=$baseUrl"

# Maven으로 Spring Boot 애플리케이션 실행
mvn spring-boot:run -Dspring-boot.run.jvmArguments="$JAVA_OPTS" 