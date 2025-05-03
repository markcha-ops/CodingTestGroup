FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install missing dependencies
RUN npm install react-monaco-editor
COPY package.json ./
# package-lock.json이 존재하는 경우에만 복사 (선택사항)
COPY package-lock.json* ./
# Copy source code
COPY . .

# Build the app
RUN npm run build

CMD ["npm", "run", "start"] 