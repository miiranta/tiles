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
RUN mkdir -p api/environments app/environments

# Create environment file for Angular with apiUrl property
RUN echo "export const environment = { BASE_URL: 'https://tiles.luvas.io', PORT: 443 };" > app/environments/environment.ts

# Build Angular app
WORKDIR /app/app
RUN ng build

# The built files are now at /app/app/dist/tiles/browser which is correct
# because the API looks for ../../app/dist/tiles/browser from src/main.js
WORKDIR /app/api

EXPOSE 80 443

CMD ["node", "app.js"]
