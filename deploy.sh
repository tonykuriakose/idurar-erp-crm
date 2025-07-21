#!/bin/bash

# deploy.sh - Production Deployment Script
# Usage: ./deploy.sh [local|staging|production]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-local}
REGISTRY_USERNAME=${DOCKER_USERNAME:-tonykuriakose}
IMAGE_TAG=${IMAGE_TAG:-latest}

echo -e "${BLUE}🚀 Starting deployment for environment: ${ENVIRONMENT}${NC}"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    if [[ "$ENVIRONMENT" != "local" ]]; then
        if ! command -v kubectl &> /dev/null; then
            echo -e "${RED}❌ kubectl is not installed${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to build Docker images
build_images() {
    echo -e "${YELLOW}🔨 Building Docker images...${NC}"
    
    # Build backend
    echo -e "${BLUE}Building backend image...${NC}"
    docker build -t ${REGISTRY_USERNAME}/idurar-backend:${IMAGE_TAG} ./backend
    
    # Build frontend
    echo -e "${BLUE}Building frontend image...${NC}"
    docker build -t ${REGISTRY_USERNAME}/idurar-frontend:${IMAGE_TAG} ./frontend
    
    # Build Nest.js API
    echo -e "${BLUE}Building Nest.js integration API image...${NC}"
    docker build -t ${REGISTRY_USERNAME}/nest-integration-api:${IMAGE_TAG} ./nest_api_module/integration-api
    
    # Build Next.js CRUD
    echo -e "${BLUE}Building Next.js projects CRUD image...${NC}"
    docker build -t ${REGISTRY_USERNAME}/nextjs-projects-crud:${IMAGE_TAG} ./nextjs_crud_app
    
    echo -e "${GREEN}✅ All images built successfully${NC}"
}

# Function to push images to registry
push_images() {
    echo -e "${YELLOW}📤 Pushing images to registry...${NC}"
    
    if [[ -z "$DOCKER_PASSWORD" ]]; then
        echo -e "${YELLOW}⚠️  DOCKER_PASSWORD not set, skipping push${NC}"
        return
    fi
    
    echo "$DOCKER_PASSWORD" | docker login -u "$REGISTRY_USERNAME" --password-stdin
    
    docker push ${REGISTRY_USERNAME}/idurar-backend:${IMAGE_TAG}
    docker push ${REGISTRY_USERNAME}/idurar-frontend:${IMAGE_TAG}
    docker push ${REGISTRY_USERNAME}/nest-integration-api:${IMAGE_TAG}
    docker push ${REGISTRY_USERNAME}/nextjs-projects-crud:${IMAGE_TAG}
    
    echo -e "${GREEN}✅ All images pushed successfully${NC}"
}

# Function for local deployment
deploy_local() {
    echo -e "${YELLOW}🏠 Deploying locally with Docker Compose...${NC}"
    
    # Create .env file if it doesn't exist
    if [[ ! -f .env ]]; then
        echo -e "${YELLOW}⚠️  Creating .env file from example${NC}"
        cp .env.example .env
        echo -e "${RED}⚠️  Please update .env file with your actual values${NC}"
    fi
    
    # Stop existing containers
    docker-compose down
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    echo -e "${GREEN}✅ Local deployment completed${NC}"
    echo -e "${BLUE}🌐 Services available at:${NC}"
    echo -e "   Frontend: http://localhost:3000"
    echo -e "   Backend API: http://localhost:8000"
    echo -e "   Integration API: http://localhost:8888"
    echo -e "   Projects CRUD: http://localhost:3001"
}

