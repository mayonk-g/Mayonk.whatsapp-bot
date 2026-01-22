/**
 * Mayonk Discord Bot - Main File
 * Version: 1.8.7
 * Author: Laurie
 * Description: A multi-functional Discord bot with 321 plugins
 */

// =============================================
// IMPORTS & INITIALIZATION
// =============================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment-timezone');
const { Client, Collection, GatewayIntentBits, Partials, ActivityType, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const redis = require('redis');
const winston = require('winston');
const os = require('os');
const pidusage = require('pidusage');

// Import configurations
const settings = require('./config/settings.js');
const config = require('./config/config.json');

// =============================================
// LOGGING SYSTEM
// =============================================

const logger = winston.createLogger({
  level: settings.LOGGING.LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => moment().tz(settings.TIME.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (settings.LOGGING.CONSOLE_OUTPUT) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${chalk.gray(timestamp)} ${level} ${message}`;
      })
    )
  }));
}

// Custom console colors
const success = chalk.green.bold;
const error = chalk.red.bold;
const warning = chalk.yellow.bold;
const info = chalk.cyan.bold;

// =============================================
// CLIENT SETUP
// =============================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildMessageTyping
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ],
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true
  },
  presence: {
    activities: [{
      name: `${settings.PREFIX}help | v${settings.VERSION}`,
      type: ActivityType.Playing
    }],
    status: 'online'
  }
});

// =============================================
// COLLECTIONS & CACHE
// =============================================

client.commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
client.slashCommands = new Collection();
client.cooldowns = new Collection();
client.cache = new Collection();
client.plugins = new Collection();
client.settings = settings;
client.config = config;
client.logger = logger;

// Performance tracking
client.startTime = Date.now();
client.commandCount = 0;
client.messageCount = 0;
client.userStats = new Map();

// =============================================
// DATABASE CONNECTIONS
// =============================================

async function connectDatabase() {
  try {
    // MongoDB Connection
    if (settings.DATABASE.type === 'mongodb') {
      await mongoose.connect(settings.DATABASE.url, settings.DATABASE.options);
      logger.info(success('✓ MongoDB connected successfully'));
      
      // Load MongoDB models
      const modelsPath = path.join(__dirname, 'models');
      if (fs.existsSync(modelsPath)) {
        fs.readdirSync(modelsPath)
          .filter(file => file.endsWith('.js'))
          .forEach(file => {
            require(path.join(modelsPath, file));
          });
        logger.info(success('✓ Database models loaded'));
      }
    }

    // Redis Connection
    if (settings.CACHE_ENABLED) {
      client.redis = redis.createClient({
        url: settings.REDIS_URL
      });
      
      client.redis.on('error', (err) => {
        logger.error(error('Redis error:'), err);
      });
      
      await client.redis.connect();
      logger.info(success('✓ Redis connected successfully'));
    }

    // SQLite connection
    if (settings.DATABASE.type === 'sqlite') {
      const sqlite3 = require('sqlite3').verbose();
      client.sqlite = new sqlite3.Database('./data/database.db');
      logger.info(success('✓ SQLite database initialized'));
    }
  } catch (err) {
    logger.error(error('Database connection error:'), err);
    process.exit(1);
  }
}

// =============================================
// COMMAND HANDLER
// =============================================

async function loadCommands() {
  logger.info(info('📂 Loading commands...'));
  
  const commandsPath = path.join(__dirname, 'commands');
  if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath, { recursive: true });
    logger.warn(warning('Commands directory created, no commands loaded'));
    return;
  }

  let totalCommands = 0;
  let totalCategories = 0;

  // Read categories (folders)
  const categories = fs.readdirSync(commandsPath).filter(folder => 
    !folder.startsWith('.') && fs.statSync(path.join(commandsPath, folder)).isDirectory()
  );

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    
    totalCategories++;
    
    for (const file of commandFiles) {
      try {
        const command = require(path.join(categoryPath, file));
        
        // Validate command structure
        if (!command.name || !command.execute) {
          logger.warn(warning(`Skipping invalid command file: ${file}`));
          continue;
        }

        command.category = category;
        command.fileName = file;
        
        // Add to collections
        client.commands.set(command.name, command);
        
        // Add aliases
        if (command.aliases && Array.isArray(command.aliases)) {
          command.aliases.forEach(alias => {
            client.aliases.set(alias, command.name);
          });
        }

        // Register slash command if applicable
        if (command.slash) {
          client.slashCommands.set(command.name, command);
        }

        totalCommands++;
        if (settings.DEBUG) {
          logger.debug(`Loaded command: ${command.name} (${category})`);
        }
      } catch (err) {
        logger.error(error(`Error loading command ${file}:`), err);
      }
    }
  }

  logger.info(success(`✓ Loaded ${totalCommands} commands in ${totalCategories} categories`));
  
  // Verify we have the expected number of plugins
  if (totalCommands < settings.plugins) {
    logger.warn(warning(`Expected ${settings.plugins} plugins, loaded ${totalCommands}`));
  }
}

// =============================================
// EVENT HANDLER
// =============================================

async function loadEvents() {
  logger.info(info('📂 Loading events...'));
  
  const eventsPath = path.join(__dirname, 'events');
  if (!fs.existsSync(eventsPath)) {
    fs.mkdirSync(eventsPath, { recursive: true });
    logger.warn(warning('Events directory created, no events loaded'));
    return;
  }

  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  let loadedEvents = 0;

  for (const file of eventFiles) {
    try {
      const event = require(path.join(eventsPath, file));
      const eventName = file.split('.')[0];
      
      if (!event.execute) {
        logger.warn(warning(`Skipping invalid event file: ${file}`));
        continue;
      }

      // Bind event to client
      if (event.once) {
        client.once(eventName, (...args) => event.execute(client, ...args));
      } else {
        client.on(eventName, (...args) => event.execute(client, ...args));
      }

      client.events.set(eventName, event);
      loadedEvents++;
      
      if (settings.DEBUG) {
        logger.debug(`Loaded event: ${eventName}`);
      }
    } catch (err) {
      logger.error(error(`Error loading event ${file}:`), err);
    }
  }

  logger.info(success(`✓ Loaded ${loadedEvents} events`));
}

// =============================================
// PLUGIN LOADER
// =============================================

async function loadPlugins() {
  logger.info(info('📂 Loading plugins...'));
  
  const pluginsPath = path.join(__dirname, 'plugins');
  if (!fs.existsSync(pluginsPath)) {
    fs.mkdirSync(pluginsPath, { recursive: true });
    logger.info(info('Plugins directory created'));
    return;
  }

  const pluginCategories = fs.readdirSync(pluginsPath).filter(folder => 
    !folder.startsWith('.') && fs.statSync(path.join(pluginsPath, folder)).isDirectory()
  );

  let loadedPlugins = 0;

  for (const category of pluginCategories) {
    const categoryPath = path.join(pluginsPath, category);
    const pluginFiles = fs.readdirSync(categoryPath).filter(file => 
      file.endsWith('.js') || file.endsWith('.plugin.js')
    );

    for (const file of pluginFiles) {
      try {
        const plugin = require(path.join(categoryPath, file));
        
        if (typeof plugin === 'function') {
          plugin(client);
          loadedPlugins++;
          
          if (settings.DEBUG) {
            logger.debug(`Loaded plugin: ${file} (${category})`);
          }
        }
      } catch (err) {
        logger.error(error(`Error loading plugin ${file}:`), err);
      }
    }
  }

  logger.info(success(`✓ Loaded ${loadedPlugins} plugins`));
}

// =============================================
// MIDDLEWARE & UTILITIES
// =============================================

// Rate limiting middleware
function rateLimit(userId, command) {
  if (!settings.SECURITY.RATE_LIMIT.ENABLED) return false;
  
  const now = Date.now();
  const window = settings.SECURITY.RATE_LIMIT.WINDOW;
  const max = settings.SECURITY.RATE_LIMIT.MAX;
  
  if (!client.cooldowns.has(command)) {
    client.cooldowns.set(command, new Collection());
  }
  
  const timestamps = client.cooldowns.get(command);
  
  if (!timestamps.has(userId)) {
    timestamps.set(userId, []);
  }
  
  const userTimestamps = timestamps.get(userId);
  const validTimestamps = userTimestamps.filter(timestamp => now - timestamp < window);
  
  if (validTimestamps.length >= max) {
    return true; // Rate limited
  }
  
  validTimestamps.push(now);
  timestamps.set(userId, validTimestamps);
  
  // Cleanup old timestamps
  setTimeout(() => {
    const currentTimestamps = timestamps.get(userId) || [];
    const updated = currentTimestamps.filter(timestamp => now - timestamp < window);
    if (updated.length === 0) {
      timestamps.delete(userId);
    } else {
      timestamps.set(userId, updated);
    }
  }, window);
  
  return false;
}

// Permission checker
function hasPermission(user, command) {
  if (!command.permissions || command.permissions.length === 0) return true;
  
  // Check if user is owner
  if (settings.SECURITY.SUDO_USERS.includes(user.id)) return true;
  
  // Check role permissions
  const member = client.guilds.cache.first()?.members.cache.get(user.id);
  if (!member) return false;
  
  return command.permissions.some(permission => 
    member.permissions.has(permission)
  );
}

// Command parser
function parseCommand(content) {
  const prefix = settings.PREFIX;
  if (!content.startsWith(prefix)) return null;
  
  const args = content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  return { commandName, args };
}

// =============================================
// BOT STATUS MONITORING
// =============================================

async function updateBotStatus() {
  try {
    const uptime = Date.now() - client.startTime;
    const memory = process.memoryUsage();
    const cpu = os.loadavg();
    
    client.stats = {
      uptime,
      memory: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024)
      },
      cpu: {
        load1: cpu[0],
        load5: cpu[1],
        load15: cpu[2]
      },
      commands: client.commandCount,
      messages: client.messageCount,
      users: client.userStats.size,
      guilds: client.guilds.cache.size
    };
    
    // Update presence
    const activityText = settings.BOT_STATUS.ACTIVITY
      .replace('{prefix}', settings.PREFIX)
      .replace('{guilds}', client.guilds.cache.size)
      .replace('{users}', client.users.cache.size);
    
    client.user.setActivity(activityText, { type: ActivityType.Watching });
    
    // Log stats periodically
    if (settings.DEBUG && Date.now() % 300000 < 1000) { // Every 5 minutes
      logger.debug(`Stats: ${JSON.stringify(client.stats)}`);
    }
  } catch (err) {
    logger.error(error('Error updating bot status:'), err);
  }
}

// =============================================
// ERROR HANDLING
// =============================================

process.on('uncaughtException', (err) => {
  logger.error(error('Uncaught Exception:'), err);
  
  // Try to send error to log channel
  try {
    const errorChannel = client.channels.cache.get(settings.LOG_CHANNEL_ID);
    if (errorChannel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🚨 Uncaught Exception')
        .setDescription(`\`\`\`${err.stack || err}\`\`\``)
        .setTimestamp();
      errorChannel.send({ embeds: [embed] });
    }
  } catch (e) {
    // Ignore errors in error handling
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(error('Unhandled Rejection at:'), promise, 'reason:', reason);
});

