# 🔧 APOLO Monitoring & Reporting Scripts

Professional monitoring and reporting tools for APOLO CI/CD and health status.

## 📋 Overview

Three complementary scripts:

1. **`monitor-ci.ts`** - GitHub Actions CI/CD pipeline monitoring
2. **`health-check.ts`** - Local application health verification
3. **`report.ts`** - Consolidated status report with recommendations

## 🚀 Quick Start

### Monitor CI/CD Pipeline

```bash
# View latest CI status
npm run monitor:ci

# Watch in real-time (updates every 30 seconds)
npm run monitor:ci:watch

# Export reports (JSON + HTML)
npm run monitor:ci:export
```

### Health Check Local Setup

```bash
# Quick health check
npm run health:check

# Verbose with details
npm run health:check:verbose

# Export to JSON
npm run health:check:export
```

### Generate Consolidated Report

```bash
# Full report (CI + Health + Recommendations)
npm run report

# Quick version (no details)
npm run report:quick

# Export both JSON and HTML
npm run report:export
```

---

## 🔍 Monitor CI/CD (`monitor-ci.ts`)

Tracks GitHub Actions workflow runs and job details.

### Usage

```bash
npx tsx scripts/monitor-ci.ts                    # Current status
npx tsx scripts/monitor-ci.ts --watch            # Real-time monitoring
npx tsx scripts/monitor-ci.ts --export json      # Export JSON
npx tsx scripts/monitor-ci.ts --export html      # Export HTML
```

### Environment Variables

```bash
GITHUB_TOKEN=your_github_token  # Optional: for higher API rate limits
```

### Output Example

```
══════════════════════════════════════════════════════════════
🔍 APOLO CI/CD MONITOR REPORT
══════════════════════════════════════════════════════════════

📅 Timestamp: 2025-12-09T15:30:45.123Z
📦 Repository: Upgrade-Near-Me/Apolo-Dota2-Disc-Bot
🌿 Branch: main

✅ Latest Run: #42
   Status: completed
   Conclusion: success
   Created: 09/12/2025 12:30:45
   Link: https://github.com/.../actions/runs/12345

📊 SUMMARY
────────────────────────────────────────────────────────────
Total Runs: 20
✅ Successful: 18 (90.0%)
❌ Failed: 2 (10.0%)
⏱️  Average Duration: 4.50 min
🔴 Consecutive Failures: 0

📈 RECENT RUNS (Last 5)
────────────────────────────────────────────────────────────
✅ #42 | success | 4.2min | main
✅ #41 | success | 4.5min | main
✅ #40 | success | 4.1min | main
❌ #39 | failure | 2.3min | main
✅ #38 | success | 4.3min | main
```

### What It Checks

- ✅ Latest workflow run status
- ✅ Success rate (%)
- ✅ Failed runs tracking
- ✅ Average execution time
- ✅ Consecutive failures
- ✅ Individual job details and failed steps
- ✅ Last failure timestamp

---

## 🏥 Health Check (`health-check.ts`)

Validates local APOLO setup and configuration.

### Usage

```bash
npx tsx scripts/health-check.ts                  # Quick check
npx tsx scripts/health-check.ts --verbose        # Detailed output
npx tsx scripts/health-check.ts --export json    # Export JSON
```

### Output Example

```
🏥 APOLO HEALTH CHECK - Iniciando...

✅ Environment File
   .env found

✅ Required Environment Variables
   All 5 required variables set

⚠️  Optional Environment Variables
   Missing 2 optional variables
   missing: STEAM_API_KEY, LOG_LEVEL

✅ Project Structure
   All 8 directories present

✅ Required Files
   All 5 files present

✅ Dependencies
   142 dependencies installed

✅ TypeScript Configuration
   TypeScript configured with strict mode

✅ Tests
   11 test files found
   sample_tests: advancedButtons.test.ts, draftSimulator.test.ts, embedTheme.test.ts

✅ Git Repository
   Git repository initialized

✅ Docker Configuration
   Dockerfile and docker-compose.yml present

✅ Environment Type
   NODE_ENV set to: development

🏥 HEALTH CHECK REPORT
══════════════════════════════════════════════════════════════

✅ Overall Status: HEALTHY

📊 SUMMARY
────────────────────────────────────────────────────────────
Total Checks: 10
✅ Passed: 9
⚠️  Warnings: 1
❌ Failed: 0
```

### What It Checks

- ✅ `.env` file presence
- ✅ Required environment variables
- ✅ Optional environment variables
- ✅ Directory structure (src, tests, migrations, etc)
- ✅ Critical files (package.json, tsconfig.json, Dockerfile)
- ✅ Dependencies installation
- ✅ TypeScript configuration
- ✅ Test files count
- ✅ Git repository
- ✅ Docker files
- ✅ NODE_ENV validity

---

## 📊 Consolidated Report (`report.ts`)

Combines CI status + health check + automated recommendations.

### Usage

```bash
npx tsx scripts/report.ts                       # Full report
npx tsx scripts/report.ts --quick               # Quick summary
npx tsx scripts/report.ts --export json         # Export JSON
npx tsx scripts/report.ts --export html         # Export HTML
```

### Output Example (Text)

