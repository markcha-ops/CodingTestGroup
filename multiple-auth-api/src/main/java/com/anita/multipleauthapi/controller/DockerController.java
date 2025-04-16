package com.anita.multipleauthapi.controller;

import com.anita.multipleauthapi.service.DockerContainerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for managing Docker containers
 */
@RestController
@RequestMapping("/api/docker")
@RequiredArgsConstructor
public class DockerController {

    private final DockerContainerService dockerContainerService;

    /**
     * Creates a new Docker container
     */
    @PostMapping("/containers")
    public ResponseEntity<String> createContainer(
            @RequestParam String name,
            @RequestParam String image,
            @RequestParam(required = false, defaultValue = "") String ports,
            @RequestParam(required = false, defaultValue = "") String envs) {
        
        String result = dockerContainerService.createContainer(name, image, ports, envs);
        return ResponseEntity.ok(result);
    }

    /**
     * Stops a running container
     */
    @PostMapping("/containers/{name}/stop")
    public ResponseEntity<String> stopContainer(@PathVariable String name) {
        String result = dockerContainerService.stopContainer(name);
        return ResponseEntity.ok(result);
    }

    /**
     * Removes a container
     */
    @DeleteMapping("/containers/{name}")
    public ResponseEntity<String> removeContainer(@PathVariable String name) {
        String result = dockerContainerService.removeContainer(name);
        return ResponseEntity.ok(result);
    }

    /**
     * Lists all containers
     */
    @GetMapping("/containers")
    public ResponseEntity<String> listContainers() {
        String result = dockerContainerService.listContainers();
        return ResponseEntity.ok(result);
    }
} 