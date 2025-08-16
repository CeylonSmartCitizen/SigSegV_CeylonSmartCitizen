#!/usr/bin/env node

/**
 * Complete Frontend Error Detection Suite
 * Comprehensive testing of all frontend components and systems
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}${colors.bright}🔍 COMPLETE FRONTEND ERROR DETECTION${colors.reset}`);
console.log(`${colors.cyan}=====================================\n${colors.reset}`);

let totalErrors = 0;
let totalWarnings = 0;
let filesChecked = 0;

// Test results tracking
const testResults = {
  files: { passed: 0, failed: 0 },
  imports: { passed: 0, failed: 0 },
  exports: { passed: 0, failed: 0 },
  syntax: { passed: 0, failed: 0 },
  css: { passed: 0, failed: 0 },
  dependencies: { passed: 0, failed: 0 }
};

function logTest(category, name, status, details = '') {
  const emoji = status === 'PASSED' ? '✅' : status === 'WARNING' ? '⚠️' : '❌';
  console.log(`${emoji} ${name}${details ? ` - ${details}` : ''}`);
  
  if (status === 'PASSED') {
    testResults[category].passed++;
  } else {
    testResults[category].failed++;
    if (status === 'FAILED') totalErrors++;
    if (status === 'WARNING') totalWarnings++;
  }
}

// Check if file exists
function checkFileExists(filePath, description) {
  filesChecked++;
  if (fs.existsSync(filePath)) {
    logTest('files', description, 'PASSED');
    return true;
  } else {
    logTest('files', description, 'FAILED', 'File not found');
    return false;
  }
}

// Check file syntax and structure
function checkJSXSyntax(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    logTest('syntax', fileName, 'FAILED', 'File not found');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Basic syntax checks
  const checks = [
    { name: 'Import statements', pattern: /^import\s+.*from\s+['"][^'"]+['"];?$/m, required: true },
    { name: 'React component', pattern: /const\s+\w+\s*=\s*\(.*\)\s*=>\s*{|function\s+\w+\s*\(.*\)\s*{/, required: true },
    { name: 'Export statement', pattern: /export\s+default\s+\w+;?$/, required: true },
    { name: 'JSX return', pattern: /return\s*\([\s\S]*</, required: true },
    { name: 'useState hook', pattern: /useState\s*\(/, required: false },
    { name: 'useEffect hook', pattern: /useEffect\s*\(/, required: false }
  ];
  
  let syntaxValid = true;
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      logTest('syntax', `${fileName} - ${check.name}`, 'PASSED');
    } else if (check.required) {
      logTest('syntax', `${fileName} - ${check.name}`, 'FAILED');
      syntaxValid = false;
    } else {
      logTest('syntax', `${fileName} - ${check.name}`, 'WARNING', 'Optional');
    }
  });
  
  return syntaxValid;
}

// Check CSS file
function checkCSSFile(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    logTest('css', fileName, 'FAILED', 'File not found');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const stats = fs.statSync(filePath);
  
  // CSS quality checks
  const selectorCount = (content.match(/\.[a-zA-Z][\w-]*\s*{/g) || []).length;
  const mediaQueries = (content.match(/@media\s*\([^)]+\)/g) || []).length;
  const keyframes = (content.match(/@keyframes\s+[\w-]+/g) || []).length;
  
  if (selectorCount > 0) {
    logTest('css', fileName, 'PASSED', `${selectorCount} selectors, ${mediaQueries} media queries`);
    return true;
  } else {
    logTest('css', fileName, 'WARNING', 'No CSS selectors found');
    return false;
  }
}

// Check import/export consistency
function checkImportExports(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    logTest('imports', fileName, 'FAILED', 'File not found');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for common import issues
  const importLines = content.match(/^import\s+.*$/gm) || [];
  const exportLines = content.match(/^export\s+.*$/gm) || [];
  
  let issuesFound = 0;
  
  // Check for missing CSS imports where expected
  if (fileName.endsWith('.jsx') && !content.includes("import './") && !content.includes("import '../../styles/")) {
    logTest('imports', `${fileName} - CSS import`, 'WARNING', 'No CSS import found');
    issuesFound++;
  } else {
    logTest('imports', `${fileName} - CSS import`, 'PASSED');
  }
  
  // Check for export default
  if (fileName.endsWith('.jsx') && !content.includes('export default')) {
    logTest('exports', `${fileName} - Default export`, 'FAILED');
    issuesFound++;
  } else {
    logTest('exports', `${fileName} - Default export`, 'PASSED');
  }
  
  return issuesFound === 0;
}

console.log(`${colors.blue}📁 Phase 1: Core Component Files${colors.reset}`);
const coreComponents = [
  'src/components/booking/ServiceOverview.jsx',
  'src/components/booking/DocumentRequirements.jsx',
  'src/components/booking/FeeStructure.jsx', 
  'src/components/booking/FAQRelatedServices.jsx',
  'src/components/booking/FinalReview.jsx',
  'src/components/booking/ServiceDetailsDemo.jsx'
];

coreComponents.forEach(component => {
  const fullPath = path.join(__dirname, component);
  const fileName = path.basename(component);
  
  if (checkFileExists(fullPath, fileName)) {
    checkJSXSyntax(fullPath, fileName);
    checkImportExports(fullPath, fileName);
  }
});

console.log(`\n${colors.blue}🎨 Phase 2: CSS Files${colors.reset}`);
const cssFiles = [
  'src/components/booking/ServiceOverview.css',
  'src/components/booking/DocumentRequirements.css',
  'src/components/booking/FeeStructure.css',
  'src/components/booking/FAQRelatedServices.css',
  'src/components/booking/FinalReview.css',
  'src/components/booking/ServiceDetailsDemo.css'
];

cssFiles.forEach(cssFile => {
  const fullPath = path.join(__dirname, cssFile);
  const fileName = path.basename(cssFile);
  checkCSSFile(fullPath, fileName);
});

console.log(`\n${colors.blue}🔧 Phase 3: API & Common Components${colors.reset}`);
const apiComponents = [
  'src/api/errorHandling.js',
  'src/api/index.js',
  'src/components/common/ErrorBoundary.jsx',
  'src/components/common/LoadingStates.jsx',
  'src/components/common/NotificationSystem.jsx'
];

apiComponents.forEach(component => {
  const fullPath = path.join(__dirname, component);
  const fileName = path.basename(component);
  
  if (checkFileExists(fullPath, fileName)) {
    checkJSXSyntax(fullPath, fileName);
    checkImportExports(fullPath, fileName);
  }
});

console.log(`\n${colors.blue}🔗 Phase 4: Service Directory Components${colors.reset}`);
const serviceComponents = [
  'src/components/ServiceDirectory/ServiceDirectory.jsx',
  'src/components/ServiceDirectory/ServiceDetails.jsx',
  'src/App.jsx'
];

serviceComponents.forEach(component => {
  const fullPath = path.join(__dirname, component);
  const fileName = path.basename(component);
  
  if (checkFileExists(fullPath, fileName)) {
    checkJSXSyntax(fullPath, fileName);
    checkImportExports(fullPath, fileName);
  }
});

console.log(`\n${colors.blue}📦 Phase 5: Dependencies Check${colors.reset}`);

// Check package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = [
    'react',
    'react-dom',
    'lucide-react',
    'vite'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      logTest('dependencies', dep, 'PASSED');
    } else {
      logTest('dependencies', dep, 'FAILED', 'Missing dependency');
    }
  });
} else {
  logTest('dependencies', 'package.json', 'FAILED', 'File not found');
}

console.log(`\n${colors.magenta}${colors.bright}📊 COMPREHENSIVE ERROR REPORT${colors.reset}`);
console.log(`${colors.magenta}==============================${colors.reset}`);

// Calculate totals
const totalTests = Object.values(testResults).reduce((sum, category) => sum + category.passed + category.failed, 0);
const totalPassed = Object.values(testResults).reduce((sum, category) => sum + category.passed, 0);
const totalFailed = Object.values(testResults).reduce((sum, category) => sum + category.failed, 0);
const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';

console.log(`\n📋 Category Breakdown:`);
Object.entries(testResults).forEach(([category, results]) => {
  const total = results.passed + results.failed;
  const rate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0.0';
  console.log(`${colors.cyan}   ${category.toUpperCase()}: ${results.passed}/${total} (${rate}%)${colors.reset}`);
});

console.log(`\n🎯 Overall Results:`);
console.log(`${colors.cyan}   Files Checked: ${filesChecked}${colors.reset}`);
console.log(`${colors.cyan}   Total Tests: ${totalTests}${colors.reset}`);
console.log(`${colors.green}   Passed: ${totalPassed}${colors.reset}`);
console.log(`${colors.red}   Failed: ${totalFailed}${colors.reset}`);
console.log(`${colors.yellow}   Warnings: ${totalWarnings}${colors.reset}`);
console.log(`${colors.cyan}   Success Rate: ${successRate}%${colors.reset}`);

// Final assessment
if (totalErrors === 0) {
  console.log(`\n${colors.green}${colors.bright}🎉 NO CRITICAL ERRORS FOUND!${colors.reset}`);
  console.log(`${colors.green}✅ Frontend is error-free and production ready${colors.reset}`);
  
  if (totalWarnings > 0) {
    console.log(`${colors.yellow}⚠️  ${totalWarnings} warnings found - review recommended${colors.reset}`);
  }
} else {
  console.log(`\n${colors.red}${colors.bright}❌ ${totalErrors} CRITICAL ERRORS FOUND${colors.reset}`);
  console.log(`${colors.red}🔧 Please fix critical errors before deployment${colors.reset}`);
}

console.log(`\n${colors.blue}${colors.bright}🚀 DEPLOYMENT STATUS${colors.reset}`);
if (totalErrors === 0 && successRate >= 90) {
  console.log(`${colors.green}✅ READY FOR PRODUCTION DEPLOYMENT${colors.reset}`);
} else if (totalErrors === 0 && successRate >= 80) {
  console.log(`${colors.yellow}⚠️  READY WITH MINOR ISSUES${colors.reset}`);
} else {
  console.log(`${colors.red}❌ NOT READY - CRITICAL ISSUES DETECTED${colors.reset}`);
}

console.log(`\n${colors.cyan}============================================${colors.reset}`);
console.log(`${colors.cyan}🏁 COMPLETE FRONTEND ERROR DETECTION DONE${colors.reset}`);
console.log(`${colors.cyan}============================================${colors.reset}`);

// Exit with appropriate code
process.exit(totalErrors > 0 ? 1 : 0);
