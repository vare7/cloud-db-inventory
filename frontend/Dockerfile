# Build stage
FROM node:20-alpine AS build
WORKDIR /app
# Copy package files
COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit
# Copy all config and source files
COPY frontend/tsconfig.json frontend/tsconfig.node.json frontend/vite.config.ts ./
COPY frontend/index.html ./
COPY frontend/src ./src
# Set API URL to relative path for nginx proxy
ENV VITE_API_URL=/api
RUN npm run build

# Serve stage
FROM nginx:1.27-alpine AS frontend
COPY --from=build /app/dist /usr/share/nginx/html
# Simple nginx config to proxy API requests to backend
RUN rm /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
