/**
 * MLX OpenAI-Compatible API Server
 * 
 * Exposes MLX local inference via OpenAI-compatible HTTP API.
 * OpenClaw can then add this as a provider and route simple tasks locally.
 * 
 * Usage:
 *   node mlx-server.js
 *   Server runs on http://localhost:8787
 * 
 * OpenClaw Config:
 *   Add provider "local" with baseUrl "http://localhost:8787"
 */

import { createServer } from 'http';
import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.MLX_PORT || 8787;
const VENV_PYTHON = join(process.cwd(), '..', 'venv', 'bin', 'python3');
const MLX_BRIDGE = join(process.cwd(), 'python', 'mlx_bridge.py');

// Check if MLX is available
async function checkMLX() {
  return new Promise((resolve) => {
    const proc = spawn(VENV_PYTHON, [MLX_BRIDGE, '--check']);
    let output = '';
    proc.stdout.on('data', (d) => output += d);
    proc.on('close', (code) => {
      try {
        const result = JSON.parse(output);
        resolve(result.available);
      } catch {
        resolve(false);
      }
    });
  });
}

// Generate with MLX
async function generateWithMLX(prompt, maxTokens = 150) {
  return new Promise((resolve, reject) => {
    const proc = spawn(VENV_PYTHON, [
      MLX_BRIDGE,
      '--prompt', prompt,
      '--max-tokens', String(maxTokens),
      '--temperature', '0.7',
    ]);
    
    let output = '';
    proc.stdout.on('data', (d) => output += d);
    proc.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(new Error('Invalid JSON'));
        }
      } else {
        reject(new Error('MLX failed'));
      }
    });
  });
}

// OpenAI-compatible chat completion endpoint
const server = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (req.url === '/health') {
    const available = await checkMLX();
    res.writeHead(available ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: available ? 'healthy' : 'unavailable', provider: 'mlx-local' }));
    return;
  }
  
  // Models endpoint (OpenAI compatible)
  if (req.url === '/v1/models' || req.url === '/models') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      object: 'list',
      data: [{
        id: 'mlx-local/smollm2-360m',
        object: 'model',
        owned_by: 'local',
      }]
    }));
    return;
  }
  
  // Chat completions
  if (req.url === '/v1/chat/completions' || req.url === '/chat/completions') {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const messages = data.messages || [];
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        const maxTokens = data.max_tokens || 150;
        
        console.log(`[MLX Server] Processing request: ${prompt.slice(0, 50)}...`);
        
        const start = Date.now();
        const result = await generateWithMLX(prompt, maxTokens);
        const duration = Date.now() - start;
        
        // OpenAI-compatible response
        const response = {
          id: `mlx-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mlx-local/smollm2-360m',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: result.text,
            },
            finish_reason: 'stop',
          }],
          usage: {
            prompt_tokens: Math.ceil(prompt.length / 4),
            completion_tokens: result.tokens_generated || 0,
            total_tokens: Math.ceil(prompt.length / 4) + (result.tokens_generated || 0),
          },
        };
        
        console.log(`[MLX Server] Completed in ${duration}ms, ${result.tokens_per_sec} t/s`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        
      } catch (error) {
        console.error('[MLX Server] Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'MLX inference failed' }));
      }
    });
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 MLX OpenAI-Compatible Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Models: http://localhost:${PORT}/v1/models`);
  console.log(`   Chat:   http://localhost:${PORT}/v1/chat/completions`);
});
