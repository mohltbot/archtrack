/**
 * Memory Browser API Endpoint
 * GET /api/memory — List available memory files
 * GET /api/memory?file=2026-03-02 — Read specific memory file
 * 
 * Provides programmatic access to daily memory logs for the Mission Control dashboard
 */

import { promises as fs } from 'fs';
import path from 'path';

const MEMORY_DIR = path.join(process.cwd(), '..', 'memory');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { file, limit = 50 } = req.query;
    
    // Read specific file
    if (file) {
      // Security: prevent directory traversal
      const safeFile = path.basename(file);
      const filePath = path.join(MEMORY_DIR, `${safeFile}.md`);
      
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const stats = await fs.stat(filePath);
        
        return res.json({
          file: safeFile,
          content,
          size: stats.size,
          modified: stats.mtime,
          lines: content.split('\n').length
        });
      } catch (err) {
        if (err.code === 'ENOENT') {
          return res.status(404).json({ error: 'Memory file not found' });
        }
        throw err;
      }
    }
    
    // List all memory files
    const files = await fs.readdir(MEMORY_DIR);
    const memoryFiles = await Promise.all(
      files
        .filter(f => f.endsWith('.md'))
        .map(async (f) => {
          const stat = await fs.stat(path.join(MEMORY_DIR, f));
          return {
            file: f.replace('.md', ''),
            date: f.replace('.md', ''),
            size: stat.size,
            modified: stat.mtime
          };
        })
    );
    
    // Sort by date descending
    memoryFiles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      files: memoryFiles.slice(0, parseInt(limit)),
      total: memoryFiles.length,
      directory: MEMORY_DIR
    });
    
  } catch (error) {
    console.error('Memory API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
