#!/usr/bin/env node
/**
 * MLX Performance Monitor
 * Tracks inference speed, memory usage, and uptime for production MLX usage
 * 
 * Features:
 * - Real-time metrics collection
 * - Historical performance logging
 * - Alert on degradation
 * - JSON API for dashboard integration
 * 
 * Usage:
 *   node scripts/mlx-monitor.mjs              # One-time check
 *   node scripts/mlx-monitor.mjs --watch      # Continuous monitoring
 *   node scripts/mlx-monitor.mjs --report     # Generate daily report
 * 
 * Cron: */15 * * * * (every 15 minutes)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const METRICS_DIR = path.join(__dirname, '../data/mlx-metrics');
const LOG_FILE = path.join(METRICS_DIR, 'performance.jsonl');
const SUMMARY_FILE = path.join(METRICS_DIR, 'summary.json');

const MLX_ENDPOINT = process.env.MLX_ENDPOINT || 'http://localhost:8787';

// Performance thresholds
const THRESHOLDS = {
  minTokensPerSec: 20,      // Alert if < 20 tokens/sec
  maxLatencyMs: 5000,       // Alert if > 5s for small prompt
  maxMemoryGB: 4,           // Alert if > 4GB RAM usage
  maxErrorRate: 0.05        // Alert if > 5% error rate
};

// Ensure metrics directory exists
async function ensureDir() {
  try {
    await fs.mkdir(METRICS_DIR, { recursive: true });
  } catch {}
}

// Check if MLX server is running
async function checkMLXHealth() {
  const startTime = Date.now();
  try {
    const response = await fetch(`${MLX_ENDPOINT}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    const latency = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));
    
    return {
      healthy: response.ok,
      status: data.status || 'unknown',
      latency,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'unreachable',
      latency: Date.now() - startTime,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Run inference benchmark
async function runBenchmark() {
  const testPrompt = "Explain what makes a good software engineer in 3 sentences.";
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${MLX_ENDPOINT}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mlx-local/llama-3.2-1b',
        messages: [{ role: 'user', content: testPrompt }],
        max_tokens: 100,
        temperature: 0.7
      })
    });
    
    const totalLatency = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}`,
        latency: totalLatency
      };
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const tokensGenerated = data.usage?.completion_tokens || 0;
    const tokensPerSec = tokensGenerated > 0 ? (tokensGenerated / (totalLatency / 1000)) : 0;
    
    return {
      success: true,
      latency: totalLatency,
      tokensGenerated,
      tokensPerSec: Math.round(tokensPerSec * 100) / 100,
      contentLength: content.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      latency: Date.now() - startTime
    };
  }
}

// Get system memory info (macOS)
async function getMemoryInfo() {
  try {
    const { execSync } = await import('child_process');
    const output = execSync('vm_stat | grep "Pages"', { encoding: 'utf8' });
    
    // Parse vm_stat output
    const pagesFree = parseInt(output.match(/Pages free:\s+(\d+)/)?.[1] || 0);
    const pagesActive = parseInt(output.match(/Pages active:\s+(\d+)/)?.[1] || 0);
    const pagesInactive = parseInt(output.match(/Pages inactive:\s+(\d+)/)?.[1] || 0);
    const pagesWired = parseInt(output.match(/Pages wired down:\s+(\d+)/)?.[1] || 0);
    
    const pageSize = 4096; // 4KB pages on macOS
    const usedMB = ((pagesActive + pagesInactive + pagesWired) * pageSize) / (1024 * 1024);
    const freeMB = (pagesFree * pageSize) / (1024 * 1024);
    
    return {
      usedMB: Math.round(usedMB),
      freeMB: Math.round(freeMB),
      usedGB: Math.round(usedMB / 1024 * 100) / 100,
      timestamp: new Date().toISOString()
    };
  } catch {
    return { usedMB: 0, freeMB: 0, usedGB: 0, timestamp: new Date().toISOString() };
  }
}

