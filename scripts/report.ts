#!/usr/bin/env node

/**
 * 📊 APOLO Consolidated Report Generator
 * 
 * Gera relatório consolidado com:
 * - Status do CI/CD (últimos runs)
 * - Status de saúde local (health check)
 * - Recomendações de ação
 * - Timeline de eventos recentes
 * 
 * Uso:
 *   npx tsx scripts/report.ts                       # Relatório completo
 *   npx tsx scripts/report.ts --quick               # Relatório rápido
 *   npx tsx scripts/report.ts --export html         # Exportar HTML
 *   npx tsx scripts/report.ts --export json         # Exportar JSON
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

interface ConsolidatedReport {
  timestamp: string;
  project: {
    name: string;
    repository: string;
    branch: string;
    path: string;
  };
  ci_status: {
    latest_run: any;
    recent_runs: any[];
    status_summary: string;
  };
  health_status: {
    environment_ok: boolean;
    dependencies_ok: boolean;
    structure_ok: boolean;
    overall_status: string;
  };
  recommendations: string[];
  events: Array<{
    timestamp: string;
    type: 'ci' | 'health' | 'action';
    title: string;
    description: string;
  }>;
}

const REPO_OWNER = 'Upgrade-Near-Me';
const REPO_NAME = 'Apolo-Dota2-Disc-Bot';
const BRANCH = 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Fetch from GitHub API
 */
function githubRequest(endpoint: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'APOLO-Reporter',
        ...(GITHUB_TOKEN && { 'Authorization': `Bearer ${GITHUB_TOKEN}` }),
      },
    };

    https
      .request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON Parse Error: ${e}`));
          }
        });
      })
      .on('error', reject)
      .end();
  });
}

/**
 * Get CI status
 */
async function getCIStatus() {
  try {
    const endpoint = `/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?branch=${BRANCH}&per_page=5`;
    const response = await githubRequest(endpoint);
    const runs = response.workflow_runs || [];

    return {
      latest_run: runs[0] || null,
      recent_runs: runs.slice(0, 5),
      status_summary:
        runs.length > 0
          ? `Latest: ${runs[0].conclusion || 'in_progress'}`
          : 'No runs found',
    };
  } catch (error) {
    console.error('⚠️  Could not fetch CI status:', error instanceof Error ? error.message : error);
    return {
      latest_run: null,
      recent_runs: [],
      status_summary: 'Could not fetch CI status',
    };
  }
}

/**
 * Check health status
 */
function getHealthStatus() {
  const checks = {
    environment_ok: !!(process.env.DISCORD_TOKEN && process.env.DATABASE_URL),
    dependencies_ok: fs.existsSync(path.join(projectRoot, 'node_modules')),
    structure_ok: fs.existsSync(path.join(projectRoot, 'src')) && fs.existsSync(path.join(projectRoot, 'tests')),
  };

  const overall_status =
    checks.environment_ok && checks.dependencies_ok && checks.structure_ok ? 'healthy' : 'degraded';

  return {
    ...checks,
    overall_status,
  };
}

/**
 * Generate recommendations
 */
function generateRecommendations(ciStatus: any, healthStatus: any): string[] {
  const recommendations: string[] = [];

  // CI recommendations
  if (!ciStatus.latest_run) {
    recommendations.push('⚠️  No CI runs found - check if GitHub Actions workflow is configured');
  } else if (ciStatus.latest_run.conclusion === 'failure') {
    recommendations.push('❌ Latest CI run failed - check workflow logs for errors');
  }

  // Health recommendations
  if (!healthStatus.environment_ok) {
    recommendations.push('⚠️  Environment variables incomplete - run "npm run setup:env"');
  }

  if (!healthStatus.dependencies_ok) {
    recommendations.push('📦 Dependencies not installed - run "npm install"');
  }

  if (!healthStatus.structure_ok) {
    recommendations.push('📁 Project structure incomplete - verify src/ and tests/ directories');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ No issues detected - system is healthy');
  }

  return recommendations;
}

/**
 * Generate events timeline
 */
function generateEvents(ciStatus: any): Array<{
  timestamp: string;
  type: 'ci' | 'health' | 'action';
  title: string;
  description: string;
}> {
  const events: Array<{
    timestamp: string;
    type: 'ci' | 'health' | 'action';
    title: string;
    description: string;
  }> = [];

  // Add CI events
  if (ciStatus.latest_run) {
    events.push({
      timestamp: ciStatus.latest_run.updated_at,
      type: 'ci',
      title: `Run #${ciStatus.latest_run.run_number}`,
      description: `${ciStatus.latest_run.conclusion} - ${ciStatus.latest_run.head_branch}`,
    });
  }

  ciStatus.recent_runs.slice(1, 3).forEach((run: any) => {
    events.push({
      timestamp: run.updated_at,
      type: 'ci',
      title: `Run #${run.run_number}`,
      description: `${run.conclusion} - ${run.head_branch}`,
    });
  });

  // Add recommended actions
  events.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    title: 'Monitoring Started',
    description: 'Consolidated report generation initiated',
  });

  // Sort by timestamp descending
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return events;
}

