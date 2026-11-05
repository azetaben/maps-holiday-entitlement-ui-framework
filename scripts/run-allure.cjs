const path = require('node:path');
const allure = require('allure-commandline');

const workspace = path.resolve(__dirname, '..');
const resultsDir = path.resolve(workspace, process.env.ALLURE_RESULTS_DIR ?? 'allure-results');
const reportDir = path.resolve(workspace, process.env.ALLURE_REPORT_DIR ?? 'allure-report');
const command = process.argv[2];

const argumentsByCommand = {
  generate: ['generate', resultsDir, '--clean', '-o', reportDir],
  open: ['open', reportDir],
  serve: ['serve', resultsDir],
};

const args = argumentsByCommand[command];
if (!args) {
  throw new Error(`Unknown Allure command: ${command ?? '(missing)'}`);
}

const child = allure(args);
child.on('error', (error) => {
  console.error(`Unable to run Allure ${command}: ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
