package com.anita.multipleauthapi.service;

import com.anita.multipleauthapi.controller.request.LanguageType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Service for managing Docker containers from within the Docker container
 */
@Service
@Slf4j
public class DockerService {
    private static final String TEMP_DIR = "/tmp/code-execution";
    private static final Map<LanguageType, String> DOCKER_IMAGES = new HashMap<>();
    private static final Map<LanguageType, String> FILE_EXTENSIONS = new HashMap<>();
    private static final Map<LanguageType, List<String>> EXECUTION_COMMANDS = new HashMap<>();
    
    static {
        // Initialize Docker images
        DOCKER_IMAGES.put(LanguageType.JAVA, "openjdk:17-slim");
        DOCKER_IMAGES.put(LanguageType.PYTHON, "amancevice/pandas");
        DOCKER_IMAGES.put(LanguageType.C, "gcc:latest");
        DOCKER_IMAGES.put(LanguageType.CPP, "gcc:latest");
        DOCKER_IMAGES.put(LanguageType.JAVASCRIPT, "node:16-slim");
        DOCKER_IMAGES.put(LanguageType.TYPESCRIPT, "node:16-slim");
        DOCKER_IMAGES.put(LanguageType.KOTLIN, "openjdk:17-slim");
        DOCKER_IMAGES.put(LanguageType.RUBY, "ruby:3.0-slim");
        DOCKER_IMAGES.put(LanguageType.RUST, "rust:1.55-slim");
        DOCKER_IMAGES.put(LanguageType.GOLANG, "golang:1.17-alpine");
        DOCKER_IMAGES.put(LanguageType.SWIFT, "swift:5.5");
        DOCKER_IMAGES.put(LanguageType.PHP, "php:8.0-cli");
        DOCKER_IMAGES.put(LanguageType.SQL, "keinos/sqlite3");
        
        // Initialize file extensions
        FILE_EXTENSIONS.put(LanguageType.JAVA, ".java");
        FILE_EXTENSIONS.put(LanguageType.PYTHON, ".py");
        FILE_EXTENSIONS.put(LanguageType.C, ".c");
        FILE_EXTENSIONS.put(LanguageType.CPP, ".cpp");
        FILE_EXTENSIONS.put(LanguageType.JAVASCRIPT, ".js");
        FILE_EXTENSIONS.put(LanguageType.TYPESCRIPT, ".ts");
        FILE_EXTENSIONS.put(LanguageType.KOTLIN, ".kt");
        FILE_EXTENSIONS.put(LanguageType.RUBY, ".rb");
        FILE_EXTENSIONS.put(LanguageType.RUST, ".rs");
        FILE_EXTENSIONS.put(LanguageType.GOLANG, ".go");
        FILE_EXTENSIONS.put(LanguageType.SWIFT, ".swift");
        FILE_EXTENSIONS.put(LanguageType.PHP, ".php");
        FILE_EXTENSIONS.put(LanguageType.SQL, ".sql");
        
        // Initialize execution commands
        EXECUTION_COMMANDS.put(LanguageType.JAVA, List.of("javac", "Main.java", "&&", "java", "Main"));
        EXECUTION_COMMANDS.put(LanguageType.PYTHON, List.of("python", "main.py"));
        EXECUTION_COMMANDS.put(LanguageType.C, List.of("gcc", "main.c", "-o", "main", "&&", "./main"));
        EXECUTION_COMMANDS.put(LanguageType.CPP, List.of("g++", "main.cpp", "-o", "main", "&&", "./main"));
        EXECUTION_COMMANDS.put(LanguageType.JAVASCRIPT, List.of("node", "main.js"));
        EXECUTION_COMMANDS.put(LanguageType.TYPESCRIPT, List.of("tsc", "main.ts", "&&", "node", "main.js"));
        EXECUTION_COMMANDS.put(LanguageType.KOTLIN, List.of("kotlinc", "main.kt", "-include-runtime", "-d", "main.jar", "&&", "java", "-jar", "main.jar"));
        EXECUTION_COMMANDS.put(LanguageType.RUBY, List.of("ruby", "main.rb"));
        EXECUTION_COMMANDS.put(LanguageType.RUST, List.of("rustc", "main.rs", "&&", "./main"));
        EXECUTION_COMMANDS.put(LanguageType.GOLANG, List.of("go", "run", "main.go"));
        EXECUTION_COMMANDS.put(LanguageType.SWIFT, List.of("swift", "main.swift"));
        EXECUTION_COMMANDS.put(LanguageType.PHP, List.of("php", "main.php"));
        EXECUTION_COMMANDS.put(LanguageType.SQL, List.of("sqlite3", "app.db"));
    }
    
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
    
