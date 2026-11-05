const fs = require('node:fs');
const path = require('node:path');

const workspace = path.resolve(__dirname, '..');
const resultsDir = path.resolve(workspace, process.env.ALLURE_RESULTS_DIR ?? 'allure-results');
const reportDir = path.resolve(workspace, process.env.ALLURE_REPORT_DIR ?? 'allure-report');

function assertInsideWorkspace(target, label) {
  const relative = path.relative(workspace, target);
  if (
    !relative ||
    relative === '..' ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`${label} must be a subdirectory of the project workspace: ${target}`);
  }
}

assertInsideWorkspace(resultsDir, 'ALLURE_RESULTS_DIR');
assertInsideWorkspace(reportDir, 'ALLURE_REPORT_DIR');

const previousHistory = path.join(reportDir, 'history');
const historyBackup = fs.mkdtempSync(path.join(workspace, '.allure-history-'));
if (fs.existsSync(previousHistory)) {
  fs.cpSync(previousHistory, historyBackup, { recursive: true });
}

fs.rmSync(resultsDir, { recursive: true, force: true });
fs.mkdirSync(resultsDir, { recursive: true });
if (fs.readdirSync(historyBackup).length > 0) {
  fs.cpSync(historyBackup, path.join(resultsDir, 'history'), { recursive: true });
}
fs.rmSync(historyBackup, { recursive: true, force: true });

const githubRunId = process.env.GITHUB_RUN_ID;
const githubServer = process.env.GITHUB_SERVER_URL ?? 'https://github.com';
const githubRepo = process.env.GITHUB_REPOSITORY;
const githubBuildUrl =
  githubRunId && githubRepo
    ? `${githubServer}/${githubRepo}/actions/runs/${githubRunId}`
    : undefined;

const executor = {
  name: process.env.GITHUB_ACTIONS
    ? 'GitHub Actions'
    : process.env.JENKINS_URL
      ? 'Jenkins'
      : 'Local',
  type: process.env.GITHUB_ACTIONS ? 'github' : process.env.JENKINS_URL ? 'jenkins' : 'local',
  url: process.env.JENKINS_URL ?? (process.env.GITHUB_ACTIONS ? githubServer : undefined),
  buildName: process.env.GITHUB_WORKFLOW ?? process.env.JOB_NAME ?? 'Holiday entitlement UI run',
  buildOrder: Number(process.env.GITHUB_RUN_NUMBER ?? process.env.BUILD_NUMBER) || undefined,
  buildUrl: githubBuildUrl ?? process.env.BUILD_URL,
  reportName: process.env.ALLURE_REPORT_NAME ?? 'Holiday entitlement UI report',
  reportUrl: process.env.ALLURE_REPORT_URL,
};

fs.writeFileSync(path.join(resultsDir, 'executor.json'), `${JSON.stringify(executor, null, 2)}\n`);
console.log(`Prepared Allure results at ${resultsDir}`);
