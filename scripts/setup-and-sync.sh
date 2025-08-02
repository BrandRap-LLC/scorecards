#!/bin/bash

# Setup and Sync Script for Scorecards
# This script automates the database setup and data sync process

set -e  # Exit on error

echo "🚀 Scorecards Setup and Sync Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please ensure .env.local exists with your database credentials"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Function to execute SQL in Supabase
execute_supabase_sql() {
    local sql_file=$1
    echo ""
    echo -e "${YELLOW}📝 To execute $sql_file:${NC}"
    echo "1. Go to: https://igzswopyyggvelncjmuh.supabase.co/project/igzswopyyggvelncjmuh/sql"
    echo "2. Copy and paste the contents of $sql_file"
    echo "3. Click 'Run' to execute"
    echo ""
    echo "Press Enter when completed..."
    read
}

# Main menu
while true; do
    echo ""
    echo "Choose an option:"
    echo "1) Setup fresh database (reset everything)"
    echo "2) Check current database state"
    echo "3) Run data sync from MSSQL"
    echo "4) Full setup (reset + sync)"
    echo "5) Exit"
    echo ""
    read -p "Enter choice [1-5]: " choice

    case $choice in
        1)
            echo -e "${YELLOW}🔄 Resetting database...${NC}"
            execute_supabase_sql "sql/reset_tables.sql"
            echo -e "${GREEN}✅ Database reset complete${NC}"
            ;;
        
        2)
            echo -e "${YELLOW}🔍 Checking database state...${NC}"
            execute_supabase_sql "sql/check_data.sql"
            ;;
        
        3)
            echo -e "${YELLOW}🔄 Running data sync from MSSQL...${NC}"
            
            # Check if MSSQL_SERVER is set
            if grep -q "MSSQL_SERVER=your_mssql_server_address" .env.local; then
                echo -e "${RED}❌ Error: MSSQL_SERVER not configured in .env.local${NC}"
                echo "Please update MSSQL_SERVER in .env.local with your actual server address"
                exit 1
            fi
            
            # Run the sync
            node scripts/sync-mssql-to-supabase.js
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Data sync completed successfully${NC}"
            else
                echo -e "${RED}❌ Data sync failed${NC}"
                echo "Check the error messages above for details"
            fi
            ;;
        
        4)
            echo -e "${YELLOW}🚀 Running full setup...${NC}"
            
            # Reset database
            echo "Step 1: Reset database"
            execute_supabase_sql "sql/reset_tables.sql"
            
            # Run sync
            echo "Step 2: Sync data from MSSQL"
            node scripts/sync-mssql-to-supabase.js
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Full setup completed successfully${NC}"
                echo ""
                echo "You can now run the application:"
                echo "  npm run dev"
                echo ""
                echo "Then open: http://localhost:3000"
            else
                echo -e "${RED}❌ Setup failed during sync${NC}"
            fi
            ;;
        
        5)
            echo "Exiting..."
            exit 0
            ;;
        
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
done