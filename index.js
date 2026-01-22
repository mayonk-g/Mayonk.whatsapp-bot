/**
 * Mayonk Discord Bot
 * Main Entry Point
 * Version: 1.8.7
 * Owner: Laurie
 * 
 * A multi-functional Discord bot with AI, entertainment, moderation, and utility features
 * Total Plugins: 321
 */

// =============================================
// BOOTSTRAP & ENVIRONMENT SETUP
// =============================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ShardingManager } = require('discord.js');

// Check Node.js version
const requiredNodeVersion = '18.0.0';
const currentNodeVersion = process.versions.node;
if (currentNodeVersion < requiredNodeVersion) {
  console.error(`❌ Node.js ${requiredNodeVersion} or higher is required. You have ${currentNodeVersion}.`);
  process.exit(1);
}

// Load configuration
let settings, config;
try {
  settings = require('./config/settings.js');
  config = require('./config/config.json');
} catch (err) {
  console.error('❌ Failed to load configuration files:', err.message);
  console.log('📝 Creating default configuration files...');
  createDefaultConfigs();
  process.exit(1);
}

// =============================================
// SHARDING MANAGER (FOR LARGE SCALE)
// =============================================

function startSharding() {
  console.log('🚀 Starting Mayonk Bot with sharding...');
  
  const manager = new ShardingManager('./src/bot.js', {
    token: settings.TOKEN,
    totalShards: 'auto',
    respawn: true,
    shardArgs: process.argv.slice(2),
    execArgv: process.execArgv
  });

  manager.on('shardCreate', (shard) => {
    console.log(`🔧 Launched shard ${shard.id}`);
    shard.on('ready', () => {
      console.log(`✅ Shard ${shard.id} ready`);
    });
    shard.on('death', () => {
      console.error(`💀 Shard ${shard.id} died`);
    });
    shard.on('disconnect', () => {
      console.warn(`🔌 Shard ${shard.id} disconnected`);
    });
  });

  manager.spawn({ amount: manager.totalShards, delay: 5500, timeout: 30000 })
    .then(shards => {
      console.log(`✅ All ${shards.size} shards launched successfully`);
    })
    .catch(err => {
      console.error('❌ Failed to spawn shards:', err);
      process.exit(1);
    });
}

// =============================================
// SINGLE INSTANCE BOT (FOR SMALL/MEDIUM SCALE)
// =============================================

function startSingleInstance() {
  console.log('🚀 Starting Mayonk Bot in single instance mode...');
  
  // Import and initialize the bot
  const Bot = require('./src/bot.js');
  const bot = new Bot(settings, config);
  
  bot.start().catch(err => {
    console.error('❌ Failed to start bot:', err);
    process.exit(1);
  });
}

// =============================================
// CLI INTERFACE & ARGUMENT PARSING
// =============================================

