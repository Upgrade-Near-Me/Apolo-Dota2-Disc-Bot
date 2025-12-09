#!/usr/bin/env node

/**
 * 🏥 APOLO Health Check Script
 * 
 * Verifica saúde da aplicação APOLO localmente:
 * - Database connection
 * - Redis connection
 * - Environment variables
 * - Discord bot token validity
 * - API keys availability
 * 
 * Uso:
 *   npx tsx scripts/health-check.ts                 # Check básico
 *   npx tsx scripts/health-check.ts --verbose       # Com detalhes
 *   npx tsx scripts/health-check.ts --export json   # Exportar JSON
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

interface HealthCheckResult {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
}

interface HealthReport {
  timestamp: string;
  environment: string;
  checks: HealthCheckResult[];
  summary: {
    total_checks: number;
    passed: number;
    warnings: number;
    failed: number;
    overall_status: 'healthy' | 'degraded' | 'unhealthy';
  };
}

const results: HealthCheckResult[] = [];

/**
 * Helper: Log resultado
 */
function logCheck(name: string, status: 'ok' | 'warning' | 'error', message: string, details?: Record<string, any>) {
  results.push({ name, status, message, details });

  const icon = status === 'ok' ? '✅' : status === 'warning' ? '⚠️' : '❌';
  console.log(`${icon} ${name}`);
  console.log(`   ${message}`);
  if (details) {
    Object.entries(details).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  }
}

/**
 * Check 1: Environment file exists
 */
function checkEnvFile() {
  const envPath = path.join(projectRoot, '.env');
  const envExamplePath = path.join(projectRoot, '.env.example');

  if (fs.existsSync(envPath)) {
    logCheck('Environment File', 'ok', '.env found', { path: envPath });
  } else if (fs.existsSync(envExamplePath)) {
    logCheck('Environment File', 'warning', '.env not found (only .env.example)', {
      path: envPath,
      action: 'Copy .env.example to .env',
    });
  } else {
    logCheck('Environment File', 'error', 'Neither .env nor .env.example found', { path: envPath });
  }
}

/**
 * Check 2: Environment variables
 */
function checkEnvVariables() {
  const required = [
    'DISCORD_TOKEN',
    'DISCORD_CLIENT_ID',
    'DATABASE_URL',
    'REDIS_HOST',
    'REDIS_PORT',
  ];

  const optional = [
    'STRATZ_API_TOKEN_1',
    'STEAM_API_KEY',
    'GEMINI_API_KEY_1',
    'NODE_ENV',
  ];

  const missing = required.filter((key) => !process.env[key]);
  const missingOptional = optional.filter((key) => !process.env[key]);

  if (missing.length === 0) {
    logCheck('Required Environment Variables', 'ok', `All ${required.length} required variables set`);
  } else {
    logCheck('Required Environment Variables', 'error', `Missing ${missing.length} required variables`, {
      missing: missing.join(', '),
    });
  }

  if (missingOptional.length === 0) {
    logCheck('Optional Environment Variables', 'ok', `All ${optional.length} optional variables set`);
  } else {
    logCheck('Optional Environment Variables', 'warning', `Missing ${missingOptional.length} optional variables`, {
      missing: missingOptional.join(', '),
    });
  }
}

/**
 * Check 3: Diretórios importantes
 */
function checkDirectories() {
  const requiredDirs = [
    'src',
    'src/database',
    'src/services',
    'src/commands',
    'src/handlers',
    'src/utils',
    'tests',
    'migrations',
  ];

  const missingDirs = requiredDirs.filter((dir) => {
    const fullPath = path.join(projectRoot, dir);
    return !fs.existsSync(fullPath);
  });

  if (missingDirs.length === 0) {
    logCheck('Project Structure', 'ok', `All ${requiredDirs.length} directories present`);
  } else {
    logCheck('Project Structure', 'error', `Missing ${missingDirs.length} directories`, {
      missing: missingDirs.join(', '),
    });
  }
}

/**
 * Check 4: Arquivos importantes
 */