process.on('warning', (warning) => {
  logger.warn(warning('Node.js warning:'), warning);
});

// =============================================
// GRACEFUL SHUTDOWN
// =============================================

async function gracefulShutdown(signal) {
  logger.info(warning(`Received ${signal}, shutting down gracefully...`));
  
  // Save any pending data
  if (client.database) {
    await client.database.close();
  }
  
  if (client.redis) {
    await client.redis.quit();
  }
  
  // Destroy client
  client.destroy();
  
  // Close server if running
  if (client.server) {
    client.server.close();
  }
  
  logger.info(success('Bot shutdown complete'));
  process.exit(0);
}

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// =============================================
// MESSAGE HANDLER (LEGACY COMMANDS)
// =============================================

client.on('messageCreate', async (message) => {
  // Ignore bots and DMs (if not allowed)
  if (message.author.bot) return;
  if (message.channel.type === 'DM' && !settings.ALLOW_DM) return;
  
  client.messageCount++;
  
  // Update user stats
  const userStats = client.userStats.get(message.author.id) || { commands: 0, messages: 0 };
  userStats.messages++;
  userStats.lastActive = Date.now();
  client.userStats.set(message.author.id, userStats);
  
  // Parse command
  const parsed = parseCommand(message.content);
  if (!parsed) return;
  
  const { commandName, args } = parsed;
  
  // Find command
  let command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
  if (!command) return;
  
  // Check permissions
  if (!hasPermission(message.author, command)) {
    return message.reply(settings.MESSAGES.NO_PERMISSION);
  }
  
  // Check rate limit
  if (rateLimit(message.author.id, commandName)) {
    return message.reply(settings.MESSAGES.RATE_LIMITED);
  }
  
  // Check if command is enabled
  if (command.enabled === false) {
    return message.reply(settings.MESSAGES.COMMAND_DISABLED);
  }
  
  // Execute command
  try {
    client.commandCount++;
    userStats.commands++;
    
    // Log command execution
    logger.info(`Command executed: ${commandName} by ${message.author.tag} in ${message.guild?.name || 'DM'}`);
    
    // Execute command with context
    await command.execute({
      client,
      message,
      args,
      settings,
      logger
    });
    
  } catch (err) {
    logger.error(error(`Error executing command ${commandName}:`), err);
    
    // Send error to user
    const errorEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('❌ Command Error')
      .setDescription(`\`\`\`${err.message}\`\`\``)
      .setFooter({ text: 'Check the logs for more details' });
    
    message.reply({ embeds: [errorEmbed] }).catch(() => {
      // If we can't send the embed, try plain text
      message.reply(`❌ Error: ${err.message}`).catch(() => {});
    });
  }
});