// Collect all metrics
async function collectMetrics() {
  const health = await checkMLXHealth();
  const benchmark = health.healthy ? await runBenchmark() : { success: false, error: 'Health check failed' };
  const memory = await getMemoryInfo();
  
  const metric = {
    timestamp: new Date().toISOString(),
    health: {
      status: health.status,
      latency: health.latency,
      healthy: health.healthy
    },
    performance: benchmark.success ? {
      tokensPerSec: benchmark.tokensPerSec,
      latencyMs: benchmark.latency,
      tokensGenerated: benchmark.tokensGenerated
    } : null,
    system: {
      memoryUsedGB: memory.usedGB,
      memoryFreeMB: memory.freeMB
    },
    errors: benchmark.success ? [] : [benchmark.error]
  };
  
  return metric;
}

// Save metric to log
async function logMetric(metric) {
  await fs.appendFile(LOG_FILE, JSON.stringify(metric) + '\n');
}

// Generate summary statistics
async function generateSummary(hours = 24) {
  try {
    const data = await fs.readFile(LOG_FILE, 'utf8');
    const lines = data.trim().split('\n').filter(Boolean);
    
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const metrics = lines
      .map(line => JSON.parse(line))
      .filter(m => new Date(m.timestamp) > since);
    
    if (metrics.length === 0) {
      return { message: 'No data available' };
    }
    
    const latencies = metrics
      .filter(m => m.performance?.latencyMs)
      .map(m => m.performance.latencyMs);
    
    const tokensPerSec = metrics
      .filter(m => m.performance?.tokensPerSec)
      .map(m => m.performance.tokensPerSec);
    
    const healthChecks = metrics.filter(m => m.health?.healthy);
    const uptimePercent = (healthChecks.length / metrics.length) * 100;
    
    const summary = {
      period: `${hours}h`,
      generatedAt: new Date().toISOString(),
      totalChecks: metrics.length,
      uptime: {
        percent: Math.round(uptimePercent * 100) / 100,
        healthyChecks: healthChecks.length,
        totalChecks: metrics.length
      },
      performance: {
        avgTokensPerSec: tokensPerSec.length > 0 
          ? Math.round((tokensPerSec.reduce((a, b) => a + b, 0) / tokensPerSec.length) * 100) / 100
          : 0,
        minTokensPerSec: tokensPerSec.length > 0 ? Math.min(...tokensPerSec) : 0,
        maxTokensPerSec: tokensPerSec.length > 0 ? Math.max(...tokensPerSec) : 0,
        avgLatencyMs: latencies.length > 0
          ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
          : 0,
        p95LatencyMs: latencies.length > 0 
          ? Math.round(latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)])
          : 0
      },
      system: {
        avgMemoryGB: Math.round(
          metrics.reduce((sum, m) => sum + (m.system?.memoryUsedGB || 0), 0) / metrics.length * 100
        ) / 100
      },
      alerts: checkThresholds(metrics)
    };
    
    await fs.writeFile(SUMMARY_FILE, JSON.stringify(summary, null, 2));
    return summary;
    
  } catch (error) {
    return { error: error.message };
  }
}

// Check for threshold violations
function checkThresholds(metrics) {
  const alerts = [];
  
  const recent = metrics.slice(-10); // Last 10 checks
  
  // Check tokens/sec
  const lowPerf = recent.filter(m => m.performance?.tokensPerSec < THRESHOLDS.minTokensPerSec);
  if (lowPerf.length >= 3) {
    alerts.push({
      severity: 'warning',
      metric: 'tokensPerSec',
      message: `Performance degraded: ${lowPerf.length}/10 checks below ${THRESHOLDS.minTokensPerSec} t/s`
    });
  }
  
  // Check latency
  const highLatency = recent.filter(m => m.performance?.latencyMs > THRESHOLDS.maxLatencyMs);
  if (highLatency.length >= 3) {
    alerts.push({
      severity: 'warning',
      metric: 'latency',
      message: `High latency: ${highLatency.length}/10 checks above ${THRESHOLDS.maxLatencyMs}ms`
    });
  }
  
  // Check health
  const unhealthy = recent.filter(m => !m.health?.healthy);
  if (unhealthy.length >= 2) {
    alerts.push({
      severity: 'critical',
      metric: 'health',
      message: `MLX server unstable: ${unhealthy.length}/10 checks failed`
    });
  }
  
  return alerts;
}

