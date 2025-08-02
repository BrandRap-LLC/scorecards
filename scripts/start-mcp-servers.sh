#!/bin/bash

# MCP Servers Startup Script
# This script starts both Supabase and MSSQL MCP servers

set -e

echo "🚀 Starting MCP Servers for Scorecards Project"
echo "================================================"

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

# Check if required directories exist
SUPABASE_SERVER_DIR="/Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server"
MSSQL_SERVER_DIR="/Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server"

if [ ! -d "$SUPABASE_SERVER_DIR" ]; then
    print_error "Supabase MCP server directory not found: $SUPABASE_SERVER_DIR"
    exit 1
fi

if [ ! -d "$MSSQL_SERVER_DIR" ]; then
    print_error "MSSQL MCP server directory not found: $MSSQL_SERVER_DIR"
    exit 1
fi

# Function to start Supabase MCP server
start_supabase_server() {
    print_status "Starting Supabase MCP Server..."
    
    cd "$SUPABASE_SERVER_DIR"
    
    # Check if Node.js is available
    if ! command -v /opt/homebrew/bin/node &> /dev/null; then
        print_error "Node.js not found at /opt/homebrew/bin/node"
        exit 1
    fi
    
    # Check if the built server exists
    if [ ! -f "dist/index.js" ]; then
        print_error "Supabase MCP server not built. Please build the server first."
        exit 1
    fi
    
    print_success "Supabase MCP Server starting..."
    
    # Start the server in background
    /opt/homebrew/bin/node dist/index.js "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres" &
    SUPABASE_PID=$!
    echo $SUPABASE_PID > /tmp/supabase_mcp_server.pid
    
    print_success "Supabase MCP Server started (PID: $SUPABASE_PID)"
}

# Function to start MSSQL MCP server
start_mssql_server() {
    print_status "Starting MSSQL MCP Server..."
    
    cd "$MSSQL_SERVER_DIR"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        print_error "MSSQL MCP server virtual environment not found"
        exit 1
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Check Python version
    PYTHON_VERSION=$(python --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
    REQUIRED_VERSION="3.11"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_error "Python version $PYTHON_VERSION is too old. Required: $REQUIRED_VERSION or higher"
        exit 1
    fi
    
    print_success "MSSQL MCP Server starting..."
    
    # Set environment variables
    export MSSQL_DRIVER="FreeTDS"
    export MSSQL_HOST="54.245.209.65"
    export MSSQL_USER="supabase"
    export MSSQL_PASSWORD="R#8kZ2w\$tE1Q"
    export MSSQL_DATABASE="aggregated_reporting"
    export TrustServerCertificate="yes"
    export Trusted_Connection="no"
    export ODBCINI="/Users/haris/.odbcinst.ini"
    
    # Start the server in background
    python -m mssql_mcp_server.server &
    MSSQL_PID=$!
    echo $MSSQL_PID > /tmp/mssql_mcp_server.pid
    
    print_success "MSSQL MCP Server started (PID: $MSSQL_PID)"
}

# Function to stop servers
stop_servers() {
    print_status "Stopping MCP Servers..."
    
    # Stop Supabase server
    if [ -f /tmp/supabase_mcp_server.pid ]; then
        SUPABASE_PID=$(cat /tmp/supabase_mcp_server.pid)
        if kill -0 $SUPABASE_PID 2>/dev/null; then
            kill $SUPABASE_PID
            print_success "Supabase MCP Server stopped (PID: $SUPABASE_PID)"
        fi
        rm -f /tmp/supabase_mcp_server.pid
    fi
    
    # Stop MSSQL server
    if [ -f /tmp/mssql_mcp_server.pid ]; then
        MSSQL_PID=$(cat /tmp/mssql_mcp_server.pid)
        if kill -0 $MSSQL_PID 2>/dev/null; then
            kill $MSSQL_PID
            print_success "MSSQL MCP Server stopped (PID: $MSSQL_PID)"
        fi
        rm -f /tmp/mssql_mcp_server.pid
    fi
}

# Function to check server status
check_status() {
    print_status "Checking MCP Server Status..."
    
    # Check Supabase server
    if [ -f /tmp/supabase_mcp_server.pid ]; then
        SUPABASE_PID=$(cat /tmp/supabase_mcp_server.pid)
        if kill -0 $SUPABASE_PID 2>/dev/null; then
            print_success "Supabase MCP Server is running (PID: $SUPABASE_PID)"
        else
            print_warning "Supabase MCP Server is not running"
        fi
    else
        print_warning "Supabase MCP Server is not running"
    fi
    
    # Check MSSQL server
    if [ -f /tmp/mssql_mcp_server.pid ]; then
        MSSQL_PID=$(cat /tmp/mssql_mcp_server.pid)
        if kill -0 $MSSQL_PID 2>/dev/null; then
            print_success "MSSQL MCP Server is running (PID: $MSSQL_PID)"
        else
            print_warning "MSSQL MCP Server is not running"
        fi
    else
        print_warning "MSSQL MCP Server is not running"
    fi
}

# Main script logic
case "${1:-start}" in
    "start")
        print_status "Starting MCP Servers..."
        start_supabase_server
        start_mssql_server
        print_success "All MCP Servers started successfully!"
        echo ""
        print_status "Server PIDs saved to:"
        echo "  - Supabase: /tmp/supabase_mcp_server.pid"
        echo "  - MSSQL: /tmp/mssql_mcp_server.pid"
        echo ""
        print_status "Use './scripts/start-mcp-servers.sh stop' to stop servers"
        print_status "Use './scripts/start-mcp-servers.sh status' to check status"
        ;;
    "stop")
        stop_servers
        print_success "All MCP Servers stopped!"
        ;;
    "status")
        check_status
        ;;
    "restart")
        print_status "Restarting MCP Servers..."
        stop_servers
        sleep 2
        start_supabase_server
        start_mssql_server
        print_success "All MCP Servers restarted successfully!"
        ;;
    *)
        echo "Usage: $0 {start|stop|status|restart}"
        echo ""
        echo "Commands:"
        echo "  start   - Start both MCP servers"
        echo "  stop    - Stop both MCP servers"
        echo "  status  - Check server status"
        echo "  restart - Restart both MCP servers"
        exit 1
        ;;
esac 