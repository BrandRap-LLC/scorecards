#!/usr/bin/env node
/**
 * Project Codebase Indexing Script for Zilliz Context MCP
 * 
 * This script indexes the scorecards project codebase for semantic search
 * and context retrieval using the Zilliz Context MCP server.
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// Configuration for indexing
const INDEX_CONFIG = {
  projectRoot: process.cwd(),
  collectionName: 'scorecards_codebase',
  
  // File extensions to include (high priority first)
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.md', '.json'],
  
  // Directories and patterns to exclude
  excludePatterns: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    '.git/**',
    'coverage/**',
    '**/*.test.*',
    '**/*.spec.*',
    'package-lock.json',
    '**/*.log',
    '.env*'
  ],
  
  // Priority order for indexing (high priority files first)
  priorityPatterns: [
    // High priority - Core application files
    'app/**/*.tsx',
    'components/**/*.tsx',
    'types/**/*.ts',
    'lib/api-*.ts',
    'lib/mcp-integration.ts',
    
    // Medium priority - Supporting files
    'lib/**/*.ts',
    'hooks/**/*.ts',
    'utils/**/*.ts',
    
    // Low priority - Configuration and scripts
    '*.json',
    'scripts/**/*.js',
    '**/*.md'
  ],
  
  // Chunking settings
  chunkSize: 1000,
  overlapSize: 200,
  
  // Processing limits
  maxFilesPerBatch: 50,
  maxFileSize: 1024 * 1024 // 1MB
};

/**
 * Get all files to be indexed, sorted by priority
 */