function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    shard: args.includes('--shard'),
    debug: args.includes('--debug'),
    test: args.includes('--test'),
    maintenance: args.includes('--maintenance'),
    reset: args.includes('--reset'),
    backup: args.includes('--backup'),
    stats: args.includes('--stats'),
    help: args.includes('--help') || args.includes('-h')
  };

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (options.debug) {
    process.env.DEBUG = 'true';
    console.log('🐛 Debug mode enabled');
  }

  if (options.test) {
    console.log('🧪 Test mode - Running diagnostics...');
    runDiagnostics();
    process.exit(0);
  }

  if (options.reset) {
    console.log('🔄 Reset mode - Resetting configurations...');
    resetBot();
    process.exit(0);
  }

  if (options.backup) {
    console.log('💾 Backup mode - Creating backup...');
    createBackup();
    process.exit(0);
  }

  if (options.stats) {
    console.log('📊 Statistics mode - Showing bot statistics...');
    showStatistics();
    process.exit(0);
  }

  return options;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function showHelp() {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║            Mayonk Bot - Help              ║
  ╚═══════════════════════════════════════════╝
  
  Usage: node index.js [options]
  
  Options:
    --shard        Start with sharding (for large scale)
    --debug        Enable debug mode with verbose logging
    --test         Run diagnostics and exit
    --maintenance  Start in maintenance mode
    --reset        Reset bot configuration
    --backup       Create a backup of bot data
    --stats        Show bot statistics
    --help, -h     Show this help message
  
  Examples:
    node index.js                     # Normal startup
    node index.js --debug             # Debug mode
    node index.js --shard             # With sharding
    node index.js --test              # Run tests
  `);
}

function runDiagnostics() {
  console.log('\n🔍 Running diagnostics...\n');
  
  const checks = [
    { name: 'Node.js Version', check: () => currentNodeVersion >= requiredNodeVersion },
    { name: 'Configuration Files', check: () => fs.existsSync('./config/settings.js') && fs.existsSync('./config/config.json') },
    { name: 'Environment Variables', check: () => process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN.length > 50 },
    { name: 'Required Directories', check: () => {
      const dirs = ['./commands', './events', './plugins', './utils', './logs', './temp'];
      return dirs.every(dir => fs.existsSync(dir) || (fs.mkdirSync(dir, { recursive: true }) && true));
    }},
    { name: 'File Permissions', check: () => {
      try {
        fs.writeFileSync('./temp/test.txt', 'test');
        fs.unlinkSync('./temp/test.txt');
        return true;
      } catch {
        return false;
      }
    }},
    { name: 'Network Connectivity', check: () => {
      // Simple network check
      return require('dns').promises.resolve('google.com').then(() => true).catch(() => false);
    }}
  ];

  let passed = 0;
  checks.forEach((check, index) => {
    try {
      const result = typeof check.check === 'function' ? check.check() : check.check;
      const status = result ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
      if (result) passed++;
    } catch (err) {
      console.log(`❌ ${check.name}: ${err.message}`);
    }
  });

  console.log(`\n📊 Diagnostics complete: ${passed}/${checks.length} checks passed`);
  
  if (passed === checks.length) {
    console.log('🎉 All systems are go! Ready to launch.');
  } else {
    console.log('⚠️  Some checks failed. Review the issues above.');
  }
}

function createDefaultConfigs() {
  const defaultSettings = `module.exports = {
  BOT_NAME: "Mayonk",
  OWNER_NAME: "Laurie",
  PREFIX: ".",
  TOKEN: process.env.DISCORD_TOKEN,
  VERSION: "1.8.7",
  PLUGINS: 321,
  
  DATABASE: {
    type: "mongodb",
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/mayonk"
  },
  
  LOGGING: {
    LEVEL: "info",
    CONSOLE_OUTPUT: true
  },
  
  SECURITY: {
    SUDO_USERS: [],
    RATE_LIMIT: {
      ENABLED: true,
      WINDOW: 60000,
      MAX: 30
    }
  }
};`;

  const defaultConfig = {
    "bot": {
      "name": "Mayonk",
      "version": "1.8.7",
      "author": "Laurie",
      "website": "https://github.com/laurie/mayonk-bot"
    },
    "features": {
      "ai": true,
      "moderation": true,
      "entertainment": true,
      "utility": true
    }
  };

  // Create config directory
  if (!fs.existsSync('./config')) {
    fs.mkdirSync('./config', { recursive: true });
  }

  // Write default files
  fs.writeFileSync('./config/settings.js', defaultSettings);
  fs.writeFileSync('./config/config.json', JSON.stringify(defaultConfig, null, 2));
  
  // Create .env.example
  const envExample = `# Discord Bot Token
DISCORD_TOKEN=your_bot_token_here

# Database
DATABASE_URL=mongodb://localhost:27017/mayonk

# API Keys
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here`;
  
  fs.writeFileSync('./.env.example', envExample);
  
  console.log('✅ Default configuration files created.');
  console.log('📝 Please edit config/settings.js and .env file with your settings.');
}

function resetBot() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('⚠️  WARNING: This will reset all bot configurations to default.');
  readline.question('Are you sure? (yes/no): ', answer => {
    if (answer.toLowerCase() === 'yes') {
      console.log('🔄 Resetting bot...');
      
      // Backup existing configs
      const backupDir = `./backup/${Date.now()}`;
      if (!fs.existsSync('./backup')) fs.mkdirSync('./backup', { recursive: true });
      
      if (fs.existsSync('./config')) {
        fs.cpSync('./config', `${backupDir}/config`, { recursive: true });
        console.log(`📦 Existing config backed up to: ${backupDir}`);
      }
      
      // Remove old configs
      if (fs.existsSync('./config')) {
        fs.rmSync('./config', { recursive: true, force: true });
      }
      
      // Create new default configs
      createDefaultConfigs();
      
      console.log('✅ Bot has been reset to default configuration.');
    } else {
      console.log('❌ Reset cancelled.');
    }
    readline.close();
  });
}

function createBackup() {
  const backupDir = `./backups/backup_${Date.now()}`;
  
  console.log(`💾 Creating backup in ${backupDir}...`);
  
  // Create backup directory
  if (!fs.existsSync('./backups')) {
    fs.mkdirSync('./backups', { recursive: true });
  }
  
  const dirsToBackup = [
    './config',
    './data',
    './plugins',
    './commands',
    './events',
    './locales'
  ];
  
  let backedUp = 0;
  dirsToBackup.forEach(dir => {
    if (fs.existsSync(dir)) {
      const dest = path.join(backupDir, dir);
      fs.cpSync(dir, dest, { recursive: true });
      backedUp++;
      console.log(`  ✅ Backed up: ${dir}`);
    }
  });
  
  // Backup package.json and other important files
  const filesToBackup = ['./package.json', './package-lock.json', './README.md'];
  filesToBackup.forEach(file => {
    if (fs.existsSync(file)) {
      const dest = path.join(backupDir, file);
      fs.copyFileSync(file, dest);
      console.log(`  ✅ Backed up: ${file}`);
    }
  });
  
  // Create backup info file
  const backupInfo = {
    timestamp: new Date().toISOString(),
    version: settings.VERSION || '1.8.7',
    backedUpDirectories: dirsToBackup.filter(dir => fs.existsSync(dir)),
    totalSize: getDirectorySize(backupDir)
  };
  
  fs.writeFileSync(
    path.join(backupDir, 'backup-info.json'),
    JSON.stringify(backupInfo, null, 2)
  );
  
  console.log(`\n✅ Backup completed successfully!`);
  console.log(`📁 Location: ${backupDir}`);
  console.log(`📦 Total size: ${formatBytes(backupInfo.totalSize)}`);
}

function showStatistics() {
  console.log('\n📊 Mayonk Bot Statistics\n');
  
  // Bot info
  console.log('🤖 Bot Information:');
  console.log(`  Name: ${settings.BOT_NAME || 'Mayonk'}`);
  console.log(`  Version: ${settings.VERSION || '1.8.7'}`);
  console.log(`  Owner: ${settings.OWNER_NAME || 'Laurie'}`);
  console.log(`  Prefix: ${settings.PREFIX || '.'}`);
  console.log(`  Plugins: ${settings.plugins || 321}`);
  
  // System info
  console.log('\n🖥️  System Information:');
  console.log(`  Node.js: ${process.version}`);
  console.log(`  Platform: ${process.platform} ${process.arch}`);
  console.log(`  Uptime: ${formatUptime(process.uptime())}`);
  console.log(`  Memory: ${formatBytes(process.memoryUsage().rss)} RSS`);
  
  // File statistics
  console.log('\n📁 File Statistics:');
  
  const countFiles = (dir, pattern = /\.js$/) => {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        count += countFiles(fullPath, pattern);
      } else if (pattern.test(file.name)) {
        count++;
      }
    });
    return count;
  };
  
  console.log(`  Commands: ${countFiles('./commands')}`);
  console.log(`  Events: ${countFiles('./events')}`);
  console.log(`  Plugins: ${countFiles('./plugins')}`);
  console.log(`  Utils: ${countFiles('./utils')}`);
  
  // Database info
  console.log('\n🗄️  Database Information:');
  console.log(`  Type: ${settings.DATABASE?.type || 'Not configured'}`);
  
  // Feature status
  console.log('\n⚙️  Feature Status:');
  console.log(`  AI Features: ${settings.FEATURES?.AI_ENABLED ? '✅' : '❌'}`);
  console.log(`  Download Features: ${settings.FEATURES?.DOWNLOAD_ENABLED ? '✅' : '❌'}`);
  console.log(`  Moderation: ${settings.FEATURES?.GROUP_MANAGEMENT ? '✅' : '❌'}`);
  console.log(`  Entertainment: ${settings.FEATURES?.ENTERTAINMENT_ENABLED ? '✅' : '❌'}`);
}

function getDirectorySize(dir) {
  let size = 0;
  if (!fs.existsSync(dir)) return 0;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      size += getDirectorySize(fullPath);
    } else {
      try {
        const stats = fs.statSync(fullPath);
        size += stats.size;
      } catch (err) {
        // Ignore errors
      }
    }
  });
  
  return size;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// =============================================
// ASCII ART & BANNER
// =============================================

function showBanner() {
  const banner = `
  ███╗   ███╗ █████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗  ██╗
  ████╗ ████║██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║ ██╔╝
  ██╔████╔██║███████║ ╚████╔╝ ██║   ██║██╔██╗ ██║█████╔╝ 
  ██║╚██╔╝██║██╔══██║  ╚██╔╝  ██║   ██║██║╚██╗██║██╔═██╗ 
  ██║ ╚═╝ ██║██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║  ██╗
  ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝
  
  ════════════════════════════════════════════════════════
        Version: ${settings.VERSION || '1.8.7'} | Plugins: ${settings.plugins || 321}
        Owner: ${settings.OWNER_NAME || 'Laurie'} | Prefix: ${settings.PREFIX || '.'}
  ════════════════════════════════════════════════════════
  `;
  
  console.log(banner);
}

// =============================================
// MAIN EXECUTION
// =============================================

async function main() {
  try {
    // Show banner
    showBanner();
    
    // Parse command line arguments
    const options = parseArguments();
    
    // Check if we're in maintenance mode
    if (options.maintenance) {
      console.log('🔧 Starting in maintenance mode...');
      process.env.MAINTENANCE_MODE = 'true';
    }
    
    // Ensure required directories exist
    const requiredDirs = ['./logs', './temp', './cache', './data'];
    requiredDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
    
    // Check for .env file
    if (!fs.existsSync('.env') && !process.env.DISCORD_TOKEN) {
      console.error('❌ No .env file found and DISCORD_TOKEN not set in environment.');
      console.log('📝 Please create a .env file with your Discord bot token.');
      console.log('   You can copy .env.example to .env and edit it.');
      process.exit(1);
    }
    
    // Check token
    if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN === 'your_bot_token_here') {
      console.error('❌ Invalid or missing DISCORD_TOKEN in .env file.');
      console.log('📝 Please set your Discord bot token in the .env file.');
      process.exit(1);
    }
    
    // Start the bot based on options
    if (options.shard) {
      startSharding();
    } else {
      startSingleInstance();
    }
    
  } catch (error) {
    console.error('❌ Fatal error during startup:', error);
    
    // Log error to file
    const errorLog = `[${new Date().toISOString()}] FATAL ERROR: ${error.stack || error}\n\n`;
    fs.appendFileSync('./logs/fatal-errors.log', errorLog);
    
    process.exit(1);
  }
}

// =============================================
// STARTUP
// =============================================

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💀 Uncaught Exception:', error);
  fs.appendFileSync('./logs/uncaught-exceptions.log', 
    `[${new Date().toISOString()}] ${error.stack || error}\n\n`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💀 Unhandled Rejection at:', promise, 'reason:', reason);
  fs.appendFileSync('./logs/unhandled-rejections.log', 
    `[${new Date().toISOString()}] ${reason.stack || reason}\n\n`);
});

// Handle graceful shutdown
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    // Perform cleanup
    const cleanupTasks = [];
    
    // Add your cleanup tasks here
    cleanupTasks.push(() => {
      console.log('🧹 Cleaning up temporary files...');
      // Clean temp directory
      if (fs.existsSync('./temp')) {
        const files = fs.readdirSync('./temp');
        files.forEach(file => {
          try {
            fs.unlinkSync(path.join('./temp', file));
          } catch (err) {
            // Ignore errors during cleanup
          }
        });
      }
    });
    
    // Execute cleanup tasks
    Promise.all(cleanupTasks.map(task => {
      try {
        return task();
      } catch (err) {
        console.error('Cleanup error:', err);
        return Promise.resolve();
      }
    })).then(() => {
      console.log('👋 Goodbye!');
      process.exit(0);
    });
  });
});

// Start the bot
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  parseArguments,
  runDiagnostics,
  createDefaultConfigs,
  showStatistics
};
