#!/usr/bin/env node
// One-shot: push every non-comment KEY=VALUE in .env.local to Vercel
// for the production environment. Skips anything already present unless
// VERCEL_ENV_FORCE=1 is set (in which case it removes + re-adds).
//
// Run from project root:  node scripts/push-env.mjs

import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const force = process.env.VERCEL_ENV_FORCE === '1';
const lines = readFileSync('.env.local', 'utf8').split(/\r?\n/);

function run(args, stdin) {
  return new Promise((resolve) => {
    const p = spawn('vercel', args, { stdio: ['pipe', 'pipe', 'pipe'], shell: true });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (c) => (stdout += c));
    p.stderr.on('data', (c) => (stderr += c));
    if (stdin !== undefined) {
      p.stdin.write(stdin);
      p.stdin.end();
    }
    p.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

const vars = [];
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = line.indexOf('=');
  if (eq <= 0) continue;
  const key = line.slice(0, eq).trim();
  const value = line.slice(eq + 1);
  if (!key) continue;
  vars.push({ key, value });
}

console.log(`Pushing ${vars.length} env vars to Vercel (production)…`);
let ok = 0;
let fail = 0;
for (const { key, value } of vars) {
  if (force) {
    await run(['env', 'rm', key, 'production', '--yes'], '');
  }
  const r = await run(['env', 'add', key, 'production'], value);
  if (r.code === 0) {
    console.log(`  ok  ${key}`);
    ok++;
  } else {
    const detail = (r.stderr || r.stdout).trim().split('\n').slice(-2).join(' ').slice(0, 160);
    if (/already exists/i.test(detail)) {
      console.log(`  skip ${key} (already set; re-run with VERCEL_ENV_FORCE=1 to overwrite)`);
    } else {
      console.log(`  FAIL ${key} - ${detail}`);
      fail++;
    }
  }
}
console.log(`\nDone. ${ok} added · ${fail} failed.`);
process.exit(fail > 0 ? 1 : 0);
