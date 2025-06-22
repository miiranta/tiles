FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY app/package*.json ./app/
COPY api/package*.json ./api/

# Install Angular CLI
RUN npm install -g @angular/cli

# Install dependencies
WORKDIR /app/app
RUN npm install

WORKDIR /app/api
RUN npm install

# Copy source code
WORKDIR /app
COPY app/ ./app/
COPY api/ ./api/

# Create environment directories
RUN mkdir -p api/environments

# Update the existing environment file for Angular with apiUrl property
RUN echo "export const environment = { BASE_URL: 'localhost', PORT: 3000, apiUrl: 'http://localhost:3000' };" > app/environments/environment.ts

# Build Angular app
WORKDIR /app/app
RUN ng build

# The built files are now at /app/app/dist/tiles/browser which is correct
# because the API looks for ../../app/dist/tiles/browser from src/main.js
WORKDIR /app/api

EXPOSE 3000

CMD ["node", "app.js"]