```
════════════════════════════════════════════════════════════════════════════
📊 APOLO CONSOLIDATED REPORT
════════════════════════════════════════════════════════════════════════════

📅 Generated: 09/12/2025 15:32:10
📦 Project: APOLO Dota 2 Bot
📍 Repository: Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/main
📁 Path: x:\UP PROJECT - Bots DISCORD\BOT DISC - APOLO DOTA2

🔄 CI/CD STATUS
────────────────────────────────────────────────────────────────────────────
Status: Latest: success
✅ Latest: Run #42 - success
Created: 09/12/2025 15:30:45
Link: https://github.com/.../actions/runs/12345

🏥 HEALTH STATUS
────────────────────────────────────────────────────────────────────────────
Overall: healthy
✅ Environment: OK
✅ Dependencies: INSTALLED
✅ Structure: OK

💡 RECOMMENDATIONS
────────────────────────────────────────────────────────────────────────────
  ✅ No issues detected - system is healthy

📈 RECENT EVENTS (Last 5)
────────────────────────────────────────────────────────────────────────────
🔄 [15:30:45] Run #42
   success - main
🔄 [15:25:20] Run #41
   success - main
⚡ [15:20:00] Monitoring Started
   Consolidated report generation initiated
```

### What It Includes

- 🔄 Latest CI run status
- 🏥 Health check summary
- 💡 Smart recommendations (based on CI + Health)
- 📈 Event timeline (recent actions)
- 🔗 Direct links to GitHub
- 📊 Success/failure rates
- ⏱️ Execution times

### Auto-Generated Recommendations

Based on actual status:

- ❌ "Latest CI run failed - check workflow logs"
- ⚠️  "Environment variables incomplete - run npm run setup:env"
- 📦 "Dependencies not installed - run npm install"
- 📁 "Project structure incomplete - verify src/ and tests/"
- ✅ "No issues detected - system is healthy"

---

## 📤 Export Formats

### JSON Export

Perfect for automation/CI integration:

```bash
npm run monitor:ci:export
npm run health:check:export
npm run report:export
```

Creates: `ci-report.json`, `health-report.json`, `apolo-report.json`

```json
{
  "timestamp": "2025-12-09T15:32:10.123Z",
  "summary": {
    "total_checks": 10,
    "passed": 9,
    "warnings": 1,
    "failed": 0,
    "overall_status": "healthy"
  },
  "checks": [...]
}
```

### HTML Export

Beautiful web-based reports:

```bash
npm run report:export
```

Creates: `apolo-report.html`

- 📊 Dashboard-style cards
- 📈 Status indicators
- 🎨 Professional styling
- 📱 Responsive design
- 🔗 Live GitHub links

Open in browser: `file:///path/to/apolo-report.html`

---

## 🔄 Watch Mode (Real-Time Monitoring)

Monitor CI in real-time with automatic updates:

```bash
npm run monitor:ci:watch
```

Updates every 30 seconds:
- Shows latest run number
- Status (success/failure/in-progress)
- Updates terminal in-place

Press `Ctrl+C` to exit.

---

## 🤖 Automation Examples

### GitHub Actions Integration

Add to `.github/workflows/monitoring.yml`:

```yaml
name: Monitor Deployment
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run report:export
      - uses: actions/upload-artifact@v3
        with:
          name: apolo-reports
          path: apolo-report.*
```

### Local Cron Job (Linux/macOS)

```bash
# Run health check every hour
0 * * * * cd /path/to/APOLO && npm run health:check >> health-check.log 2>&1

# Generate report every 6 hours
0 */6 * * * cd /path/to/APOLO && npm run report:export
```

### Windows Task Scheduler

```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "cd 'x:\path\to\APOLO'; npm run report:export"
Register-ScheduledTask -TaskName "APOLO-Monitor" -Action $action -Trigger (New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Hours 1) -At (Get-Date))
```

---

## 🐛 Troubleshooting

### "GITHUB_TOKEN not found"

Scripts work without token (lower rate limits):
- With token: 5,000 requests/hour
- Without token: 60 requests/hour

Set for higher limits:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
npm run monitor:ci
```

### "Environment variables incomplete"

Check `.env` file:

```bash
npm run health:check --verbose
```

Fix:

```bash
cp .env.example .env
# Edit .env with your tokens
npm run health:check
```

### "No CI runs found"

1. Verify repository is public or token has access
2. Check branch name matches `BRANCH` in script
3. Verify GitHub Actions workflow is configured

### Scripts not running

```bash
# Ensure tsx is installed
npm install

# Try with explicit node
npx tsx scripts/monitor-ci.ts
```

---

## 📚 Related Documentation

- [Setup Guide](../docs/setup/SETUP.md) - Local development setup
- [CI/CD Pipeline](.github/workflows/ci.yml) - GitHub Actions workflow
- [VPS Deployment](../docs/deployment/VPS_SHARED_INTEGRATION_GUIDE.md) - VPS integration

---

## 🎯 Best Practices

1. **Pre-Commit**: Run `npm run health:check` before committing
2. **Pre-Push**: Run `npm run report` to verify all systems
3. **CI Integration**: Add `npm run health:check:export` to workflow
4. **Monitoring**: Set up cron job for periodic `npm run report:export`
5. **Alerts**: Configure notifications based on report status

---

## 📝 Script Development

To add new checks:

1. Add function in relevant script
2. Call in main sequence
3. Format result with `logCheck()`
4. Update this README

Example:

```typescript
function checkCustom() {
  const status = someValidation();
  logCheck('Custom Check', status ? 'ok' : 'error', 'Description here', {
    custom_detail: 'value',
  });
}
```

---

**Last Updated**: December 9, 2025  
**Maintained by**: APOLO Development Team
