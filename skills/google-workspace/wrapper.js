/**
 * Google Workspace CLI Wrapper for OpenClaw
 * 
 * Provides a JavaScript interface to the Google Workspace CLI
 * with fallback to gog for backward compatibility.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_PATH = path.join(__dirname, '../../config/google-workspace.json');
const DEFAULT_CONFIG = {
  defaultAccount: null,
  outputFormat: 'json',
  cacheEnabled: true,
  cacheTTL: 300,
  fallbackToGog: true
};

class GoogleWorkspace {
  constructor() {
    this.config = this.loadConfig();
    this.gwAvailable = this.checkGwAvailability();
    this.gogAvailable = this.checkGogAvailability();
  }

  loadConfig() {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) };
      }
    } catch (error) {
      console.warn('Failed to load Google Workspace config:', error.message);
    }
    return DEFAULT_CONFIG;
  }

  checkGwAvailability() {
    try {
      execSync('which gw', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  checkGogAvailability() {
    try {
      execSync('which gog', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  exec(command, options = {}) {
    const account = options.account || this.config.defaultAccount;
    const accountFlag = account ? `--account ${account}` : '';
    
    // Try Google Workspace CLI first
    if (this.gwAvailable) {
      try {
        const gwCommand = `gw ${command} ${accountFlag} --${this.config.outputFormat}`;
        const result = execSync(gwCommand, { 
          encoding: 'utf8',
          timeout: options.timeout || 30000
        });
        return this.config.outputFormat === 'json' ? JSON.parse(result) : result;
      } catch (error) {
        if (!this.config.fallbackToGog || !this.gogAvailable) {
          throw error;
        }
        console.warn('Google Workspace CLI failed, falling back to gog:', error.message);
      }
    }

    // Fallback to gog
    if (this.gogAvailable && this.config.fallbackToGog) {
      const gogCommand = `gog ${command} ${accountFlag} --${this.config.outputFormat}`;
      const result = execSync(gogCommand, { 
        encoding: 'utf8',
        timeout: options.timeout || 30000
      });
      return this.config.outputFormat === 'json' ? JSON.parse(result) : result;
    }

    throw new Error('Neither Google Workspace CLI (gw) nor gog is available. Please install one of them.');
  }

  // Gmail Operations
  gmail = {
    search: (query, options = {}) => {
      return this.exec(`gmail search "${query}" --max ${options.max || 50}`, options);
    },
    
    messages: {
      search: (query, options = {}) => {
        return this.exec(`gmail messages search "${query}" --max ${options.max || 50}`, options);
      },
      get: (messageId, options = {}) => {
        return this.exec(`gmail messages get ${messageId}`, options);
      }
    },
    
    send: (to, subject, body, options = {}) => {
      const bodyFlag = body.includes('\n') ? `--body-file -` : `--body "${body}"`;
      return this.exec(`gmail send --to ${to} --subject "${subject}" ${bodyFlag}`, options);
    }
  };

  // Calendar Operations
  calendar = {
    events: {
      list: (from, to, options = {}) => {
        return this.exec(`calendar events list --from ${from} --to ${to}`, options);
      },
      create: (summary, from, to, options = {}) => {
        const descFlag = options.description ? `--description "${options.description}"` : '';
        return this.exec(`calendar events create --summary "${summary}" --from ${from} --to ${to} ${descFlag}`, options);
      },
      delete: (eventId, options = {}) => {
        return this.exec(`calendar events delete ${eventId}`, options);
      }
    }
  };

  // Drive Operations
  drive = {
    files: {
      list: (options = {}) => {
        const query = options.query ? `--query "${options.query}"` : '';
        return this.exec(`drive files list --max ${options.max || 50} ${query}`, options);
      },
      upload: (filePath, name, options = {}) => {
        return this.exec(`drive files upload --file ${filePath} --name "${name}"`, options);
      },
      download: (fileId, outDir, options = {}) => {
        return this.exec(`drive files download ${fileId} --out ${outDir}`, options);
      }
    }
  };

  // Sheets Operations
  sheets = {
    values: {
      get: (spreadsheetId, range, options = {}) => {
        return this.exec(`sheets values get ${spreadsheetId} "${range}"`, options);
      },
      update: (spreadsheetId, range, values, options = {}) => {
        const valuesJson = JSON.stringify(values);
        return this.exec(`sheets values update ${spreadsheetId} "${range}" --values-json '${valuesJson}'`, options);
      },
      append: (spreadsheetId, range, values, options = {}) => {
        const valuesJson = JSON.stringify(values);
        return this.exec(`sheets values append ${spreadsheetId} "${range}" --values-json '${valuesJson}'`, options);
      }
    }
  };

  // Docs Operations
  docs = {
    export: (docId, format, outDir, options = {}) => {
      return this.exec(`docs export ${docId} --format ${format} --out ${outDir}`, options);
    },
    get: (docId, options = {}) => {
      const format = options.format || 'markdown';
      return this.exec(`docs get ${docId} --format ${format}`, options);
    }
  };
}

module.exports = GoogleWorkspace;

// CLI usage
if (require.main === module) {
  const gw = new GoogleWorkspace();
  const command = process.argv[2];
  
  if (!command) {
    console.log('Usage: node wrapper.js <command>');
    console.log('Commands: gmail, calendar, drive, sheets, docs');
    process.exit(1);
  }

  console.log('Google Workspace CLI Wrapper');
  console.log('gw available:', gw.gwAvailable);
  console.log('gog available:', gw.gogAvailable);
  console.log('Config:', gw.config);
}