// =============================================
// SLASH COMMAND HANDLER
// =============================================

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;
  
  try {
    await command.execute(interaction, client);
  } catch (err) {
    logger.error(error(`Error executing slash command ${interaction.commandName}:`), err);
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ 
        content: '❌ There was an error executing this command!', 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: '❌ There was an error executing this command!', 
        ephemeral: true 
      });
    }
  }
});

// =============================================
// INITIALIZATION FUNCTION
// =============================================

async function initializeBot() {
  console.log(chalk.cyan(`
  ███╗   ███╗ █████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗  ██╗
  ████╗ ████║██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║ ██╔╝
  ██╔████╔██║███████║ ╚████╔╝ ██║   ██║██╔██╗ ██║█████╔╝ 
  ██║╚██╔╝██║██╔══██║  ╚██╔╝  ██║   ██║██║╚██╗██║██╔═██╗ 
  ██║ ╚═╝ ██║██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║  ██╗
  ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝
  `));
  
  console.log(chalk.yellow(`🚀 Starting Mayonk Bot v${settings.VERSION}`));
  console.log(chalk.gray(`Owner: ${settings.OWNER_NAME}`));
  console.log(chalk.gray(`Prefix: ${settings.PREFIX}`));
  console.log(chalk.gray(`Plugins: ${settings.plugins}`));
  console.log(chalk.gray('──────────────────────────────────────'));
  
  try {
    // Connect to databases
    await connectDatabase();
    
    // Load commands, events, and plugins
    await loadCommands();
    await loadEvents();
    await loadPlugins();
    
    // Login to Discord
    logger.info(info('🔐 Logging in to Discord...'));
    await client.login(settings.TOKEN);
    
    // Start status update interval
    setInterval(updateBotStatus, 60000); // Update every minute
    
    // Start cleanup interval
    setInterval(() => {
      // Clean up temp files
      if (fs.existsSync('./temp')) {
        const tempFiles = fs.readdirSync('./temp');
        const now = Date.now();
        tempFiles.forEach(file => {
          const filePath = path.join('./temp', file);
          const stat = fs.statSync(filePath);
          if (now - stat.mtimeMs > 3600000) { // Older than 1 hour
            fs.unlinkSync(filePath);
          }
        });
      }
    }, 300000); // Every 5 minutes
    
    logger.info(success('✅ Bot initialization complete!'));
    
  } catch (err) {
    logger.error(error('❌ Bot initialization failed:'), err);
    process.exit(1);
  }
}

// 
