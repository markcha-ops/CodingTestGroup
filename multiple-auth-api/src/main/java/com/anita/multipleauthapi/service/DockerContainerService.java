package com.anita.multipleauthapi.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.CompletableFuture;

/**
 * Service for managing Docker containers from within the Docker container
 */
@Service
@Slf4j
public class DockerContainerService {
    
    /**
     * Creates a new Docker container
     * 
     * @param name Container name
     * @param image Docker image to use
     * @param ports Port mappings (format: "8080:80,9000:9000")
     * @param envs Environment variables (format: "VAR1=value1,VAR2=value2")
     * @return Output from the command execution
     */
    public String createContainer(String name, String image, String ports, String envs) {
        return executeCommand("/app/docker-helper.sh", "create", name, image, ports, envs);
    }
    
    /**
     * Stops a running container
     * 
     * @param name Container name
     * @return Output from the command execution
     */
    public String stopContainer(String name) {
        return executeCommand("/app/docker-helper.sh", "stop", name);
    }
    
    /**
     * Removes a container
     * 
     * @param name Container name
     * @return Output from the command execution
     */
    public String removeContainer(String name) {
        return executeCommand("/app/docker-helper.sh", "remove", name);
    }
    
    /**
     * Lists all containers
     * 
     * @return Output from the command execution
     */
    public String listContainers() {
        return executeCommand("/app/docker-helper.sh", "list");
    }
    
    /**
     * Executes a Docker command directly
     * 
     * @param args Command arguments
     * @return Output from the command execution
     */
    private String executeCommand(String... args) {
        try {
            ProcessBuilder pb = new ProcessBuilder(args);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // Read the output asynchronously
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            // Wait for the process to complete
            int exitCode = process.waitFor();
            log.info("Command executed with exit code: {}", exitCode);
            
            return output.toString();
        } catch (Exception e) {
            log.error("Error executing Docker command", e);
            return "Error: " + e.getMessage();
        }
    }
    
    /**
     * Executes a command asynchronously
     * 
     * @param args Command arguments
     * @return A CompletableFuture containing the command output
     */
    public CompletableFuture<String> executeCommandAsync(String... args) {
        return CompletableFuture.supplyAsync(() -> executeCommand(args));
    }
} 