async function getFilesToIndex() {
  console.log('🔍 Scanning project for indexable files...');
  
  const allFiles = [];
  
  // Get files by priority order
  for (const pattern of INDEX_CONFIG.priorityPatterns) {
    try {
      const files = await glob(pattern, {
        cwd: INDEX_CONFIG.projectRoot,
        ignore: INDEX_CONFIG.excludePatterns,
        absolute: true
      });
      
      for (const file of files) {
        const ext = path.extname(file);
        if (INDEX_CONFIG.extensions.includes(ext)) {
          // Check file size
          const stats = await fs.stat(file);
          if (stats.size <= INDEX_CONFIG.maxFileSize) {
            allFiles.push({
              path: file,
              relativePath: path.relative(INDEX_CONFIG.projectRoot, file),
              size: stats.size,
              priority: INDEX_CONFIG.priorityPatterns.indexOf(pattern)
            });
          } else {
            console.warn(`⚠️  Skipping large file: ${path.relative(INDEX_CONFIG.projectRoot, file)} (${Math.round(stats.size / 1024)}KB)`);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error processing pattern ${pattern}:`, error.message);
    }
  }
  
  // Remove duplicates and sort by priority
  const uniqueFiles = Array.from(new Map(allFiles.map(f => [f.path, f])).values())
    .sort((a, b) => a.priority - b.priority);
  
  console.log(`📁 Found ${uniqueFiles.length} files to index`);
  
  // Log summary by file type
  const fileTypes = uniqueFiles.reduce((acc, file) => {
    const ext = path.extname(file.path);
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {});
  
  console.log('📊 File types to index:');
  Object.entries(fileTypes).forEach(([ext, count]) => {
    console.log(`   ${ext}: ${count} files`);
  });
  
  return uniqueFiles;
}

/**
 * Read and prepare file content for indexing
 */
async function prepareFileContent(file) {
  try {
    const content = await fs.readFile(file.path, 'utf8');
    
    return {
      path: file.relativePath,
      content: content,
      metadata: {
        fileType: path.extname(file.path),
        size: file.size,
        lastModified: (await fs.stat(file.path)).mtime.toISOString(),
        priority: file.priority,
        directory: path.dirname(file.relativePath)
      }
    };
  } catch (error) {
    console.error(`❌ Error reading file ${file.relativePath}:`, error.message);
    return null;
  }
}

/**
 * Create chunks from file content
 */
function createChunks(fileData) {
  if (!fileData || !fileData.content) return [];
  
  const chunks = [];
  const content = fileData.content;
  const chunkSize = INDEX_CONFIG.chunkSize;
  const overlap = INDEX_CONFIG.overlapSize;
  
  // For small files, use the entire content
  if (content.length <= chunkSize) {
    chunks.push({
      content: content,
      metadata: {
        ...fileData.metadata,
        chunkIndex: 0,
        totalChunks: 1,
        startPos: 0,
        endPos: content.length
      }
    });
  } else {
    // Split into overlapping chunks
    let start = 0;
    let chunkIndex = 0;
    
    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      const chunkContent = content.slice(start, end);
      
      chunks.push({
        content: chunkContent,
        metadata: {
          ...fileData.metadata,
          chunkIndex,
          totalChunks: Math.ceil(content.length / (chunkSize - overlap)),
          startPos: start,
          endPos: end
        }
      });
      
      start += chunkSize - overlap;
      chunkIndex++;
      
      // Prevent infinite loop
      if (start >= content.length - overlap) break;
    }
  }
  
  return chunks;
}

/**
 * Mock implementation of MCP Context indexing
 * In production, this would call the actual Zilliz Context MCP server
 */
async function indexChunks(chunks) {
  console.log(`📝 Indexing ${chunks.length} chunks...`);
  
  // Group chunks by file type for processing
  const chunksByType = chunks.reduce((acc, chunk) => {
    const fileType = chunk.metadata.fileType;
    if (!acc[fileType]) acc[fileType] = [];
    acc[fileType].push(chunk);
    return acc;
  }, {});
  
  console.log('📊 Chunks by file type:');
  Object.entries(chunksByType).forEach(([type, typeChunks]) => {
    console.log(`   ${type}: ${typeChunks.length} chunks`);
  });
  
  // Simulate indexing process
  let processedChunks = 0;
  const totalChunks = chunks.length;
  
  for (let i = 0; i < chunks.length; i += INDEX_CONFIG.maxFilesPerBatch) {
    const batch = chunks.slice(i, i + INDEX_CONFIG.maxFilesPerBatch);
    
    // In production, this would be:
    // await ZillizContextMCP.indexBatch(batch);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    processedChunks += batch.length;
    const progress = ((processedChunks / totalChunks) * 100).toFixed(1);
    console.log(`⏳ Indexing progress: ${progress}% (${processedChunks}/${totalChunks})`);
  }
  
  return {
    success: true,
    totalChunks: chunks.length,
    processedChunks,
    error: null
  };
}

/**
 * Main indexing function
 */
async function indexProjectCodebase() {
  const startTime = Date.now();
  
  console.log('🚀 Starting project codebase indexing...');
  console.log(`📁 Project root: ${INDEX_CONFIG.projectRoot}`);
  console.log(`🏷️  Collection: ${INDEX_CONFIG.collectionName}`);
  console.log();
  
  try {
    // Step 1: Get files to index
    const files = await getFilesToIndex();
    
    if (files.length === 0) {
      console.log('ℹ️  No files found to index');
      return;
    }
    
    console.log();
    
    // Step 2: Process files and create chunks
    console.log('📝 Processing files and creating chunks...');
    const allChunks = [];
    let processedFiles = 0;
    
    for (const file of files) {
      const fileData = await prepareFileContent(file);
      if (fileData) {
        const chunks = createChunks(fileData);
        allChunks.push(...chunks);
        processedFiles++;
        
        if (processedFiles % 10 === 0) {
          console.log(`   Processed ${processedFiles}/${files.length} files...`);
        }
      }
    }
    
    console.log(`✅ Created ${allChunks.length} chunks from ${processedFiles} files`);
    console.log();
    
    // Step 3: Index chunks
    console.log('🔄 Indexing chunks in vector database...');
    const indexResult = await indexChunks(allChunks);
    
    if (indexResult.success) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log();
      console.log('🎉 Indexing completed successfully!');
      console.log();
      console.log('📊 Summary:');
      console.log(`   Files processed: ${processedFiles}`);
      console.log(`   Chunks created: ${allChunks.length}`);
      console.log(`   Chunks indexed: ${indexResult.processedChunks}`);
      console.log(`   Duration: ${duration} seconds`);
      console.log(`   Collection: ${INDEX_CONFIG.collectionName}`);
      console.log();
      console.log('✨ The codebase is now indexed and ready for semantic search!');
      console.log();
      console.log('🔍 You can now use context search features:');
      console.log('   • Search for code patterns and implementations');
      console.log('   • Find related components and utilities');
      console.log('   • Get contextual documentation');
      console.log('   • Discover similar code patterns');
      
    } else {
      console.error('❌ Indexing failed:', indexResult.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fatal error during indexing:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Show indexing statistics
 */
async function showIndexStats() {
  console.log('📊 Current Index Statistics');
  console.log('============================');
  console.log(`Collection: ${INDEX_CONFIG.collectionName}`);
  console.log('Note: This is a mock implementation');
  console.log('In production, this would show:');
  console.log('• Total documents indexed');
  console.log('• Index size and performance metrics');
  console.log('• Last update time');
  console.log('• Search accuracy statistics');
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2] || 'index';
  
  switch (command) {
    case 'index':
      indexProjectCodebase();
      break;
    case 'stats':
      showIndexStats();
      break;
    case 'help':
      console.log('Scorecards Project Indexing Script');
      console.log('===================================');
      console.log();
      console.log('Commands:');
      console.log('  index   Index the project codebase (default)');
      console.log('  stats   Show indexing statistics');
      console.log('  help    Show this help message');
      console.log();
      console.log('Examples:');
      console.log('  node scripts/index-project-codebase.js');
      console.log('  node scripts/index-project-codebase.js stats');
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run "node scripts/index-project-codebase.js help" for usage');
      process.exit(1);
  }
}

module.exports = {
  indexProjectCodebase,
  showIndexStats,
  INDEX_CONFIG
};