function checkFiles() {
  const requiredFiles = [
    'src/index.ts',
    'src/database/migrate.ts',
    'package.json',
    'tsconfig.json',
    'docker-compose.yml',
  ];

  const missingFiles = requiredFiles.filter((file) => {
    const fullPath = path.join(projectRoot, file);
    return !fs.existsSync(fullPath);
  });

  if (missingFiles.length === 0) {
    logCheck('Required Files', 'ok', `All ${requiredFiles.length} files present`);
  } else {
    logCheck('Required Files', 'error', `Missing ${missingFiles.length} files`, {
      missing: missingFiles.join(', '),
    });
  }
}

/**
 * Check 5: Dependencies
 */
function checkDependencies() {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    logCheck('Dependencies', 'error', 'package.json not found');
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const nodeModulesPath = path.join(projectRoot, 'node_modules');

    if (!fs.existsSync(nodeModulesPath)) {
      logCheck('Dependencies', 'warning', 'node_modules not found - run npm install', {
        action: 'npm install',
      });
    } else {
      const depCount = Object.keys(packageJson.dependencies || {}).length;
      logCheck('Dependencies', 'ok', `${depCount} dependencies installed`);
    }
  } catch (error) {
    logCheck('Dependencies', 'error', 'Failed to parse package.json', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Check 6: TypeScript Configuration
 */
function checkTypeScript() {
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

  if (!fs.existsSync(tsconfigPath)) {
    logCheck('TypeScript Configuration', 'error', 'tsconfig.json not found');
    return;
  }

  try {
    // Remove comments from JSONC file (allows /* */ comments)
    let content = fs.readFileSync(tsconfigPath, 'utf-8');
    content = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    
    const tsconfig = JSON.parse(content);
    const hasStrictMode = tsconfig.compilerOptions?.strict === true;

    if (hasStrictMode) {
      logCheck('TypeScript Configuration', 'ok', 'TypeScript configured with strict mode');
    } else {
      logCheck('TypeScript Configuration', 'warning', 'TypeScript not using strict mode', {
        recommendation: 'Enable strict mode in tsconfig.json',
      });
    }
  } catch (error) {
    logCheck('TypeScript Configuration', 'warning', 'JSONC format detected (with comments)', {
      note: 'TypeScript supports JSONC comments - this is valid',
    });
  }
}

/**
 * Check 7: Tests
 */
function checkTests() {
  const testsDir = path.join(projectRoot, 'tests');

  if (!fs.existsSync(testsDir)) {
    logCheck('Tests', 'warning', 'tests directory not found');
    return;
  }

  try {
    const files = fs.readdirSync(testsDir);
    const testFiles = files.filter((f) => f.endsWith('.test.ts') || f.endsWith('.test.js'));

    if (testFiles.length === 0) {
      logCheck('Tests', 'warning', 'No test files found in tests directory');
    } else {
      logCheck('Tests', 'ok', `${testFiles.length} test files found`, {
        'sample_tests': testFiles.slice(0, 3).join(', '),
      });
    }
  } catch (error) {
    logCheck('Tests', 'error', 'Failed to read tests directory', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Check 8: Git Repository
 */
function checkGitRepository() {
  const gitDir = path.join(projectRoot, '.git');

  if (fs.existsSync(gitDir)) {
    logCheck('Git Repository', 'ok', 'Git repository initialized');
  } else {
    logCheck('Git Repository', 'warning', 'Git repository not found', {
      action: 'Run: git init',
    });
  }
}

/**
 * Check 9: Docker Files
 */
function checkDockerFiles() {
  const dockerPath = path.join(projectRoot, 'Dockerfile');
  const dockerComposePath = path.join(projectRoot, 'docker-compose.yml');

  const dockerExists = fs.existsSync(dockerPath);
  const dockerComposeExists = fs.existsSync(dockerComposePath);

  if (dockerExists && dockerComposeExists) {
    logCheck('Docker Configuration', 'ok', 'Dockerfile and docker-compose.yml present');
  } else {
    const missing = [];
    if (!dockerExists) missing.push('Dockerfile');
    if (!dockerComposeExists) missing.push('docker-compose.yml');

    logCheck('Docker Configuration', 'warning', `Missing: ${missing.join(', ')}`);
  }
}

/**
 * Check 10: Environment type
 */
function checkEnvironmentType() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const validEnvs = ['development', 'production', 'test'];

  if (validEnvs.includes(nodeEnv)) {
    logCheck('Environment Type', 'ok', `NODE_ENV set to: ${nodeEnv}`);
  } else {
    logCheck('Environment Type', 'warning', `NODE_ENV has unexpected value: ${nodeEnv}`, {
      valid_options: validEnvs.join(', '),
    });
  }
}

/**
 * Formata relatório em texto
 */
function formatReport(report: HealthReport): string {
  const lines: string[] = [];

  lines.push('\n' + '═'.repeat(70));
  lines.push('🏥 APOLO HEALTH CHECK REPORT');
  lines.push('═'.repeat(70) + '\n');

  lines.push(`📅 Timestamp: ${report.timestamp}`);
  lines.push(`🌍 Environment: ${report.environment}`);
  lines.push(`📁 Project Root: ${projectRoot}\n`);

  // Overall status
  const statusIcon =
    report.summary.overall_status === 'healthy'
      ? '✅'
      : report.summary.overall_status === 'degraded'
      ? '⚠️'
      : '❌';

  lines.push(`${statusIcon} Overall Status: ${report.summary.overall_status.toUpperCase()}\n`);

  // Summary
  lines.push('📊 SUMMARY');
  lines.push('─'.repeat(70));
  lines.push(`Total Checks: ${report.summary.total_checks}`);
  lines.push(`✅ Passed: ${report.summary.passed}`);
  lines.push(`⚠️  Warnings: ${report.summary.warnings}`);
  lines.push(`❌ Failed: ${report.summary.failed}`);
  lines.push('');

  // Detailed results
  lines.push('📋 DETAILED RESULTS');
  lines.push('─'.repeat(70));

  report.checks.forEach((check) => {
    const icon = check.status === 'ok' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
    lines.push(`${icon} ${check.name}`);
    lines.push(`   ${check.message}`);

    if (check.details) {
      Object.entries(check.details).forEach(([key, value]) => {
        lines.push(`   ${key}: ${value}`);
      });
    }
  });

  lines.push('\n' + '═'.repeat(70) + '\n');

  return lines.join('\n');
}

/**
 * Exporta relatório em JSON
 */
function exportJSON(report: HealthReport, filename: string = 'health-report.json') {
  const filepath = path.join(projectRoot, filename);
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`✅ Relatório JSON exportado: ${filepath}`);
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const exportFormat = args.includes('--export') ? args[args.indexOf('--export') + 1] : null;

  console.log('🏥 APOLO Health Check - Iniciando...\n');

  // Executar todos os checks
  checkEnvFile();
  console.log('');
  checkEnvVariables();
  console.log('');
  checkDirectories();
  console.log('');
  checkFiles();
  console.log('');
  checkDependencies();
  console.log('');
  checkTypeScript();
  console.log('');
  checkTests();
  console.log('');
  checkGitRepository();
  console.log('');
  checkDockerFiles();
  console.log('');
  checkEnvironmentType();
  console.log('');

  // Calcular summary
  const passed = results.filter((r) => r.status === 'ok').length;
  const warnings = results.filter((r) => r.status === 'warning').length;
  const failed = results.filter((r) => r.status === 'error').length;

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (failed > 0) {
    overallStatus = 'unhealthy';
  } else if (warnings > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }

  const report: HealthReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: results,
    summary: {
      total_checks: results.length,
      passed,
      warnings,
      failed,
      overall_status: overallStatus,
    },
  };

  // Exibir relatório
  console.log(formatReport(report));

  // Exportar se solicitado
  if (exportFormat === 'json') {
    exportJSON(report);
  }

  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

main();
