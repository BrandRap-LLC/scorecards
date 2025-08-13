#!/usr/bin/env python3
import pymssql
from datetime import datetime

# Connection details
server = '54.245.209.65'
database = 'aggregated_reporting'
username = 'supabase'
password = 'R#8kZ2w$tE1Q'

print("Connecting to MSSQL database...")
conn = pymssql.connect(server=server, user=username, password=password, database=database)
cursor = conn.cursor()

# Check executive_report_new_week structure and data
print("\n=== EXECUTIVE_REPORT_NEW_WEEK ===")

# Get column information
cursor.execute("""
    SELECT COLUMN_NAME, DATA_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'executive_report_new_week'
    ORDER BY ORDINAL_POSITION
""")
columns = cursor.fetchall()
print("\nTable columns:")
for col in columns:
    print(f"  - {col[0]} ({col[1]})")

# Find date-related columns
date_cols = [col[0] for col in columns if 'week' in col[0].lower() or 'date' in col[0].lower()]
print(f"\nDate-related columns: {date_cols}")

# Get row count
cursor.execute("SELECT COUNT(*) FROM executive_report_new_week")
total_rows = cursor.fetchone()[0]
print(f"\nTotal rows: {total_rows}")

# Check for the actual date column - try different possibilities
for col in ['week', 'week_ending', 'week_start', 'date']:
    try:
        cursor.execute(f"""
            SELECT 
                MIN({col}) as earliest,
                MAX({col}) as latest,
                COUNT(DISTINCT {col}) as unique_dates
            FROM executive_report_new_week
        """)
        result = cursor.fetchone()
        if result:
            print(f"\n{col} column:")
            print(f"  Earliest: {result[0]}")
            print(f"  Latest: {result[1]}")
            print(f"  Unique dates: {result[2]}")
            
            # Check for data after August 2025
            cursor.execute(f"""
                SELECT COUNT(*) as rows_after_aug_2025
                FROM executive_report_new_week
                WHERE {col} > '2025-08-01'
            """)
            after_aug = cursor.fetchone()
            if after_aug and after_aug[0] > 0:
                print(f"  ⚠️  NEW DATA: {after_aug[0]} rows after August 2025")
                
                # Get sample of new data
                cursor.execute(f"""
                    SELECT TOP 5 clinic, {col}, traffic_source
                    FROM executive_report_new_week
                    WHERE {col} > '2025-08-01'
                    ORDER BY {col} DESC
                """)
                samples = cursor.fetchall()
                print(f"  Sample of new data:")
                for sample in samples:
                    print(f"    - {sample[0]}, {sample[1]}, {sample[2]}")
            else:
                print(f"  ✓ No data after August 2025")
            break
    except Exception as e:
        continue

# Check other tables with potential newer data
print("\n\n=== CHECKING OTHER TABLES FOR NEWER DATA ===")

tables_to_check = [
    ('marketing_score_card_daily', 'date'),
    ('score_card_keyword_summary', 'date'),
    ('paid_ads', 'month'),
    ('paid_ads_week', 'week'),
    ('seo_channels', 'month'),
    ('seo_channels_week', 'week'),
    ('lead_conversion_rate', 'month')
]

for table_name, date_col in tables_to_check:
    print(f"\n{table_name}:")
    try:
        cursor.execute(f"""
            SELECT 
                COUNT(*) as total_rows,
                MIN({date_col}) as earliest,
                MAX({date_col}) as latest
            FROM {table_name}
        """)
        result = cursor.fetchone()
        if result:
            print(f"  Total rows: {result[0]}")
            print(f"  Date range: {result[1]} to {result[2]}")
            
            # Check if latest date is after August 2025
            if result[2] and str(result[2]) > '2025-08-01':
                print(f"  ⚠️  HAS NEWER DATA: Latest date is {result[2]}")
    except Exception as e:
        print(f"  Error: {str(e)}")

cursor.close()
conn.close()
print("\nDone!")