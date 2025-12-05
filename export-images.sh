#!/bin/bash
# Export Docker images to tar files for offline deployment

set -e

OUTPUT_DIR="${1:-.}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=================================="
echo "Docker Image Export"
echo "=================================="
echo ""
echo "Output directory: $OUTPUT_DIR"
echo ""

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Export images
echo "📦 Exporting backend image..."
docker save cloud-db-inventory-backend:latest | gzip > "$OUTPUT_DIR/cloud-db-inventory-backend-latest.tar.gz"
echo "✅ Backend image exported: $OUTPUT_DIR/cloud-db-inventory-backend-latest.tar.gz"

echo ""
echo "📦 Exporting frontend image..."
docker save cloud-db-inventory-frontend:latest | gzip > "$OUTPUT_DIR/cloud-db-inventory-frontend-latest.tar.gz"
echo "✅ Frontend image exported: $OUTPUT_DIR/cloud-db-inventory-frontend-latest.tar.gz"

echo ""
echo "📊 File sizes:"
ls -lh "$OUTPUT_DIR/cloud-db-inventory-"*.tar.gz

echo ""
echo "✅ Export complete!"
echo ""
echo "📝 To deploy on another machine:"
echo "   1. Copy the tar.gz files to the target machine"
echo "   2. Run: docker load -i cloud-db-inventory-backend-latest.tar.gz"
echo "   3. Run: docker load -i cloud-db-inventory-frontend-latest.tar.gz"
echo "   4. Verify: docker images | grep cloud-db-inventory"
echo "   5. Deploy: docker-compose up -d"