# Function for Kubernetes deployment
deploy_kubernetes() {
    local env=$1
    echo -e "${YELLOW}☸️  Deploying to Kubernetes (${env})...${NC}"
    
    # Check if kubectl is configured
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}❌ kubectl is not configured or cluster is not accessible${NC}"
        exit 1
    fi
    
    # Update image tags in manifests
    echo -e "${BLUE}📝 Updating image tags in Kubernetes manifests...${NC}"
    
    sed -i.bak "s|{{BACKEND_IMAGE}}|${REGISTRY_USERNAME}/idurar-backend:${IMAGE_TAG}|g" k8s/${env}/*-deployment.yaml
    sed -i.bak "s|{{FRONTEND_IMAGE}}|${REGISTRY_USERNAME}/idurar-frontend:${IMAGE_TAG}|g" k8s/${env}/*-deployment.yaml
    sed -i.bak "s|{{NEST_API_IMAGE}}|${REGISTRY_USERNAME}/nest-integration-api:${IMAGE_TAG}|g" k8s/${env}/*-deployment.yaml
    sed -i.bak "s|{{NEXTJS_IMAGE}}|${REGISTRY_USERNAME}/nextjs-projects-crud:${IMAGE_TAG}|g" k8s/${env}/*-deployment.yaml
    
    # Apply Kubernetes manifests
    echo -e "${BLUE}🚀 Applying Kubernetes manifests...${NC}"
    kubectl apply -f k8s/${env}/namespace.yaml
    kubectl apply -f k8s/${env}/configmap.yaml
    kubectl apply -f k8s/${env}/secrets.yaml
    kubectl apply -f k8s/${env}/
    
    # Wait for deployments to be ready
    echo -e "${BLUE}⏳ Waiting for deployments to be ready...${NC}"
    kubectl rollout status deployment/backend-deployment -n ${env} --timeout=300s
    kubectl rollout status deployment/frontend-deployment -n ${env} --timeout=300s
    kubectl rollout status deployment/nest-api-deployment -n ${env} --timeout=300s
    kubectl rollout status deployment/nextjs-deployment -n ${env} --timeout=300s
    
    # Clean up backup files
    rm -f k8s/${env}/*.bak
    
    echo -e "${GREEN}✅ Kubernetes deployment completed${NC}"
    
    # Show service endpoints
    echo -e "${BLUE}🌐 Service endpoints:${NC}"
    kubectl get services -n ${env}
}

# Function to run health checks
health_check() {
    echo -e "${YELLOW}🏥 Running health checks...${NC}"
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        echo -e "${BLUE}Attempt ${attempt}/${max_attempts}...${NC}"
        
        if [[ "$ENVIRONMENT" == "local" ]]; then
            # Check local services
            if curl -f http://localhost:8000/health &>/dev/null && \
               curl -f http://localhost:3000 &>/dev/null && \
               curl -f http://localhost:8888/integration/reports/health &>/dev/null && \
               curl -f http://localhost:3001/api/projects &>/dev/null; then
                echo -e "${GREEN}✅ All services are healthy${NC}"
                return 0
            fi
        else
            # For Kubernetes deployments, check pod status
            if kubectl get pods -n ${ENVIRONMENT} | grep -q "Running"; then
                echo -e "${GREEN}✅ Kubernetes pods are running${NC}"
                return 0
            fi
        fi
        
        echo -e "${YELLOW}⏳ Services not ready yet, waiting...${NC}"
        sleep 10
        ((attempt++))
    done
    
    echo -e "${RED}❌ Health check failed after ${max_attempts} attempts${NC}"
    return 1
}

# Function to show deployment status
show_status() {
    echo -e "${BLUE}📊 Deployment Status for ${ENVIRONMENT}:${NC}"
    
    if [[ "$ENVIRONMENT" == "local" ]]; then
        echo -e "${YELLOW}Docker Containers:${NC}"
        docker-compose ps
    else
        echo -e "${YELLOW}Kubernetes Pods:${NC}"
        kubectl get pods -n ${ENVIRONMENT}
        echo -e "${YELLOW}Services:${NC}"
        kubectl get services -n ${ENVIRONMENT}
    fi
}

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    if [[ "$ENVIRONMENT" == "local" ]]; then
        docker-compose down
        docker system prune -f
    else
        echo -e "${YELLOW}To cleanup Kubernetes deployment, run:${NC}"
        echo "kubectl delete namespace ${ENVIRONMENT}"
    fi
}

# Main deployment logic
main() {
    check_prerequisites
    
    case $ENVIRONMENT in
        local)
            build_images
            deploy_local
            ;;
        staging|production)
            build_images
            push_images
            deploy_kubernetes $ENVIRONMENT
            ;;
        *)
            echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
            echo -e "Usage: $0 [local|staging|production]"
            exit 1
            ;;
    esac
    
    health_check
    show_status
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
}

# Handle script arguments
case "${2:-}" in
    --cleanup)
        cleanup
        exit 0
        ;;
    --status)
        show_status
        exit 0
        ;;
    --health)
        health_check
        exit 0
        ;;
esac

# Run main deployment
main

# Additional deployment information
echo -e "${BLUE}📚 Additional Information:${NC}"
echo -e "• Environment: ${ENVIRONMENT}"
echo -e "• Registry: ${REGISTRY_USERNAME}"
echo -e "• Image Tag: ${IMAGE_TAG}"
echo -e "• For cleanup: $0 ${ENVIRONMENT} --cleanup"
echo -e "• For status: $0 ${ENVIRONMENT} --status"
echo -e "• For health check: $0 ${ENVIRONMENT} --health"