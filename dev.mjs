#!/usr/bin/env node

/**
 * Development script for Gemini CLI Web Interface
 * Starts both frontend and backend servers
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = __dirname;
const FRONTEND_DIR = join(ROOT_DIR, 'frontend');
const BACKEND_DIR = join(ROOT_DIR, 'backend');

console.log('🚀 Starting Gemini CLI Web Development Environment\n');

// Frontend server
console.log('📱 Starting frontend development server...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: FRONTEND_DIR,
  stdio: 'inherit',
  shell: true
});

// Backend server (when dependencies are resolved)
// console.log('⚙️  Starting backend development server...');
// const backend = spawn('npm', ['run', 'dev'], {
//   cwd: BACKEND_DIR,
//   stdio: 'inherit',
//   shell: true
// });

console.log(`
🌟 Development servers starting...

Frontend: http://localhost:5173
Backend:  http://localhost:3001 (not yet started)

Press Ctrl+C to stop all servers
`);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  frontend.kill();
  // backend.kill();
  process.exit(0);
});

frontend.on('close', (code) => {
  console.log(`Frontend server exited with code ${code}`);
});

// backend.on('close', (code) => {
//   console.log(`Backend server exited with code ${code}`);
// });
