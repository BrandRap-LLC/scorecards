const sql = require('mssql');

const config = {
    server: '54.245.209.65',
    user: 'supabase',
    password: 'R#8kZ2w$tE1Q',
    database: 'aggregated_reporting',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        port: 1433
    }
};

async function listAllTables() {
    try {
        console.log('🔍 Listing All MSSQL Tables\n');
        
        await sql.connect(config);
        
        // Query to get all tables with row counts
        const tablesQuery = `
            SELECT 
                t.TABLE_SCHEMA,
                t.TABLE_NAME,
                p.rows AS ROW_COUNT
            FROM 
                INFORMATION_SCHEMA.TABLES t
                LEFT JOIN sys.tables st ON st.name = t.TABLE_NAME
                LEFT JOIN sys.partitions p ON p.object_id = st.object_id AND p.index_id IN (0, 1)
            WHERE 
                t.TABLE_TYPE = 'BASE TABLE'
            ORDER BY 
                t.TABLE_NAME;
        `;
        
        const result = await sql.query(tablesQuery);
        
        // Categorize tables
        const executiveTables = [];
        const scorecardTables = [];
        const otherTables = [];
        
        result.recordset.forEach(table => {
            const tableName = table.TABLE_NAME.toLowerCase();
            const tableInfo = {
                schema: table.TABLE_SCHEMA,
                name: table.TABLE_NAME,
                rowCount: table.ROW_COUNT || 0
            };
            
            if (tableName.includes('executive')) {
                executiveTables.push(tableInfo);
            } else if (tableName.includes('scorecard')) {
                scorecardTables.push(tableInfo);
            } else {
                otherTables.push(tableInfo);
            }
        });
        
        // Display results
        console.log('📊 Executive Tables:');
        console.log('===================');
        executiveTables.forEach(table => {
            console.log(`  ${table.schema}.${table.name} - ${table.rowCount.toLocaleString()} rows`);
        });
        
        console.log('\n📈 Scorecard Tables:');
        console.log('===================');
        if (scorecardTables.length === 0) {
            console.log('  No scorecard tables found');
        } else {
            scorecardTables.forEach(table => {
                console.log(`  ${table.schema}.${table.name} - ${table.rowCount.toLocaleString()} rows`);
            });
        }
        
        console.log('\n📁 Other Tables:');
        console.log('================');
        otherTables.forEach(table => {
            console.log(`  ${table.schema}.${table.name} - ${table.rowCount.toLocaleString()} rows`);
        });
        
        console.log('\n📊 Summary:');
        console.log('===========');
        console.log(`  Total tables: ${result.recordset.length}`);
        console.log(`  Executive tables: ${executiveTables.length}`);
        console.log(`  Scorecard tables: ${scorecardTables.length}`);
        console.log(`  Other tables: ${otherTables.length}`);
        
        // Get schema for executive and scorecard tables
        console.log('\n🔍 Table Schemas:');
        console.log('=================');
        
        const relevantTables = [...executiveTables, ...scorecardTables];
        
        for (const table of relevantTables) {
            console.log(`\n📋 ${table.schema}.${table.name}:`);
            console.log('─'.repeat(50));
            
            const schemaQuery = `
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    CHARACTER_MAXIMUM_LENGTH,
                    IS_NULLABLE,
                    COLUMN_DEFAULT
                FROM 
                    INFORMATION_SCHEMA.COLUMNS
                WHERE 
                    TABLE_SCHEMA = '${table.schema}' 
                    AND TABLE_NAME = '${table.name}'
                ORDER BY 
                    ORDINAL_POSITION;
            `;
            
            const schemaResult = await sql.query(schemaQuery);
            
            schemaResult.recordset.forEach(column => {
                let type = column.DATA_TYPE;
                if (column.CHARACTER_MAXIMUM_LENGTH) {
                    type += `(${column.CHARACTER_MAXIMUM_LENGTH})`;
                }
                const nullable = column.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
                const defaultVal = column.COLUMN_DEFAULT ? ` DEFAULT ${column.COLUMN_DEFAULT}` : '';
                
                console.log(`  ${column.COLUMN_NAME} - ${type} ${nullable}${defaultVal}`);
            });
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await sql.close();
    }
}

listAllTables();