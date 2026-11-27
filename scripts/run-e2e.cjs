'use strict';

const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const port = probe.address().port;
      probe.close(() => resolve(port));
    });
  });
}

function waitForPort(port, timeout = 10_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.createConnection({ host: '127.0.0.1', port });
      socket.once('connect', () => { socket.destroy(); resolve(); });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - started >= timeout) reject(new Error(`El servidor no abrió el puerto ${port}.`));
        else setTimeout(attempt, 80);
      });
    };
    attempt();
  });
}

function closeChild(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  return new Promise(resolve => {
    child.once('close', resolve);
    child.kill();
    setTimeout(() => { if (child.exitCode === null) child.kill('SIGKILL'); }, 1_000);
  });
}

async function main() {
  const requested = Number(process.env.PORT);
  const port = Number.isInteger(requested) && requested > 0 ? requested : await freePort();
  const env = { ...process.env, PORT: String(port) };
  const server = spawn(process.execPath, [path.join(__dirname, 'serve.cjs')], { env, stdio: 'inherit' });
  let runner;
  try {
    await waitForPort(port);
    const args = process.argv.slice(2);
    if (args[0] === '--') args.shift();
    runner = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test', ...args], { env, stdio: 'inherit' });
    const code = await new Promise(resolve => runner.once('close', (exitCode, signal) => resolve(exitCode ?? (signal ? 1 : 0))));
    process.exitCode = code;
  } finally {
    await closeChild(runner);
    await closeChild(server);
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
