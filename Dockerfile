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

# Build Angular app
WORKDIR /app/api
RUN npm run setup

EXPOSE 80 443 3000

CMD ["node", "app.js"]
