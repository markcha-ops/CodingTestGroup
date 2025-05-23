# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the project files
COPY . .
RUN ls -la
# Build the application
RUN mvn clean package -DskipTests
# Display the contents of the target directory to verify JAR file
RUN ls -la target/

# Stage 2: Run the application
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the jar file from the build stage with explicit name
COPY --from=build /app/target/multiple-auth-api-0.0.1-SNAPSHOT.jar app.jar
# Verify the JAR file exists
RUN ls -la

# Expose the port
EXPOSE 8080

ENV DATABASE_HOST=$DATABASE_HOST
ENV DATABASE_NAME=$DATABASE_NAME
ENV DATABASE_USER=$DATABASE_USER
ENV DATABASE_PASSWORD=$DATABASE_PASSWORD
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
ENV GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET
ENV AUTH_TOKEN_SECRET=$AUTH_TOKEN_SECRET
ENV baseUrl=$baseUrl
ENV SPRING_PROFILE=prod

# Run the application with environment variables passed as JVM arguments
ENTRYPOINT [                                                \
    "java",                                                 \
    "-jar",                                                 \
    "-Djava.security.egd=file:/dev/./urandom",              \
    "-DdatabaseHost=${DATABASE_HOST}",                      \
    "-DdatabaseName=${DATABASE_NAME}",                      \
    "-DdatabaseUser=${DATABASE_USER}",                      \
    "-DdatabasePassword=${DATABASE_PASSWORD}",              \
    "-DgoogleClientId=${GOOGLE_CLIENT_ID}",                 \
    "-DgoogleClientSecret=${GOOGLE_CLIENT_SECRET}",         \
    "-DgithubClientId=${GITHUB_CLIENT_ID}",                 \
    "-DgithubClientSecret=${GITHUB_CLIENT_SECRET}",         \
    "-DauthTokenSecret=${AUTH_TOKEN_SECRET}",               \
    "-DbaseUrl=${baseUrl}",                                 \
    "-Dspring.profiles.active=${SPRING_PROFILE}",           \
    "-Dsun.net.inetaddr.ttl=0",                             \
    "app.jar"                                               \
]
