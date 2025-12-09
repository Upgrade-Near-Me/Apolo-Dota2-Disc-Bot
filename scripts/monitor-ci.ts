#!/usr/bin/env node

/**
 * 🔍 CI/CD Monitoring Script
 * 
 * Monitora GitHub Actions CI/CD pipeline em tempo real
 * Gera relatórios com status, duração, e logs de erros
 * 
 * Uso:
 *   npx tsx scripts/monitor-ci.ts                    # Status atual
 *   npx tsx scripts/monitor-ci.ts --watch            # Monitorar em tempo real
 *   npx tsx scripts/monitor-ci.ts --export json      # Exportar relatório JSON
 *   npx tsx scripts/monitor-ci.ts --export html      # Gerar relatório HTML
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

interface WorkflowRun {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | null;
  created_at: string;
  updated_at: string;
  run_number: number;
  head_branch: string;
  html_url: string;
  jobs_url: string;
}

interface JobStep {
  name: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | null;
  started_at: string;
  completed_at: string;
  number: number;
}

interface Job {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | null;
  started_at: string;
  completed_at: string;
  steps: JobStep[];
  html_url: string;
}

interface CIReport {
  timestamp: string;
  repository: string;
  branch: string;
  latestRun: WorkflowRun | null;
  allRuns: WorkflowRun[];
  jobDetails: Job[];
  summary: {
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    current_status: string;
    last_failure_time: string | null;
    consecutive_failures: number;
    average_run_time: number;
  };
}

const REPO_OWNER = 'Upgrade-Near-Me';
const REPO_NAME = 'Apolo-Dota2-Disc-Bot';
const BRANCH = 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Faz requisição HTTPS para GitHub API
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
        'User-Agent': 'APOLO-CI-Monitor',
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
 * Busca últimos runs do CI
 */
async function getWorkflowRuns(limit: number = 10): Promise<WorkflowRun[]> {
  try {
    const endpoint = `/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?branch=${BRANCH}&per_page=${limit}`;
    const response = await githubRequest(endpoint);
    return response.workflow_runs || [];
  } catch (error) {
    console.error('❌ Erro ao buscar workflow runs:', error);
    throw error;
  }
}

/**
 * Busca detalhes dos jobs de um run
 */
async function getJobDetails(runId: number): Promise<Job[]> {
  try {
    const endpoint = `/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}/jobs`;
    const response = await githubRequest(endpoint);
    return response.jobs || [];
  } catch (error) {
    console.error(`❌ Erro ao buscar jobs do run ${runId}:`, error);
    return [];
  }
}

/**
 * Calcula estatísticas dos runs
 */
function calculateStats(runs: WorkflowRun[]): CIReport['summary'] {
  const completed = runs.filter((r) => r.status === 'completed');
  const successful = completed.filter((r) => r.conclusion === 'success');
  const failed = completed.filter((r) => r.conclusion === 'failure');

  // Últimas falhas consecutivas
  let consecutiveFailures = 0;
  for (const run of runs) {
    if (run.conclusion === 'failure') {
      consecutiveFailures++;
    } else {
      break;
    }
  }

  // Tempo médio de execução
  const durations = completed.map((r) => {
    const start = new Date(r.created_at).getTime();
    const end = new Date(r.updated_at).getTime();
    return (end - start) / 1000 / 60; // em minutos
  });
  const avgRunTime = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  const lastFailure = failed.length > 0 && failed[0] ? failed[0].updated_at : null;

  return {
    total_runs: runs.length,
    successful_runs: successful.length,
    failed_runs: failed.length,
    current_status: runs[0]?.conclusion || 'unknown',
    last_failure_time: lastFailure,
    consecutive_failures: consecutiveFailures,
    average_run_time: Math.round(avgRunTime * 100) / 100,
  };
}

/**
 * Formata relatório em texto legível
 */
