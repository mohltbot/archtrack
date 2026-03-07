/**
 * OpenAI Symphony Adapter for Mission Control
 * 
 * Integrates OpenAI Symphony for isolated, autonomous implementation runs.
 * This enhances the Ghost-Shift functionality with better isolation and
 * autonomous execution capabilities.
 * 
 * Source: Ben's Bites Newsletter (March 5, 2026)
 * Tool: https://github.com/openai/symphony
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// Configuration
const CONFIG_PATH = path.join(__dirname, '../config/symphony.json');
const DEFAULT_CONFIG = {
  enabled: false,
  symphonyPath: null, // Will auto-detect if not set
  maxConcurrentRuns: 3,
  defaultTimeout: 3600000, // 1 hour
  logDirectory: './logs/symphony',
  stateDirectory: './data/symphony-state'
};

class SymphonyAdapter {
  constructor() {
    this.config = null;
    this.symphonyAvailable = false;
  }

  async init() {
    await this.loadConfig();
    await this.checkSymphonyAvailability();
    await this.ensureDirectories();
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(CONFIG_PATH, 'utf8');
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
    } catch (error) {
      console.warn('Using default Symphony config:', error.message);
      this.config = DEFAULT_CONFIG;
    }
  }

  async checkSymphonyAvailability() {
    if (this.config.symphonyPath) {
      try {
        await fs.access(this.config.symphonyPath);
        this.symphonyAvailable = true;
        return;
      } catch {
        console.warn('Configured Symphony path not found:', this.config.symphonyPath);
      }
    }

    // Try to find symphony in PATH or common locations
    const possiblePaths = [
      'symphony',
      './node_modules/.bin/symphony',
      '../node_modules/.bin/symphony',
      '/usr/local/bin/symphony',
      '/usr/bin/symphony'
    ];

    for (const symphonyPath of possiblePaths) {
      try {
        const result = await this.execCommand(`which ${symphonyPath}`);
        if (result) {
          this.config.symphonyPath = result.trim();
          this.symphonyAvailable = true;
          console.log('Found Symphony at:', this.config.symphonyPath);
          return;
        }
      } catch {
        // Continue to next path
      }
    }

    console.warn('Symphony not found. Install with: npm install -g @openai/symphony');
  }

  async ensureDirectories() {
    const dirs = [this.config.logDirectory, this.config.stateDirectory];
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error.message);
      }
    }
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, { shell: true });
      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(error || `Command failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Run a task using Symphony
   * @param {Object} task - Task configuration
   * @param {string} task.name - Task name
   * @param {string} task.description - Task description
   * @param {string} task.command - Command to execute
   * @param {Object} task.context - Project context
   * @param {number} task.timeout - Timeout in milliseconds
   * @returns {Promise<Object>} - Run result
   */
  async runTask(task) {
    if (!this.symphonyAvailable) {
      throw new Error('Symphony is not available. Please install it first.');
    }

    if (!this.config.enabled) {
      console.warn('Symphony is disabled in config. Enable it to use this feature.');
      return null;
    }

    const runId = `symphony-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const logFile = path.join(this.config.logDirectory, `${runId}.log`);
    const stateFile = path.join(this.config.stateDirectory, `${runId}.json`);

    const runConfig = {
      id: runId,
      name: task.name,
      description: task.description,
      command: task.command,
      context: task.context || {},
      timeout: task.timeout || this.config.defaultTimeout,
      logFile,
      stateFile,
      startedAt: new Date().toISOString()
    };

    // Save run configuration
    await fs.writeFile(stateFile, JSON.stringify(runConfig, null, 2));

    console.log(`Starting Symphony run: ${runId}`);
    console.log(`Task: ${task.name}`);
    console.log(`Log: ${logFile}`);

    try {
      // Execute the task through Symphony
      const result = await this.executeSymphonyRun(runConfig);
      
      // Update state with result
      runConfig.completedAt = new Date().toISOString();
      runConfig.result = result;
      runConfig.status = 'completed';
      await fs.writeFile(stateFile, JSON.stringify(runConfig, null, 2));

      return {
        runId,
        status: 'success',
        result,
        logFile,
        stateFile
      };
    } catch (error) {
      // Update state with error
      runConfig.completedAt = new Date().toISOString();
      runConfig.error = error.message;
      runConfig.status = 'failed';
      await fs.writeFile(stateFile, JSON.stringify(runConfig, null, 2));

      throw error;
    }
  }

  async executeSymphonyRun(runConfig) {
    return new Promise((resolve, reject) => {
      const args = [
        'run',
        '--name', runConfig.name,
        '--description', runConfig.description,
        '--timeout', runConfig.timeout.toString(),
        '--log', runConfig.logFile
      ];

      // Add context as environment variables
      const env = {
        ...process.env,
        SYMPHONY_RUN_ID: runConfig.id,
        SYMPHONY_CONTEXT: JSON.stringify(runConfig.context)
      };

      const child = spawn(this.config.symphonyPath, args, {
        env,
        shell: true,
        detached: false
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // Set timeout
      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Task timed out after ${runConfig.timeout}ms`));
      }, runConfig.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);
        
        if (code === 0) {
          resolve({
            exitCode: code,
            output: output.trim(),
            duration: Date.now() - new Date(runConfig.startedAt).getTime()
          });
        } else {
          reject(new Error(
            `Symphony run failed with code ${code}: ${errorOutput || output}`
          ));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Get status of a Symphony run
   * @param {string} runId - Run identifier
   * @returns {Promise<Object>} - Run status
   */
  async getRunStatus(runId) {
    const stateFile = path.join(this.config.stateDirectory, `${runId}.json`);
    
    try {
      const stateData = await fs.readFile(stateFile, 'utf8');
      return JSON.parse(stateData);
    } catch (error) {
      throw new Error(`Run not found: ${runId}`);
    }
  }

  /**
   * List all Symphony runs
   * @returns {Promise<Array>} - List of runs
   */
  async listRuns() {
    try {
      const files = await fs.readdir(this.config.stateDirectory);
      const runs = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const stateData = await fs.readFile(
              path.join(this.config.stateDirectory, file),
              'utf8'
            );
            runs.push(JSON.parse(stateData));
          } catch (error) {
            console.warn(`Failed to read run state: ${file}`);
          }
        }
      }

      return runs.sort((a, b) => 
        new Date(b.startedAt) - new Date(a.startedAt)
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if Symphony is available and enabled
   * @returns {boolean}
   */
  isAvailable() {
    return this.symphonyAvailable && this.config.enabled;
  }
}

module.exports = SymphonyAdapter;

// CLI usage
if (require.main === module) {
  const adapter = new SymphonyAdapter();
  
  adapter.init().then(() => {
    console.log('Symphony Adapter Status:');
    console.log('  Available:', adapter.isAvailable());
    console.log('  Path:', adapter.config?.symphonyPath || 'Not found');
    console.log('  Config:', adapter.config);
  }).catch(error => {
    console.error('Failed to initialize:', error.message);
  });
}
