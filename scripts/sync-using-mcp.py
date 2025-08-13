#!/usr/bin/env python3
"""
Sync MSSQL to Supabase using MCP servers
This script uses the MCP servers which have the correct credentials
"""

import subprocess
import json
import sys
from datetime import datetime

def run_mcp_query(server, tool, params):
    """Run a query through MCP server"""
    cmd = [
        'npx', '@anthropic/mcp-cli', 'query',
        '--server', server,
        '--tool', tool,
        '--params', json.dumps(params)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error running MCP query: {e}")
        print(f"Stderr: {e.stderr}")
        return None

def sync_executive_monthly():
    """Sync executive monthly reports"""
    print("\n📊 1. Syncing Executive Monthly Reports...")
    
    # Get data from MSSQL
    mssql_result = run_mcp_query(
        'mssql',
        'query',
        {'query': 'SELECT * FROM executive_report_new_month ORDER BY month DESC, clinic, traffic_source'}
    )
    
    if not mssql_result:
        return {'success': False, 'error': 'Failed to fetch from MSSQL'}
    
    records = mssql_result.get('results', [])
    print(f"📥 Found {len(records)} records in MSSQL")
    
    # Clear existing data in Supabase
    delete_result = run_mcp_query(
        'supabase',
        'query',
        {'query': 'DELETE FROM executive_monthly_reports WHERE id > 0'}
    )
    print("🗑️  Cleared existing data in Supabase")
    
    # Insert data in batches
    batch_size = 50
    inserted = 0
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        
        # Transform the data
        values = []
        for row in batch:
            values.append(f"""(
                '{row['clinic']}',
                '{row['month']}',
                '{row['traffic_source']}',
                {row.get('impressions') or 'NULL'},
                {row.get('visits') or 'NULL'},
                {row.get('spend') or 'NULL'},
                {row.get('ltv') or 'NULL'},
                {row.get('estimated_ltv_6m') or 'NULL'},
                {row.get('avg_ltv') or 'NULL'},
                {row.get('total_roas') or 'NULL'},
                {row.get('leads') or 'NULL'},
                {row.get('new_leads') or 'NULL'},
                {row.get('returning_leads') or 'NULL'},
                {row.get('%total_conversion') or 'NULL'},
                {row.get('%new_conversion') or 'NULL'},
                {row.get('%returning_conversion') or 'NULL'},
                {row.get('%total_conversion') or 'NULL'},
                {row.get('cac_total') or 'NULL'},
                {row.get('cac_new') or 'NULL'},
                {row.get('total_appointments') or 'NULL'},
                {row.get('new_appointments') or 'NULL'},
                {row.get('returning_appointments') or 'NULL'},
                {row.get('online_booking') or 'NULL'},
                {row.get('total_conversations') or 'NULL'},
                {row.get('new_conversations') or 'NULL'},
                {row.get('returning_conversations') or 'NULL'},
                {row.get('total_estimated_revenue') or 'NULL'},
                {row.get('new_estimated_revenue') or 'NULL'},
                {row.get('total_roas') or 'NULL'},
                {row.get('new_roas') or 'NULL'}
            )""")
        
        insert_query = f"""
        INSERT INTO executive_monthly_reports (
            clinic, month, traffic_source, impressions, visits, spend,
            ltv, estimated_ltv_6m, avg_ltv, roas, leads, new_leads,
            returning_leads, conversion_rate, new_conversion, returning_conversion,
            total_conversion, cac_total, cac_new, appointments, new_appointments,
            returning_appointments, online_booking, conversations, new_conversations,
            returning_conversations, total_estimated_revenue, new_estimated_revenue,
            total_roas, new_roas
        ) VALUES {','.join(values)}
        """
        
        insert_result = run_mcp_query('supabase', 'query', {'query': insert_query})
        if insert_result:
            inserted += len(batch)
            print(f"\r✅ Progress: {inserted}/{len(records)} records", end='', flush=True)
    
    print(f"\n✅ Executive Monthly sync complete: {inserted} records")
    return {'success': True, 'records': inserted}

def main():
    """Main sync function"""
    print("🚀 Starting Database Sync using MCP Servers")
    print("=" * 45)
    
    start_time = datetime.now()
    
    # For now, just sync executive monthly as a test
    result = sync_executive_monthly()
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print(f"\n⏱️  Total time: {duration:.2f} seconds")
    
    if result['success']:
        print("✨ Sync completed successfully!")
    else:
        print(f"❌ Sync failed: {result.get('error', 'Unknown error')}")
        sys.exit(1)

if __name__ == "__main__":
    main()