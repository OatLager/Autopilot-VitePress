#!/bin/bash

# PX4 Autopilot Documentation Viewer Setup Script
# This script sets up the development environment for the VitePress documentation site

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js version is compatible (18.x or higher)"
        else
            print_warning "Node.js version is $NODE_VERSION. Recommended: 18.x or higher"
        fi
    else
        print_error "Node.js is not installed!"
        print_status "Please install Node.js 18.x or higher from: https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: v$NPM_VERSION"
    else
        print_error "npm is not installed!"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed successfully!"
    else
        print_error "package.json not found in current directory!"
        exit 1
    fi
}

# Setup development environment
setup_development() {
    print_status "Setting up development environment..."
    
    # Create necessary directories if they don't exist
    mkdir -p docs/public
    mkdir -p docs/version/main/introduction
    mkdir -p docs/version/main/concepts/system
    mkdir -p docs/version/main/concepts/modules
    
    print_success "Development environment setup complete!"
}

# Run development server
run_dev_server() {
    print_status "Starting development server..."
    print_status "The site will be available at: http://localhost:5173"
    print_status "Press Ctrl+C to stop the server"
    
    npm run dev
}

# Main setup process
main() {
    echo ""
    echo "🚀 PX4 Autopilot Documentation Viewer Setup"
    echo "=============================================="
    echo ""
    
    check_nodejs
    check_npm
    install_dependencies
    setup_development
    
    echo ""
    print_success "Setup completed successfully! 🎉"
    echo ""
    
    # Ask if user wants to start dev server
    read -p "Do you want to start the development server now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        run_dev_server
    else
        echo ""
        print_status "You can start the development server later with: npm run dev"
        print_status "Build for production with: npm run build"
        echo ""
    fi
}

# Run main function
main