function formatReport(report: CIReport): string {
  const lines: string[] = [];

  lines.push('\n' + '='.repeat(70));
  lines.push('[CI] APOLO CI/CD MONITOR REPORT');
  lines.push('='.repeat(70) + '\n');

  lines.push(`[TS] Timestamp: ${report.timestamp}`);
  lines.push(`[REPO] Repository: ${report.repository}`);
  lines.push(`[BRANCH] Branch: ${report.branch}\n`);

  // Status atual
  const latestRun = report.latestRun;
  if (latestRun) {
    const statusIcon = latestRun.conclusion === 'success' ? '[OK]' : latestRun.conclusion === 'failure' ? '[FAIL]' : '[WAIT]';
    lines.push(`${statusIcon} Latest Run: #${latestRun.run_number}`);
    lines.push(`   Status: ${latestRun.status}`);
    lines.push(`   Conclusion: ${latestRun.conclusion || 'In Progress'}`);
    lines.push(`   Created: ${new Date(latestRun.created_at).toLocaleString('pt-BR')}`);
    lines.push(`   Link: ${latestRun.html_url}\n`);
  }

  // Resumo
  const summary = report.summary;
  lines.push('[SUMMARY] CI Statistics');
  lines.push('-'.repeat(70));
  lines.push(`Total Runs: ${summary.total_runs}`);
  lines.push(`[OK] Successful: ${summary.successful_runs} (${((summary.successful_runs / summary.total_runs) * 100).toFixed(1)}%)`);
  lines.push(`[FAIL] Failed: ${summary.failed_runs} (${((summary.failed_runs / summary.total_runs) * 100).toFixed(1)}%)`);
  lines.push(`[TIME] Average Duration: ${summary.average_run_time} min`);
  lines.push(`[ERR] Consecutive Failures: ${summary.consecutive_failures}`);

  if (summary.last_failure_time) {
    lines.push(`[WARN] Last Failure: ${new Date(summary.last_failure_time).toLocaleString('pt-BR')}`);
  }
  lines.push('');

  // Últimos 5 runs
  if (report.allRuns.length > 0) {
    lines.push('[RECENT] Last 5 Runs');
    lines.push('-'.repeat(70));
    report.allRuns.slice(0, 5).forEach((run) => {
      const statusIcon = run.conclusion === 'success' ? '[OK]' : run.conclusion === 'failure' ? '[FAIL]' : '[WAIT]';
      const duration =
        (new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 1000 / 60;
      lines.push(
        `${statusIcon} #${run.run_number} | ${run.conclusion || 'In Progress'} | ${duration.toFixed(1)}min | ${run.head_branch}`
      );
    });
    lines.push('');
  }

  // Job details do último run
  if (report.jobDetails.length > 0) {
    lines.push('[JOBS] Latest Run - Job Details');
    lines.push('-'.repeat(70));
    report.jobDetails.forEach((job) => {
      const statusIcon = job.conclusion === 'success' ? '[OK]' : job.conclusion === 'failure' ? '[FAIL]' : '[WAIT]';
      lines.push(`${statusIcon} ${job.name}`);
      lines.push(`   Status: ${job.status} | Conclusion: ${job.conclusion || 'In Progress'}`);

      if (job.steps.length > 0) {
        const failedSteps = job.steps.filter((s) => s.conclusion === 'failure');
        if (failedSteps.length > 0) {
          lines.push(`   [FAIL] Failed Steps:`);
          failedSteps.forEach((step) => {
            lines.push(`      - ${step.name}`);
          });
        }
      }
      lines.push('');
    });
  }

  lines.push('='.repeat(70) + '\n');

  return lines.join('\n');
}

/**
 * Exporta relatório em JSON
 */
function exportJSON(report: CIReport, filename: string = 'ci-report.json') {
  const filepath = path.join(process.cwd(), filename);
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`[OK] JSON report exported: ${filepath}`);
}

/**
 * Exporta relatório em HTML
 */
