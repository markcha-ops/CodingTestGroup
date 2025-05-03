FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm ci
RUN npm install
# Install missing dependencies
RUN npm install react-monaco-editor

# Copy source code
COPY . .

# Build the app
RUN npm run build

CMD ["npm", "run", "start"] 