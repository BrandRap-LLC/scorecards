import pymssql
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv('.env.local')

# Database connection parameters
server = '54.245.209.65'
port = 1433
database = 'aggregated_reporting'
username = 'supabase'
password = 'R#8kZ2w$tE1Q'

def examine_tables():
    try:
        # Connect to the database
        conn = pymssql.connect(
            server=server,
            port=port,
            user=username,
            password=password,
            database=database
        )
        cursor = conn.cursor(as_dict=True)
        
        print("Connected to MSSQL")
        
        # Examine paid_ads table
        print("\n=== PAID_ADS TABLE ===")
        
        # Get column information
        cursor.execute("""
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE,
                COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'paid_ads'
            ORDER BY ORDINAL_POSITION
        """)
        
        columns = cursor.fetchall()
        print("\nColumns:")
        for col in columns:
            length = f"({col['CHARACTER_MAXIMUM_LENGTH']})" if col['CHARACTER_MAXIMUM_LENGTH'] else ""
            nullable = "NULL" if col['IS_NULLABLE'] == 'YES' else "NOT NULL"
            print(f"  {col['COLUMN_NAME']}: {col['DATA_TYPE']}{length} {nullable}")
        
        # Get row count
        cursor.execute("SELECT COUNT(*) as count FROM paid_ads")
        count = cursor.fetchone()
        print(f"\nTotal rows: {count['count']}")
        
        # Get sample data
        cursor.execute("SELECT TOP 5 * FROM paid_ads")
        sample_data = cursor.fetchall()
        print("\nSample data:")
        print(json.dumps(sample_data, indent=2, default=str))
        
        # Examine seo_channels table
        print("\n\n=== SEO_CHANNELS TABLE ===")
        
        # Get column information
        cursor.execute("""
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE,
                COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'seo_channels'
            ORDER BY ORDINAL_POSITION
        """)
        
        seo_columns = cursor.fetchall()
        print("\nColumns:")
        for col in seo_columns:
            length = f"({col['CHARACTER_MAXIMUM_LENGTH']})" if col['CHARACTER_MAXIMUM_LENGTH'] else ""
            nullable = "NULL" if col['IS_NULLABLE'] == 'YES' else "NOT NULL"
            print(f"  {col['COLUMN_NAME']}: {col['DATA_TYPE']}{length} {nullable}")
        
        # Get row count
        cursor.execute("SELECT COUNT(*) as count FROM seo_channels")
        seo_count = cursor.fetchone()
        print(f"\nTotal rows: {seo_count['count']}")
        
        # Get sample data
        cursor.execute("SELECT TOP 5 * FROM seo_channels")
        seo_sample_data = cursor.fetchall()
        print("\nSample data:")
        print(json.dumps(seo_sample_data, indent=2, default=str))
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    examine_tables()