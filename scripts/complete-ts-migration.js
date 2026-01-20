#!/usr/bin/env node

/**
 * Complete TypeScript Migration Script
 * 
 * This script detects and removes duplicate JavaScript files when TypeScript versions exist.
 * It helps complete TypeScript migrations by ensuring only .ts/.tsx files remain.
 * 
 * Usage:
 *   node scripts/complete-ts-migration.js [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --verbose    Show detailed information about each file
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const EXTENSIONS = {
  js: ['ts', 'tsx'],
  jsx: ['tsx']
};

// Command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');

/**
 * Recursively find all files in a directory
 */
function findFiles(dir, extensions = []) {
  const files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules, .git, and other common ignore directories
      if (entry.isDirectory()) {
        if (['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
          continue;
        }
        files.push(...findFiles(fullPath, extensions));
      } else if (entry.isFile()) {
        if (extensions.length === 0 || extensions.some(ext => entry.name.endsWith(`.${ext}`))) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Check if a TypeScript version exists for a JavaScript file
 */
function findTypeScriptVersion(jsFile) {
  const ext = path.extname(jsFile);
  const baseName = path.basename(jsFile, ext);
  const dir = path.dirname(jsFile);
  
  // Check for corresponding TypeScript files
  const tsExtensions = EXTENSIONS[ext.slice(1)] || [];
  
  for (const tsExt of tsExtensions) {
    const tsFile = path.join(dir, `${baseName}.${tsExt}`);
    if (fs.existsSync(tsFile)) {
      return tsFile;
    }
  }
  
  return null;
}

/**
 * Check if a file is imported anywhere
 */
function isFileImported(filePath, allFiles) {
  const fileName = path.basename(filePath);
  const baseName = path.basename(filePath, path.extname(filePath));
  
  // Check if file is imported (without extension or with .js extension)
  const importPatterns = [
    new RegExp(`from ['"]\\.?/?.*${baseName}['"]`, 'g'),
    new RegExp(`import.*['"]\\.?/?.*${baseName}['"]`, 'g'),
    new RegExp(`require\\(['"]\\.?/?.*${baseName}['"]\\)`, 'g'),
    new RegExp(`['"]\\.?/?.*${baseName}\\.js['"]`, 'g')
  ];
  
  for (const file of allFiles) {
    if (file === filePath) continue;
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of importPatterns) {
        if (pattern.test(content)) {
          if (VERBOSE) {
            console.log(`  ⚠️  Found import in: ${path.relative(ROOT_DIR, file)}`);
          }
          return true;
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return false;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning for duplicate JavaScript/TypeScript files...\n');
  
  if (DRY_RUN) {
    console.log('🔶 DRY RUN MODE - No files will be deleted\n');
  }
  
  // Find all JavaScript files
  const jsFiles = [
    ...findFiles(ROOT_DIR, ['js']),
    ...findFiles(ROOT_DIR, ['jsx'])
  ];
  
  // Find all TypeScript files
  const tsFiles = [
    ...findFiles(ROOT_DIR, ['ts']),
    ...findFiles(ROOT_DIR, ['tsx'])
  ];
  
  // Find all files for import checking
  const allFiles = [...jsFiles, ...tsFiles];
  
  const duplicates = [];
  const warnings = [];
  
  // Check each JavaScript file for TypeScript counterpart
  for (const jsFile of jsFiles) {
    const tsVersion = findTypeScriptVersion(jsFile);
    
    if (tsVersion) {
      const relativeJs = path.relative(ROOT_DIR, jsFile);
      const relativeTs = path.relative(ROOT_DIR, tsVersion);
      
      // Check if JS file is still imported
      const isImported = isFileImported(jsFile, allFiles);
      
      duplicates.push({
        jsFile,
        tsFile: tsVersion,
        relativeJs,
        relativeTs,
        isImported
      });
      
      if (isImported) {
        warnings.push({
          file: relativeJs,
          message: 'Still has imports - may need to update imports first'
        });
      }
    }
  }
  
  // Report findings
  if (duplicates.length === 0) {
    console.log('✅ No duplicate files found. Migration appears complete!\n');
    return;
  }
  
  console.log(`Found ${duplicates.length} duplicate file pair(s):\n`);
  
  for (const dup of duplicates) {
    console.log(`📄 ${dup.relativeJs}`);
    console.log(`   → TypeScript version: ${dup.relativeTs}`);
    if (dup.isImported) {
      console.log(`   ⚠️  WARNING: Still imported - update imports before deleting`);
    }
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    console.log('Some files are still imported. Update imports to use .ts/.tsx files first.\n');
    console.log('Files that need import updates:');
    for (const warning of warnings) {
      console.log(`  - ${warning.file}`);
    }
    console.log('');
  }
  
  // Delete files (if not dry run)
  if (!DRY_RUN) {
    console.log('🗑️  Deleting JavaScript files...\n');
    
    let deleted = 0;
    let skipped = 0;
    
    for (const dup of duplicates) {
      if (dup.isImported) {
        console.log(`⏭️  Skipping ${dup.relativeJs} (still imported)`);
        skipped++;
        continue;
      }
      
      try {
        fs.unlinkSync(dup.jsFile);
        console.log(`✅ Deleted ${dup.relativeJs}`);
        deleted++;
      } catch (error) {
        console.error(`❌ Error deleting ${dup.relativeJs}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Deleted: ${deleted}`);
    console.log(`   Skipped: ${skipped} (still imported)`);
    console.log(`   Total: ${duplicates.length}`);
    
    if (skipped > 0) {
      console.log(`\n⚠️  Update imports for skipped files, then run again.`);
    }
  } else {
    console.log('\n💡 Run without --dry-run to delete these files.');
  }
  
  console.log('\n✅ Migration check complete!\n');
}

// Run the script
main();
