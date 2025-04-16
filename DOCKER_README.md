# Docker-in-Docker Setup for multiple-auth-api

This setup allows running the Spring Boot multiple-auth-api application in a Docker container with the ability to create and manage additional Docker containers from within the main container.

## Files Overview

1. **Dockerfile.dind**: Main Dockerfile to build the application with Docker-in-Docker capabilities
2. **docker-compose.yaml**: Orchestrates all services (Spring Boot app, PostgreSQL, Nginx)
3. **docker-helper.sh**: Helper script for managing Docker containers from within the main container

## How to Run

1. Build and start all services:
   ```bash
   docker-compose up -d
   ```

2. To stop all services:
   ```bash
   docker-compose down
   ```

## Using Docker-in-Docker

From within the Spring Boot application, you can create and manage Docker containers using:

1. Java's ProcessBuilder to execute Docker commands
2. The provided `docker-helper.sh` script

### Example Usage of the Helper Script:

```java
// In your Spring Boot code
@Service
public class DockerService {
    
    public void createContainer(String name, String image, String ports, String envs) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
            "/app/docker-helper.sh", "create", name, image, ports, envs
        );
        Process process = pb.start();
        // Handle process output if needed
    }
    
    public void stopContainer(String name) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
            "/app/docker-helper.sh", "stop", name
        );
        Process process = pb.start();
        // Handle process output if needed
    }
    
    // Add more methods as needed
}
```

### Direct Docker Command Example:

```java
@Service
public class DockerDirectService {
    
    public void runContainer(String image) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
            "docker", "run", "-d", image
        );
        Process process = pb.start();
        // Handle process output if needed
    }
}
```

## Important Notes

1. The container runs in privileged mode, which has security implications. Use only in trusted environments.
2. Docker socket is mounted to allow Docker-in-Docker functionality.
3. The setup uses a custom Docker-in-Docker image based on the official Docker image.

## Troubleshooting

1. If Docker commands don't work within the container, check if the Docker daemon is running:
   ```bash
   docker exec -it multiple-auth-api sh -c "ps aux | grep dockerd"
   ```

2. To restart the Docker daemon in the container:
   ```bash
   docker exec -it multiple-auth-api sh -c "kill -9 \$(pgrep dockerd) && dockerd > /dev/null 2>&1 &"
   ``` 