/**
 * Format text report
 */
function formatTextReport(report: ConsolidatedReport): string {
  const lines: string[] = [];

  lines.push('\n' + '═'.repeat(80));
  lines.push('📊 APOLO CONSOLIDATED REPORT');
  lines.push('═'.repeat(80) + '\n');

  lines.push(`📅 Generated: ${new Date(report.timestamp).toLocaleString('pt-BR')}`);
  lines.push(`📦 Project: ${report.project.name}`);
  lines.push(`📍 Repository: ${report.project.repository}/${report.project.branch}`);
  lines.push(`📁 Path: ${report.project.path}\n`);

  // CI Status
  lines.push('🔄 CI/CD STATUS');
  lines.push('─'.repeat(80));
  lines.push(`Status: ${report.ci_status.status_summary}`);

  if (report.ci_status.latest_run) {
    const statusIcon = report.ci_status.latest_run.conclusion === 'success' ? '✅' : '❌';
    lines.push(
      `${statusIcon} Latest: Run #${report.ci_status.latest_run.run_number} - ${report.ci_status.latest_run.conclusion}`
    );
    lines.push(`Created: ${new Date(report.ci_status.latest_run.created_at).toLocaleString('pt-BR')}`);
    lines.push(`Link: ${report.ci_status.latest_run.html_url}`);
  }
  lines.push('');

  // Health Status
  lines.push('🏥 HEALTH STATUS');
  lines.push('─'.repeat(80));
  lines.push(`Overall: ${report.health_status.overall_status}`);
  lines.push(`✅ Environment: ${report.health_status.environment_ok ? 'OK' : 'MISSING'}`);
  lines.push(`✅ Dependencies: ${report.health_status.dependencies_ok ? 'INSTALLED' : 'MISSING'}`);
  lines.push(`✅ Structure: ${report.health_status.structure_ok ? 'OK' : 'INCOMPLETE'}`);
  lines.push('');

  // Recommendations
  lines.push('💡 RECOMMENDATIONS');
  lines.push('─'.repeat(80));
  report.recommendations.forEach((rec) => {
    lines.push(`  ${rec}`);
  });
  lines.push('');

  // Recent Events
  lines.push('📈 RECENT EVENTS (Last 5)');
  lines.push('─'.repeat(80));
  report.events.slice(0, 5).forEach((event) => {
    const typeIcon = event.type === 'ci' ? '🔄' : event.type === 'health' ? '🏥' : '⚡';
    lines.push(`${typeIcon} [${new Date(event.timestamp).toLocaleTimeString('pt-BR')}] ${event.title}`);
    lines.push(`   ${event.description}`);
  });

  lines.push('\n' + '═'.repeat(80) + '\n');

  return lines.join('\n');
}

/**
 * Export JSON report
 */
function exportJSON(report: ConsolidatedReport, filename: string = 'apolo-report.json') {
  const filepath = path.join(projectRoot, filename);
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`✅ JSON report exported: ${filepath}`);
}

/**
 * Export HTML report
 */
