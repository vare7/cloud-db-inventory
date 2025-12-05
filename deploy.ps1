#!/usr/bin/env pwsh
<#
.SYNOPSIS
Quick Start Deployment Script for Cloud Database Inventory (Windows)

.DESCRIPTION
This script helps deploy the Cloud Database Inventory application
using Docker and Docker Compose on Windows systems.
#>

Write-Host "=================================="
Write-Host "Cloud Database Inventory Deployment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    $null = docker --version
    Write-Host "✅ Docker is installed" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   Visit: https://docs.docker.com/docker-for-windows/install/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is installed
try {
    $null = docker-compose --version
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker Compose is not installed." -ForegroundColor Red
    Write-Host "   It should be included with Docker Desktop for Windows" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Create .env if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    @"
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=cloud-db-inventory-dev
POSTGRES_DB=cloud_db_inventory

# Backend Configuration
DATABASE_URL=postgresql://postgres:cloud-db-inventory-dev@postgres:5432/cloud_db_inventory
PYTHONUNBUFFERED=1
"@ | Out-File -Encoding UTF8 ".env"
    
    Write-Host "✅ .env file created (using default development password)" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  WARNING: The default password is for development only!" -ForegroundColor Yellow
    Write-Host "   For production, update the POSTGRES_PASSWORD in .env" -ForegroundColor Yellow
    Write-Host ""
}

# Display deployment summary
Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "   - Backend API: http://localhost:8000"
Write-Host "   - Frontend UI: http://localhost:3000"
Write-Host "   - Database: PostgreSQL 17"
Write-Host ""

# Prompt for confirmation
$response = Read-Host "Continue with deployment? (y/n)"
if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000"
Write-Host "   - API Docs: http://localhost:8000/docs"
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   - View logs:        docker-compose logs -f"
Write-Host "   - Stop services:    docker-compose down"
Write-Host "   - Restart services: docker-compose restart"
Write-Host "   - Check status:     docker-compose ps"
Write-Host ""
Write-Host "📖 For more information, see DOCKER_DEPLOYMENT.md" -ForegroundColor Yellow