// Print formatted report
function printReport(metric, summary = null) {
  console.log('\n🚀 MLX Performance Monitor');
  console.log('==========================\n');
  
  console.log(`⏰ Check Time: ${metric.timestamp}`);
  console.log(`🔌 Server: ${MLX_ENDPOINT}`);
  
  // Health status
  const healthEmoji = metric.health.healthy ? '🟢' : '🔴';
  console.log(`\n${healthEmoji} Health: ${metric.health.status}`);
  console.log(`   Response Time: ${metric.health.latency}ms`);
  
  // Performance
  if (metric.performance) {
    console.log('\n⚡ Performance:');
    console.log(`   Speed: ${metric.performance.tokensPerSec} tokens/sec`);
    console.log(`   Latency: ${metric.performance.latencyMs}ms`);
    console.log(`   Tokens: ${metric.performance.tokensGenerated}`);
    
    const perfStatus = metric.performance.tokensPerSec >= THRESHOLDS.minTokensPerSec ? '✅' : '⚠️';
    console.log(`   Status: ${perfStatus} (${metric.performance.tokensPerSec}/${THRESHOLDS.minTokensPerSec} t/s target)`);
  } else {
    console.log('\n⚡ Performance: No data (benchmark skipped)');
  }
  
  // System
  console.log('\n💾 System:');
  console.log(`   Memory Used: ${metric.system.memoryUsedGB} GB`);
  console.log(`   Memory Free: ${metric.system.memoryFreeMB} MB`);
  
  // Summary
  if (summary) {
    console.log('\n📊 24h Summary:');
    console.log(`   Uptime: ${summary.uptime.percent}%`);
    console.log(`   Avg Speed: ${summary.performance.avgTokensPerSec} t/s`);
    console.log(`   Avg Latency: ${summary.performance.avgLatencyMs}ms`);
    console.log(`   P95 Latency: ${summary.performance.p95LatencyMs}ms`);
  }
  
  // Alerts
  if (summary?.alerts?.length > 0) {
    console.log('\n🚨 Alerts:');
    summary.alerts.forEach(alert => {
      const emoji = alert.severity === 'critical' ? '🔴' : '🟡';
      console.log(`   ${emoji} ${alert.message}`);
    });
  }
  
  console.log('\n');
}

// Watch mode
async function watchMode() {
  console.log('👀 Starting MLX monitor (watch mode)');
  console.log('Press Ctrl+C to stop\n');
  
  while (true) {
    const metric = await collectMetrics();
    await logMetric(metric);
    
    // Generate summary every hour
    const now = new Date();
    if (now.getMinutes() === 0) {
      const summary = await generateSummary(24);
      printReport(metric, summary);
    } else {
      printReport(metric);
    }
    
    // Wait 60 seconds
    await new Promise(resolve => setTimeout(resolve, 60000));
  }
}

// Main
async function main() {
  await ensureDir();
  
  const args = process.argv.slice(2);
  const watch = args.includes('--watch');
  const report = args.includes('--report');
  
  if (watch) {
    await watchMode();
  } else if (report) {
    const summary = await generateSummary(24);
    console.log(JSON.stringify(summary, null, 2));
  } else {
    const metric = await collectMetrics();
    await logMetric(metric);
    const summary = await generateSummary(24);
    printReport(metric, summary);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
