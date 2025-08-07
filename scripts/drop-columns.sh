#!/bin/bash

# Script to drop columns from executive_monthly_reports table

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting column removal from executive_monthly_reports table...${NC}\n"

# Load environment variables
source .env.local

# Database connection string
DB_CONNECTION="postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres"

# Array of columns to remove
COLUMNS=(
    "avg_appointment_rev"
    "avg_estimated_ltv_6m"
    "avg_ltv"
    "ltv"
)

# Function to execute SQL
execute_sql() {
    local sql=$1
    echo -e "${BLUE}Executing: ${sql}${NC}"
    psql "$DB_CONNECTION" -c "$sql"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Success${NC}\n"
        return 0
    else
        echo -e "${RED}❌ Failed${NC}\n"
        return 1
    fi
}

# Drop each column
for column in "${COLUMNS[@]}"; do
    echo -e "${BLUE}Dropping column: ${column}...${NC}"
    execute_sql "ALTER TABLE executive_monthly_reports DROP COLUMN IF EXISTS ${column};"
done

echo -e "${GREEN}Column removal process completed!${NC}"

# Verify the table structure
echo -e "\n${BLUE}Current table structure:${NC}"
psql "$DB_CONNECTION" -c "\d executive_monthly_reports"