function exportHTML(report: ConsolidatedReport, filename: string = 'apolo-report.html') {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APOLO Consolidated Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; color: white; margin-bottom: 40px; }
    .header h1 { font-size: 48px; margin-bottom: 10px; }
    .header p { font-size: 18px; opacity: 0.9; }
    .card { background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); margin-bottom: 20px; overflow: hidden; }
    .card-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }
    .card-header h2 { font-size: 24px; }
    .card-body { padding: 20px; }
    .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .status-item { padding: 15px; background: #f6f8fa; border-radius: 8px; border-left: 4px solid #667eea; }
    .status-item h3 { font-size: 12px; color: #666; margin-bottom: 5px; }
    .status-item .value { font-size: 20px; font-weight: bold; color: #333; }
    .success { color: #28a745; }
    .failure { color: #dc3545; }
    .warning { color: #ffc107; }
    .event-list { list-style: none; }
    .event-item { padding: 15px; border-left: 3px solid #667eea; margin-bottom: 10px; background: #f9f9f9; border-radius: 4px; }
    .event-time { font-size: 12px; color: #999; }
    .event-title { font-weight: bold; margin: 5px 0; }
    .event-desc { font-size: 14px; color: #666; }
    .recommendation { padding: 12px; margin-bottom: 10px; border-left: 3px solid #ffc107; background: #fffbf0; border-radius: 4px; }
    .recommendation.success { border-left-color: #28a745; background: #f0f8f4; }
    .recommendation.error { border-left-color: #dc3545; background: #fcf0f0; }
    .footer { text-align: center; color: white; margin-top: 40px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 APOLO Consolidated Report</h1>
      <p>Generated on ${new Date(report.timestamp).toLocaleString('pt-BR')}</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>🔄 CI/CD Status</h2>
      </div>
      <div class="card-body">
        <div class="status-grid">
          <div class="status-item">
            <h3>Latest Run</h3>
            <div class="value ${report.ci_status.latest_run?.conclusion === 'success' ? 'success' : 'failure'}">
              ${report.ci_status.latest_run ? `#${report.ci_status.latest_run.run_number}` : 'No runs'}
            </div>
          </div>
          <div class="status-item">
            <h3>Status</h3>
            <div class="value">${report.ci_status.status_summary}</div>
          </div>
        </div>
        ${
          report.ci_status.latest_run
            ? `
        <p><strong>Branch:</strong> ${report.ci_status.latest_run.head_branch}</p>
        <p><strong>Created:</strong> ${new Date(report.ci_status.latest_run.created_at).toLocaleString('pt-BR')}</p>
        <p><a href="${report.ci_status.latest_run.html_url}" target="_blank">View on GitHub →</a></p>
        `
            : ''
        }
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>🏥 Health Status</h2>
      </div>
      <div class="card-body">
        <div class="status-grid">
          <div class="status-item ${report.health_status.environment_ok ? 'success' : 'failure'}">
            <h3>Environment</h3>
            <div class="value">${report.health_status.environment_ok ? '✅ OK' : '❌ Missing'}</div>
          </div>
          <div class="status-item ${report.health_status.dependencies_ok ? 'success' : 'failure'}">
            <h3>Dependencies</h3>
            <div class="value">${report.health_status.dependencies_ok ? '✅ OK' : '❌ Missing'}</div>
          </div>
          <div class="status-item ${report.health_status.structure_ok ? 'success' : 'failure'}">
            <h3>Structure</h3>
            <div class="value">${report.health_status.structure_ok ? '✅ OK' : '❌ Incomplete'}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>💡 Recommendations</h2>
      </div>
      <div class="card-body">
        ${report.recommendations
          .map((rec) => {
            const isSuccess = rec.includes('✅');
            const isError = rec.includes('❌');
            const className = isSuccess ? 'success' : isError ? 'error' : '';
            return `<div class="recommendation ${className}">${rec}</div>`;
          })
          .join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>📈 Recent Events</h2>
      </div>
      <div class="card-body">
        <ul class="event-list">
          ${report.events
            .slice(0, 10)
            .map(
              (event) => `
          <li class="event-item">
            <div class="event-time">${new Date(event.timestamp).toLocaleString('pt-BR')}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-desc">${event.description}</div>
          </li>
          `
            )
            .join('')}
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>Generated by APOLO CI/CD Monitoring System | ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
  `;

  const filepath = path.join(projectRoot, filename);
  fs.writeFileSync(filepath, html);
  console.log(`✅ HTML report exported: ${filepath}`);
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const quick = args.includes('--quick');
  const exportFormat = args.includes('--export') ? args[args.indexOf('--export') + 1] : null;

  try {
    console.log('📊 Generating APOLO Consolidated Report...\n');

    const [ciStatus, healthStatus] = await Promise.all([
      getCIStatus(),
      Promise.resolve(getHealthStatus()),
    ]);

    const recommendations = generateRecommendations(ciStatus, healthStatus);
    const events = generateEvents(ciStatus);

    const report: ConsolidatedReport = {
      timestamp: new Date().toISOString(),
      project: {
        name: 'APOLO Dota 2 Bot',
        repository: `${REPO_OWNER}/${REPO_NAME}`,
        branch: BRANCH,
        path: projectRoot,
      },
      ci_status: ciStatus,
      health_status: healthStatus,
      recommendations,
      events,
    };

    // Display text report
    console.log(formatTextReport(report));

    // Export if requested
    if (exportFormat === 'json') {
      exportJSON(report);
    } else if (exportFormat === 'html') {
      exportHTML(report);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