function exportHTML(report: CIReport, filename: string = 'ci-report.html') {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APOLO CI/CD Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0d1117; color: #e6edf3; padding: 20px; }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { color: #58a6ff; margin-bottom: 20px; border-bottom: 2px solid #30363d; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: #161b22; padding: 15px; border-radius: 6px; border-left: 4px solid #58a6ff; }
    .stat-card h3 { font-size: 12px; color: #8b949e; margin-bottom: 5px; }
    .stat-card .value { font-size: 24px; font-weight: bold; }
    .success { color: #3fb950; }
    .failure { color: #f85149; }
    .in-progress { color: #d29922; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #161b22; border-radius: 6px; overflow: hidden; }
    th { background: #0d1117; padding: 12px; text-align: left; font-size: 12px; color: #8b949e; border-bottom: 1px solid #30363d; }
    td { padding: 10px 12px; border-bottom: 1px solid #30363d; }
    tr:hover { background: #0d1117; }
    .status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
    .success-badge { background: #1f6feb; color: #3fb950; }
    .failure-badge { background: #1f6feb; color: #f85149; }
    .inprogress-badge { background: #1f6feb; color: #d29922; }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>[CI] APOLO CI/CD Monitor Report</h1>
    
    <div class="summary">
      <div class="stat-card">
        <h3>Total Runs</h3>
        <div class="value">${report.summary.total_runs}</div>
      </div>
      <div class="stat-card">
        <h3>Success Rate</h3>
        <div class="value success">${((report.summary.successful_runs / report.summary.total_runs) * 100).toFixed(1)}%</div>
      </div>
      <div class="stat-card">
        <h3>Consecutive Failures</h3>
        <div class="value ${report.summary.consecutive_failures > 0 ? 'failure' : 'success'}">${report.summary.consecutive_failures}</div>
      </div>
      <div class="stat-card">
        <h3>Avg Duration</h3>
        <div class="value">${report.summary.average_run_time}min</div>
      </div>
    </div>

    <h2 style="color: #58a6ff; margin-top: 30px;">Recent Runs</h2>
    <table>
      <thead>
        <tr>
          <th>Run #</th>
          <th>Status</th>
          <th>Branch</th>
          <th>Duration</th>
          <th>Created</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        ${report.allRuns
          .slice(0, 10)
          .map((run) => {
            const duration =
              (new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 1000 / 60;
            const statusBadge =
              run.conclusion === 'success'
                ? `<span class="status-badge success-badge">[OK] Success</span>`
                : run.conclusion === 'failure'
                ? `<span class="status-badge failure-badge">[FAIL] Failure</span>`
                : `<span class="status-badge inprogress-badge">[WAIT] In Progress</span>`;

            return `
            <tr>
              <td>#${run.run_number}</td>
              <td>${statusBadge}</td>
              <td>${run.head_branch}</td>
              <td>${duration.toFixed(1)}min</td>
              <td>${new Date(run.created_at).toLocaleString('pt-BR')}</td>
              <td><a href="${run.html_url}" target="_blank">View →</a></td>
            </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>

    <p style="margin-top: 40px; color: #8b949e; font-size: 12px;">
      Report generated: ${report.timestamp}
    </p>
  </div>
</body>
</html>
  `;

  const filepath = path.join(process.cwd(), filename);
  fs.writeFileSync(filepath, html);
  console.log(`[OK] HTML report exported: ${filepath}`);
}

/**
 * Monitora CI em tempo real
 */
async function watchMode() {
  console.log('[WATCH] Watch Mode Activated - Monitoring CI every 30s...\n');
  console.log('Press Ctrl+C to exit\n');

  setInterval(async () => {
    try {
      const runs = await getWorkflowRuns(10);
      const latestRun = runs[0];

      if (latestRun) {
        const statusIcon =
          latestRun.conclusion === 'success'
            ? '[OK]'
            : latestRun.conclusion === 'failure'
            ? '[FAIL]'
            : '[WAIT]';

        const time = new Date().toLocaleTimeString('pt-BR');
        console.clear();
        console.log(`\n[${time}] ${statusIcon} Run #${latestRun.run_number} | ${latestRun.conclusion || 'In Progress'}\n`);
      }
    } catch (error) {
      console.error('[ERR] Error fetching status:', error instanceof Error ? error.message : error);
    }
  }, 30000);
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const watch = args.includes('--watch');
  const exportFormat = args.includes('--export') ? args[args.indexOf('--export') + 1] : null;

  try {
    console.log('[CI] APOLO CI/CD Monitor - Starting...\n');

    if (watch) {
      await watchMode();
      return;
    }

    const runs = await getWorkflowRuns(20);
    const latestRun = runs[0];

    let jobDetails: Job[] = [];
    if (latestRun) {
      jobDetails = await getJobDetails(latestRun.id);
    }

    const report: CIReport = {
      timestamp: new Date().toISOString(),
      repository: `${REPO_OWNER}/${REPO_NAME}`,
      branch: BRANCH,
      latestRun: latestRun || null,
      allRuns: runs,
      jobDetails,
      summary: calculateStats(runs),
    };

    // Exibir relatório em texto
    console.log(formatReport(report));

    // Exportar se solicitado
    if (exportFormat === 'json') {
      exportJSON(report);
    } else if (exportFormat === 'html') {
      exportHTML(report);
    }
  } catch (error) {
    console.error('[ERR] Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
