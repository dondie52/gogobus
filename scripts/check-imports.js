#!/usr/bin/env node

/**
 * Import Checker Script
 * 
 * This script checks if any files are importing JavaScript files that have TypeScript versions.
 * Helps identify which imports need to be updated during TypeScript migration.
 * 
 * Usage:
 *   node scripts/check-imports.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Recursively find all files in a directory
 */
function findFiles(dir, extensions = []) {
  const files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
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
    // Skip errors
  }
  
  return files;
}

/**
 * Check if a TypeScript version exists for a JavaScript file
 */
function hasTypeScriptVersion(jsFile) {
  const ext = path.extname(jsFile);
  const baseName = path.basename(jsFile, ext);
  const dir = path.dirname(jsFile);
  
  const tsExtensions = ext === '.jsx' ? ['tsx'] : ['ts', 'tsx'];
  
  for (const tsExt of tsExtensions) {
    const tsFile = path.join(dir, `${baseName}.${tsExt}`);
    if (fs.existsSync(tsFile)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Extract imports from file content
 */
function extractImports(content) {
  const imports = [];
  
  // Match various import patterns
  const patterns = [
    // ES6 imports: import ... from './file'
    /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    // require: require('./file')
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // Dynamic imports: import('./file')
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
  }
  
  return imports;
}

/**
 * Resolve import path to actual file
 */
function resolveImport(importPath, fromFile) {
  // Skip external packages
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null;
  }
  
  const dir = path.dirname(fromFile);
  let resolved = path.resolve(dir, importPath);
  
  // Try with .js extension
  if (!fs.existsSync(resolved)) {
    resolved = `${resolved}.js`;
  }
  
  // Try with .jsx extension
  if (!fs.existsSync(resolved)) {
    resolved = `${resolved}x`;
  }
  
  // Try without extension (directory/index)
  if (!fs.existsSync(resolved)) {
    resolved = path.resolve(dir, importPath, 'index.js');
  }
  
  if (fs.existsSync(resolved)) {
    return resolved;
  }
  
  return null;
}

function main() {
  console.log('🔍 Checking for imports of JavaScript files with TypeScript versions...\n');
  
  const allFiles = [
    ...findFiles(ROOT_DIR, ['js', 'jsx', 'ts', 'tsx', 'json'])
  ];
  
  const issues = [];
  
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const imports = extractImports(content);
      
      for (const importPath of imports) {
        const resolved = resolveImport(importPath, file);
        
        if (resolved && hasTypeScriptVersion(resolved)) {
          const relativeFile = path.relative(ROOT_DIR, file);
          const relativeImport = path.relative(ROOT_DIR, resolved);
          
          issues.push({
            file: relativeFile,
            import: importPath,
            jsFile: relativeImport,
            line: content.substring(0, content.indexOf(importPath)).split('\n').length
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  if (issues.length === 0) {
    console.log('✅ No issues found! All imports are using TypeScript files.\n');
    return;
  }
  
  console.log(`Found ${issues.length} import(s) that need updating:\n`);
  
  // Group by file
  const byFile = {};
  for (const issue of issues) {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  }
  
  for (const [file, fileIssues] of Object.entries(byFile)) {
    console.log(`📄 ${file}`);
    for (const issue of fileIssues) {
      console.log(`   Line ~${issue.line}: ${issue.import}`);
      console.log(`   → Should import TypeScript version instead of ${issue.jsFile}`);
    }
    console.log('');
  }
  
  console.log('💡 Update these imports to use .ts/.tsx extensions (or remove extension).\n');
}

main();
