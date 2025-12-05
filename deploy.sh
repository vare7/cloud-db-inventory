#!/bin/bash
# Quick Start Deployment Script for Cloud Database Inventory

set -e

echo "=================================="
echo "Cloud Database Inventory Deployment"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=cloud-db-inventory-dev
POSTGRES_DB=cloud_db_inventory

# Backend Configuration
DATABASE_URL=postgresql://postgres:cloud-db-inventory-dev@postgres:5432/cloud_db_inventory
PYTHONUNBUFFERED=1
EOF
    echo "✅ .env file created (use default development password)"
    echo ""
    echo "⚠️  WARNING: The default password is for development only!"
    echo "   For production, update the POSTGRES_PASSWORD in .env"
    echo ""
fi

# Prompt for deployment confirmation
echo "📋 Deployment Summary:"
echo "   - Backend API: http://localhost:8000"
echo "   - Frontend UI: http://localhost:3000"
echo "   - Database: PostgreSQL 17"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Useful commands:"
echo "   - View logs:        docker-compose logs -f"
echo "   - Stop services:    docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - Check status:     docker-compose ps"
echo ""
echo "📖 For more information, see DOCKER_DEPLOYMENT.md"
