# Node.js with Nginx

A simple Node.js application served through Nginx using Docker.

## Project Structure

```
.
├── Dockerfile              # Node.js Dockerfile
├── docker-compose.yml      # Docker Compose configuration
├── nginx/                  # Nginx configuration files
│   ├── default.conf        # Nginx site configuration
│   ├── nginx.conf          # Main Nginx configuration
│   └── Dockerfile.production # Nginx Dockerfile
├── package.json            # Node.js dependencies
├── public/                 # Static files
│   └── index.html          # Main HTML file
└── server.js               # Node.js server code
```

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone this repository

2. Build and run the containers:

```bash
docker-compose up -d
```

3. Access the application at http://localhost

## Development

To run the Node.js application locally without Docker:

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Access the application at http://localhost:3000

## Building for Production

```bash
# Build the Node.js application
npm run build

# Build and run the Docker containers
docker-compose up -d --build
``` 