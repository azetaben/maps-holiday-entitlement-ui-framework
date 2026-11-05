const { spawn } = require('node:child_process');
const profile = process.env.ENV ?? (process.env.CI ? 'ci' : 'local');
require('dotenv').config({ path: `env/.env.${profile}`, override: false });
const frameworkConfig = require('../config/framework.json');

const localUrl = new URL(process.env.LOCAL_APP_URL ?? frameworkConfig.urls.localApp);
if (process.env.LOCAL_APP_PORT) localUrl.port = process.env.LOCAL_APP_PORT;
const port = localUrl.port || (localUrl.protocol === 'https:' ? '443' : '80');
const serverEntry = require.resolve('http-server/bin/http-server');
const server = spawn(
  process.execPath,
  [serverEntry, frameworkConfig.localAppRoot, '-p', port, '-c-1'],
  { stdio: 'inherit' },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.kill(signal));
}

server.once('error', (error) => {
  console.error(`Could not start the local app: ${error.message}`);
  process.exitCode = 1;
});
server.once('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