    /**
     * Executes code in a Docker container and returns the result
     *
     * @param language        The programming language
     * @param code            The source code to execute
     * @param initialCode     Optional initial code (SQL schema/data setup)
     * @param timeout         Maximum execution time in seconds
     * @return                A map containing stdout, stderr, and execution time
     */
    public ExecutionResult executeCode(LanguageType language, String code, String initialCode, int timeout) {
        return executeCode(language, code, initialCode, null, timeout);
    }
    
    /**
     * Executes code in a Docker container and returns the result with input data support
     *
     * @param language        The programming language
     * @param code            The source code to execute
     * @param initialCode     Optional initial code (SQL schema/data setup)
     * @param inputData       Input data for stdin (for programs using input() function)
     * @param timeout         Maximum execution time in seconds
     * @return                A map containing stdout, stderr, and execution time
     */
    public ExecutionResult executeCode(LanguageType language, String code, String initialCode, String inputData, int timeout) {
        try {
            String executionId = UUID.randomUUID().toString();
            String workDir = TEMP_DIR + "/" + executionId;
            
            log.info("=== Code Execution Debug Info ===");
            log.info("Language: {}", language);
            log.info("Execution ID: {}", executionId);
            log.info("Input Data: '{}'", inputData);
            log.info("Input Data is null: {}", inputData == null);
            log.info("Input Data is empty: {}", inputData != null && inputData.trim().isEmpty());
            
            // Create temporary directory
            try {
                Path dirPath = Path.of(workDir);
                Files.createDirectories(dirPath);
                log.info("Temporary directory created successfully: {}", dirPath.toAbsolutePath());
            } catch (Exception e) {
                log.error("Failed to create temporary directory: {}", e.getMessage(), e);
                return ExecutionResult.builder()
                    .stdout("")
                    .stderr("Failed to create execution environment: " + e.getMessage())
                    .executionTime(0L)
                    .exitCode(-1)
                    .timedOut(false)
                    .build();
            }
            
            // For SQL, special handling with SQLite
            if (language == LanguageType.SQL) {
                return executeSqlCode(executionId, workDir, code, initialCode, timeout);
            }
            
            // Check if input data is provided
            boolean hasInput = (inputData != null && !inputData.trim().isEmpty());
            
            log.info("Has input: {}", hasInput);
            
            // For languages with input data, create input file and handle appropriately
            String modifiedCode = code;
            if (hasInput) {
                // Create input file for all languages
                File inputFile = new File(workDir + "/input.txt");
                try (FileWriter writer = new FileWriter(inputFile)) {
                    writer.write(inputData);
                    log.info("Input file created for {}: {}", language, inputFile.getName());
                } catch (Exception e) {
                    log.error("Failed to create input file: {}", e.getMessage(), e);
                    return ExecutionResult.builder()
                        .stdout("")
                        .stderr("Failed to prepare input data: " + e.getMessage())
                        .executionTime(0L)
                        .exitCode(-1)
                        .timedOut(false)
                        .build();
                }
                
                // Modify code based on language
                switch (language) {
                    case PYTHON:
                        // Modify Python code to read from file instead of stdin
                        modifiedCode = "import sys\n" +
                                      "import io\n" +
                                      "with open('/code/input.txt', 'r') as f:\n" +
                                      "    input_data = f.read()\n" +
                                      "sys.stdin = io.StringIO(input_data)\n" +
                                      "# Original user code below:\n" +
                                      code;
                        log.info("Modified Python code with improved input redirection");
                        break;
                    case JAVA:
                        // For Java, we'll redirect stdin in the docker command
                        break;
                    case CPP:
                    case C:
                        // For C/C++, we'll redirect stdin in the docker command
                        break;
                    default:
                        break;
                }
            }
            
            // Write modified code to file
            String extension = FILE_EXTENSIONS.getOrDefault(language, ".txt");
            String mainFileName = getMainFileName(language);
            File codeFile = new File(workDir + "/" + mainFileName);
            
            try {
                // Create the file
                if (!codeFile.createNewFile()) {
                    log.warn("File already exists, will overwrite: {}", codeFile.getAbsolutePath());
                } else {
                    log.info("Code file created successfully: {}", codeFile.getAbsolutePath());
                }
                
                // Write modified code to file
                try (FileWriter writer = new FileWriter(codeFile)) {
                    writer.write(modifiedCode);
                    log.info("Code written to file successfully: {}", codeFile.getName());
                }
            } catch (Exception e) {
                log.error("Failed to create or write to code file: {}", e.getMessage(), e);
                return ExecutionResult.builder()
                    .stdout("")
                    .stderr("Failed to prepare code for execution: " + e.getMessage())
                    .executionTime(0L)
                    .exitCode(-1)
                    .timedOut(false)
                    .build();
            }
            
            // Build Docker command (no longer need stdin for Python)
            List<String> dockerCommand = buildDockerCommand(language, executionId, workDir, timeout, false);
            log.info("Docker command: {}", String.join(" ", dockerCommand));
            
            // Execute Docker command
            ProcessBuilder processBuilder = new ProcessBuilder(dockerCommand);
            processBuilder.redirectErrorStream(false);
            
            long startTime = System.currentTimeMillis();
            Process process = processBuilder.start();
            
            // Wait for process to complete or timeout
            boolean completed = process.waitFor(timeout, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (!completed) {
                process.destroyForcibly();
                return ExecutionResult.builder()
                    .stdout("")
                    .stderr("Execution timed out after " + timeout + " seconds")
                    .executionTime(executionTime)
                    .timedOut(true)
                    .build();
            }
            
            // Read output and error streams
            String stdout = readStream(process.getInputStream());
            String stderr = readStream(process.getErrorStream());
            
            // Clean up
            try {
                Files.walk(Path.of(workDir))
                    .sorted(java.util.Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
            } catch (Exception e) {
                log.error("Failed to clean up temp files: {}", e.getMessage());
            }
            
            return ExecutionResult.builder()
                .stdout(stdout)
                .stderr(stderr)
                .executionTime(executionTime)
                .exitCode(process.exitValue())
                .timedOut(false)
                .build();
            
        } catch (Exception e) {
            log.error("Error executing code: {}", e.getMessage(), e);
            return ExecutionResult.builder()
                .stdout("")
                .stderr("Internal execution error: " + e.getMessage())
                .executionTime(0L)
                .exitCode(-1)
                .timedOut(false)
                .build();
        }
    }
    
    /**
     * Special handler for executing SQL code with SQLite
     * 
     * @param executionId     Unique ID for this execution
     * @param workDir         Working directory for temporary files
     * @param code            SQL code to execute (user query)
     * @param initialCode     Initial SQL code (create tables/insert data)
     * @param timeout         Timeout in seconds
     * @return                Execution result
     */
    private ExecutionResult executeSqlCode(String executionId, String workDir, String code, String initialCode, int timeout) throws Exception {
        // Create a combined SQL file with initialCode and user code for full execution
        File fullSqlFile = new File(workDir + "/init_and_query.sql");
        try (FileWriter writer = new FileWriter(fullSqlFile)) {
            if (initialCode != null && !initialCode.isEmpty()) {
                writer.write(initialCode);
                writer.write("\n");
            }
            writer.write(code);
        }
        
        // Create SQLite database file
        String dbPath = workDir + "/app.db";
        
        // Create directory for SQLite database
        new File(workDir + "/data").mkdirs();
        
        // Build Docker command for SQLite
        List<String> command = new ArrayList<>();
        command.add("docker");
        command.add("run");
        command.add("--rm");
        command.add("--name");
        command.add("sql-exec-" + executionId);
        
        // Set resource limits
        command.add("--memory=256m");
        command.add("--cpus=1");
        command.add("--network=none");  // No network access
        
        // Mount volume
        command.add("-v");
        command.add(workDir + ":/data");
        
        // Docker image
        command.add("keinos/sqlite3");
        
        // Command to execute
        command.add("sqlite3");
        command.add("/data/app.db");
        command.add(".mode column");
        command.add(".headers on");
        
        // Execute initialCode to setup database (if provided)
        if (initialCode != null && !initialCode.isEmpty()) {
            // Create initialization file
            File initFile = new File(workDir + "/init.sql");
            try (FileWriter writer = new FileWriter(initFile)) {
                writer.write(initialCode);
            }
            
            // Execute initialization SQL to set up the database
            List<String> initCommand = new ArrayList<>(command);
            initCommand.add(".read /data/init.sql");
            
            ProcessBuilder initProcessBuilder = new ProcessBuilder(initCommand);
            initProcessBuilder.redirectErrorStream(false);
            
            Process initProcess = initProcessBuilder.start();
            boolean initCompleted = initProcess.waitFor(timeout, TimeUnit.SECONDS);
            
            if (!initCompleted) {
                initProcess.destroyForcibly();
                return ExecutionResult.builder()
                    .stdout("")
                    .stderr("Database initialization timed out")
                    .executionTime(0L)
                    .exitCode(-1)
                    .timedOut(true)
                    .build();
            }
            
            // Check for errors in initialization
            String initStderr = readStream(initProcess.getErrorStream());
            if (!initStderr.isEmpty()) {
                return ExecutionResult.builder()
                    .stdout("")
                    .stderr("Database initialization error: " + initStderr)
                    .executionTime(0L)
                    .exitCode(initProcess.exitValue())
                    .timedOut(false)
                    .build();
            }
        }
        
        // Execute the user's SQL query
        File queryFile = new File(workDir + "/query.sql");
        try (FileWriter writer = new FileWriter(queryFile)) {
            writer.write(code);
        }
        
        List<String> queryCommand = new ArrayList<>(command);
        queryCommand.add(".read /data/query.sql");
        
        ProcessBuilder queryProcessBuilder = new ProcessBuilder(queryCommand);
        queryProcessBuilder.redirectErrorStream(false);
        
        long startTime = System.currentTimeMillis();
        Process queryProcess = queryProcessBuilder.start();
        
        boolean completed = queryProcess.waitFor(timeout, TimeUnit.SECONDS);
        long executionTime = System.currentTimeMillis() - startTime;
        
        if (!completed) {
            queryProcess.destroyForcibly();
            return ExecutionResult.builder()
                .stdout("")
                .stderr("Query execution timed out after " + timeout + " seconds")
                .executionTime(executionTime)
                .timedOut(true)
                .build();
        }
        
        // Read output and error streams
        String stdout = readStream(queryProcess.getInputStream());
        String stderr = readStream(queryProcess.getErrorStream());
        
        return ExecutionResult.builder()
            .stdout(stdout)
            .stderr(stderr)
            .executionTime(executionTime)
            .exitCode(queryProcess.exitValue())
            .timedOut(false)
            .build();
    }
    
    private List<String> buildDockerCommand(LanguageType language, String executionId, String workDir, int timeout, boolean hasInput) {
        String dockerImage = DOCKER_IMAGES.getOrDefault(language, "alpine:latest");
        List<String> command = new ArrayList<>();
        
        // Base docker run command
        command.add("docker");
        command.add("run");
        command.add("--rm");
        
        // Add interactive flag if input data is provided (but not for Python as we handle it differently)
        if (hasInput && language != LanguageType.PYTHON) {
            command.add("-i");
        }
        
        command.add("--name");
        command.add("code-exec-" + executionId);
        
        // Set resource limits
        command.add("--memory=256m");
        command.add("--cpus=1");
        command.add("--network=none");  // No network access
        
        // Set timeout
        command.add("--stop-timeout=" + timeout);
        
        // Mount volume
        command.add("-v");
        command.add(workDir + ":/code");
        
        // Working directory
        command.add("-w");
        command.add("/code");
        
        // Docker image
        command.add(dockerImage);
        
        // Shell with command execution based on language
        command.add("sh");
        command.add("-c");
        
        List<String> executionCommand = EXECUTION_COMMANDS.getOrDefault(language, List.of("echo", "Unsupported language"));
        String commandString = String.join(" ", executionCommand);
        
        // Add input redirection for languages that need it (except Python which handles it internally)
        if (hasInput && language != LanguageType.PYTHON) {
            commandString += " < input.txt";
        }
        
        command.add(commandString);
        
        return command;
    }
    
    private String getMainFileName(LanguageType language) {
        switch (language) {
            case JAVA: return "Main.java";
            case PYTHON: return "main.py";
            case C: return "main.c";
            case CPP: return "main.cpp";
            case JAVASCRIPT: return "main.js";
            case TYPESCRIPT: return "main.ts";
            case KOTLIN: return "main.kt";
            case RUBY: return "main.rb";
            case RUST: return "main.rs";
            case GOLANG: return "main.go";
            case SWIFT: return "main.swift";
            case PHP: return "main.php";
            case SQL: return "query.sql";
            default: return "main" + FILE_EXTENSIONS.getOrDefault(language, ".txt");
        }
    }
    
    private String readStream(java.io.InputStream stream) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream))) {
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            return output.toString();
        }
    }
    
    @lombok.Builder
    @lombok.Data
    public static class ExecutionResult {
        private String stdout;
        private String stderr;
        private Long executionTime;
        private Integer exitCode;
        private Boolean timedOut;
    }
} 