#!/usr/bin/env pwsh
<#
.SYNOPSIS
Push Cloud Database Inventory Docker images to Docker Hub

.DESCRIPTION
This script tags and pushes the backend and frontend images to Docker Hub.
Make sure you're logged in with: docker login
#>

param(
    [string]$DockerHubUser = "vare522"
)

$ErrorActionPreference = "Stop"

Write-Host "=================================="
Write-Host "Push to Docker Hub" -ForegroundColor Cyan
Write-Host "=================================="
Write-Host ""
Write-Host "Docker Hub User: $DockerHubUser" -ForegroundColor Yellow
Write-Host ""

# Check if Docker is running
try {
    $null = docker ps 2>&1
    Write-Host "✅ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if logged into Docker Hub
Write-Host "📝 Checking Docker Hub authentication..." -ForegroundColor Yellow
try {
    $authCheck = docker info 2>&1 | Select-String "Username"
    if ($authCheck) {
        Write-Host "✅ Logged into Docker Hub" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not logged into Docker Hub. Running docker login..." -ForegroundColor Yellow
        docker login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Docker login failed" -ForegroundColor Red
            exit 1
        }
    }
}
catch {
    Write-Host "⚠️  Could not verify Docker Hub login. Attempting to continue..." -ForegroundColor Yellow
}

Write-Host ""

# Tag and push backend
Write-Host "📦 Tagging backend image..." -ForegroundColor Cyan
docker tag cloud-db-inventory-backend:latest ${DockerHubUser}/cloud-db-inventory:backend
docker tag cloud-db-inventory-backend:latest ${DockerHubUser}/cloud-db-inventory:backend-${Version}

Write-Host "⬆️  Pushing backend image to Docker Hub..." -ForegroundColor Cyan
docker push ${DockerHubUser}/cloud-db-inventory:backend
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend image pushed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push backend image" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Tag and push frontend
Write-Host "📦 Tagging frontend image..." -ForegroundColor Cyan
docker tag cloud-db-inventory-frontend:latest ${DockerHubUser}/cloud-db-inventory:frontend
docker tag cloud-db-inventory-frontend:latest ${DockerHubUser}/cloud-db-inventory:frontend-${Version}


Write-Host "⬆️  Pushing frontend image to Docker Hub..." -ForegroundColor Cyan
docker push ${DockerHubUser}/cloud-db-inventory:frontend
    Write-Host "✅ Frontend image pushed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push frontend image" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=================================="
Write-Host "✅ Push Complete!" -ForegroundColor Green
Write-Host "=================================="
Write-Host ""
Write-Host "Images pushed to Docker Hub:" -ForegroundColor Cyan
Write-Host "  - ${DockerHubUser}/cloud-db-inventory:backend" -ForegroundColor Yellow
Write-Host "  - ${DockerHubUser}/cloud-db-inventory:backend-${Version}" -ForegroundColor Yellow
Write-Host "  - ${DockerHubUser}/cloud-db-inventory:frontend" -ForegroundColor Yellow
Write-Host "  - ${DockerHubUser}/cloud-db-inventory:frontend
Write-Host "  https://hub.docker.com/r/$DockerHubUser/cloud-db-inventory" -ForegroundColor Blue
Write-Host ""
