/**
 * Mayonk Bot Configuration
 * Version: 1.8.7
 * Owner: Laurie
 * 
 * This is the main configuration file for the Mayonk Discord bot.
 * All bot settings are centralized here for easy management.
 */

const path = require('path');
require('dotenv').config();

// =============================================
// BOT CORE CONFIGURATION
// =============================================

const config = {
  // =============================================
  // BOT IDENTITY
  // =============================================
  bot: {
    name: process.env.BOT_NAME || "Mayonk",
    version: "1.8.7",
    owner: {
      name: process.env.BOT_OWNER_NAME || "Laurie",
      id: process.env.BOT_OWNER_ID || "",
      username: process.env.BOT_OWNER_USERNAME || ""
    },
    prefix: process.env.BOT_PREFIX || ".",
    status: process.env.BOT_STATUS || "online",
    activity: {
      type: process.env.BOT_ACTIVITY_TYPE || "PLAYING", // PLAYING, WATCHING, LISTENING, STREAMING
      name: process.env.BOT_ACTIVITY_NAME || "with 321 plugins",
      url: process.env.BOT_ACTIVITY_URL || ""
    },
    color: {
      primary: "#5865F2", // Discord blurple
      success: "#57F287", // Discord green
      warning: "#FEE75C", // Discord yellow
      error: "#ED4245",   // Discord red
      info: "#5865F2"     // Discord blurple
    }
  },

  // =============================================
  // DISCORD CLIENT CONFIGURATION
  // =============================================
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID || null, // For development
    intents: [
      "Guilds",
      "GuildMembers",
      "GuildMessages",
      "MessageContent",
      "GuildMessageReactions",
      "GuildVoiceStates",
      "DirectMessages",
      "GuildPresences",
      "GuildMessageTyping",
      "DirectMessageReactions",
      "DirectMessageTyping"
    ],
    partials: [
      "Channel",
      "Message",
      "User",
      "Reaction",
      "GuildMember"
    ],
    allowedMentions: {
      parse: ["users", "roles"],
      repliedUser: true
    },
    shards: "auto", // "auto" or number
    shardingManager: process.env.SHARDING_ENABLED === "true" || false
  },

  // =============================================
  // DATABASE CONFIGURATION
  // =============================================
  database: {
    // Primary Database (MongoDB)
    mongo: {
      enabled: process.env.MONGO_ENABLED === "true" || true,
      uri: process.env.MONGODB_URI || "mongodb://localhost:27017/mayonk",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
      databases: {
        main: "mayonk",
        logs: "mayonk_logs",
        cache: "mayonk_cache"
      }
    },

    // Redis Cache
    redis: {
      enabled: process.env.REDIS_ENABLED === "true" || true,
      uri: process.env.REDIS_URI || "redis://localhost:6379",
      password: process.env.REDIS_PASSWORD || null,
      db: 0,
      ttl: 3600, // Default TTL in seconds
      prefix: "mayonk:"
    },

    // SQLite (for small data)
    sqlite: {
      enabled: process.env.SQLITE_ENABLED === "true" || false,
      path: path.join(__dirname, '../data/database.sqlite'),
      options: {
        timeout: 5000
      }
    }
  },

  // =============================================
  // API KEYS & EXTERNAL SERVICES
  // =============================================
  api: {
    // AI Services
    openai: {
      key: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
      model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
    },
    
    google: {
      gemini: process.env.GEMINI_API_KEY,
      customSearch: process.env.GOOGLE_CSE_KEY,
      customSearchId: process.env.GOOGLE_CSE_ID,
      youtube: process.env.YOUTUBE_API_KEY
    },
    
    anthropic: {
      key: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || "claude-3-opus-20240229"
    },
    
    // Image Processing
    stabilityai: process.env.STABILITYAI_API_KEY,
    deepai: process.env.DEEPAI_API_KEY,
    remini: process.env.REMINI_API_KEY,
    
    // Other APIs
    weather: process.env.WEATHER_API_KEY,
    imdb: process.env.IMDB_API_KEY,
    lastfm: process.env.LASTFM_API_KEY,
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    },
    
    // Sports APIs
    footballData: process.env.FOOTBALL_DATA_API_KEY,
    sportsDataIO: process.env.SPORTSDATA_API_KEY,
    
    // Religion APIs
    bibleApi: process.env.BIBLE_API_KEY,
    quranApi: process.env.QURAN_API_KEY
  },

  // =============================================
  // FEATURE TOGGLES
  // =============================================
  features: {
    // AI Features
    ai: {
      enabled: process.env.FEATURE_AI === "true" || true,
      chat: process.env.FEATURE_AI_CHAT === "true" || true,
      imageGeneration: process.env.FEATURE_AI_IMAGE === "true" || true,
      translation: process.env.FEATURE_AI_TRANSLATE === "true" || true,
      summarization: process.env.FEATURE_AI_SUMMARIZE === "true" || true
    },
    
    // Media Features
    media: {
      downloads: process.env.FEATURE_DOWNLOADS === "true" || true,
      imageProcessing: process.env.FEATURE_IMAGE_PROCESSING === "true" || true,
      audioProcessing: process.env.FEATURE_AUDIO_PROCESSING === "true" || true,
      videoProcessing: process.env.FEATURE_VIDEO_PROCESSING === "true" || true
    },
    
    // Utility Features
    utility: {
      moderation: process.env.FEATURE_MODERATION === "true" || true,
      automation: process.env.FEATURE_AUTOMATION === "true" || true,
      tools: process.env.FEATURE_TOOLS === "true" || true,
      games: process.env.FEATURE_GAMES === "true" || true,
      sports: process.env.FEATURE_SPORTS === "true" || true,
      religion: process.env.FEATURE_RELIGION === "true" || false
    },
    
    // Group Features
    group: {
      welcomeMessages: process.env.FEATURE_WELCOME === "true" || true,
      autoModeration: process.env.FEATURE_AUTO_MOD === "true" || true,
      announcements: process.env.FEATURE_ANNOUNCEMENTS === "true" || true,
      polls: process.env.FEATURE_POLLS === "true" || true
    }
  },

  // =============================================
  // PLUGIN CONFIGURATION
  // =============================================
  plugins: {
    total: 321,
    enabledByDefault: true,
    
    // Plugin Categories
    categories: {
      ai: ["gpt", "gemini", "deepseek", "llama", "dalle", "imagen"],
      audio: ["bass", "deep", "robot", "earrape", "reverse", "tomp3"],
      download: ["youtube", "tiktok", "instagram", "twitter", "facebook"],
      image: ["remini", "wallpaper", "ephoto360"],
      group: ["antilink", "antispam", "welcome", "kick", "ban", "poll"],
      tools: ["qrcode", "translate", "calculator", "weather"],
      games: ["truth", "dare", "trivia"],
      sports: ["football", "basketball", "wrestling"],
      fun: ["jokes", "memes", "quotes", "facts"]
    },
    
    // Plugin Directories
    directories: {
      base: "./plugins",
      ai: "./plugins/ai",
      audio: "./plugins/audio",
      download: "./plugins/download",
      image: "./plugins/image",
      group: "./plugins/group",
      tools: "./plugins/tools"
    }
  },

  // =============================================
  // SECURITY CONFIGURATION
  // =============================================
  security: {
    // Bot Owners
    owners: (process.env.BOT_OWNERS || "").split(",").filter(Boolean),
    
    // Admin Roles (by ID)
    adminRoles: (process.env.ADMIN_ROLES || "").split(",").filter(Boolean),
    
    // Rate Limiting
    rateLimiting: {
      enabled: process.env.RATE_LIMIT_ENABLED === "true" || true,
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
      max: parseInt(process.env.RATE_LIMIT_MAX) || 30,
      message: "You are being rate limited. Please wait a moment."
    },
    
    // Anti-Spam
    antiSpam: {
      enabled: process.env.ANTI_SPAM_ENABLED === "true" || true,
      threshold: parseInt(process.env.ANTI_SPAM_THRESHOLD) || 5,
      interval: parseInt(process.env.ANTI_SPAM_INTERVAL) || 5000,
      action: "mute", // mute, kick, warn, delete
      duration: parseInt(process.env.ANTI_SPAM_DURATION) || 300000 // 5 minutes
    },
    
    // Blacklist
    blacklist: {
      users: (process.env.BLACKLIST_USERS || "").split(",").filter(Boolean),
      guilds: (process.env.BLACKLIST_GUILDS || "").split(",").filter(Boolean),
      words: (process.env.BLACKLIST_WORDS || "").split(",").filter(Boolean)
    },
    
    // Encryption
    encryption: {
      key: process.env.ENCRYPTION_KEY || "default-encryption-key-change-me",
      algorithm: "aes-256-cbc",
      ivLength: 16
    }
  },

  // =============================================
  // PERFORMANCE & OPTIMIZATION
  // =============================================
  performance: {
    // Caching
    cache: {
      enabled: process.env.CACHE_ENABLED === "true" || true,
      ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
      maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000,
      checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600 // 10 minutes
    },
    
    // Memory Management
    memory: {
      maxHeap: parseInt(process.env.MAX_HEAP_MB) || 1024, // MB
      gcInterval: parseInt(process.env.GC_INTERVAL) || 300000, // 5 minutes
      warnThreshold: 0.8 // Warn at 80% memory usage
    },
    
    // Concurrency
    concurrency: {
      maxDownloads: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS) || 3,
      maxAiRequests: parseInt(process.env.MAX_CONCURRENT_AI_REQUESTS) || 5,
      maxImageProcessing: parseInt(process.env.MAX_CONCURRENT_IMAGES) || 2
    },
    
    // Timeouts
    timeouts: {
      command: parseInt(process.env.COMMAND_TIMEOUT) || 30000, // 30 seconds
      download: parseInt(process.env.DOWNLOAD_TIMEOUT) || 60000, // 60 seconds
      api: parseInt(process.env.API_TIMEOUT) || 15000, // 15 seconds
      database: parseInt(process.env.DB_TIMEOUT) || 10000 // 10 seconds
    }
  },

  // =============================================
  // LOGGING CONFIGURATION
  // =============================================
  logging: {
    // Console Logging
    console: {
      enabled: process.env.LOG_CONSOLE_ENABLED !== "false",
      level: process.env.LOG_CONSOLE_LEVEL || "info",
      timestamp: process.env.LOG_TIMESTAMP !== "false",
      colors: process.env.LOG_COLORS !== "false"
    },
    
    // File Logging
    file: {
      enabled: process.env.LOG_FILE_ENABLED === "true" || true,
      level: process.env.LOG_FILE_LEVEL || "debug",
      directory: path.join(__dirname, '../logs'),
      maxSize: parseInt(process.env.LOG_MAX_SIZE_MB) || 10, // MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 30,
      compress: process.env.LOG_COMPRESS === "true" || true
    },
    
    // Discord Logging
    discord: {
      enabled: process.env.LOG_DISCORD_ENABLED === "true" || false,
      webhookUrl: process.env.LOG_DISCORD_WEBHOOK,
      level: process.env.LOG_DISCORD_LEVEL || "error",
      includeErrors: true,
      includeCommands: false
    },
    
    // Log Categories
    categories: {
      error: { enabled: true, color: "red" },
      warn: { enabled: true, color: "yellow" },
      info: { enabled: true, color: "blue" },
      debug: { enabled: process.env.NODE_ENV === "development", color: "gray" },
      command: { enabled: true, color: "cyan" },
      database: { enabled: false, color: "magenta" }
    }
  },

  // =============================================
  // PATHS & DIRECTORIES
  // =============================================
  paths: {
    root: __dirname,
    base: path.join(__dirname, '..'),
    
    // Source Directories
    src: path.join(__dirname, '../src'),
    commands: path.join(__dirname, '../commands'),
    events: path.join(__dirname, '../events'),
    plugins: path.join(__dirname, '../plugins'),
    utils: path.join(__dirname, '../utils'),
    models: path.join(__dirname, '../models'),
    
    // Data Directories
    data: path.join(__dirname, '../data'),
    temp: path.join(__dirname, '../temp'),
    cache: path.join(__dirname, '../cache'),
    logs: path.join(__dirname, '../logs'),
    backups: path.join(__dirname, '../backups'),
    
    // Config Files
    config: path.join(__dirname, './config.js'),
    settings: path.join(__dirname, './settings.js'),
    env: path.join(__dirname, '../.env')
  },

  // =============================================
  // WEB SERVER CONFIGURATION
  // =============================================
  web: {
    enabled: process.env.WEB_ENABLED === "true" || false,
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || "localhost",
    
    // SSL/TLS
    ssl: {
      enabled: process.env.SSL_ENABLED === "true" || false,
      key: process.env.SSL_KEY_PATH || "",
      cert: process.env.SSL_CERT_PATH || ""
    },
    
    // Rate Limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    
    // CORS
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    },
    
    // API Routes
    api: {
      prefix: "/api/v1",
      version: "1.0.0",
      endpoints: {
        status: "/status",
        stats: "/stats",
        commands: "/commands",
        users: "/users"
      }
    }
  },

  // =============================================
  // COMMAND CONFIGURATION
  // =============================================
  commands: {
    // Command Categories
    categories: {
      ai: "🤖 AI",
      audio: "🎵 Audio",
      download: "📥 Download",
      image: "🖼️ Image",
      group: "👥 Group",
      tools: "🛠️ Tools",
      games: "🎮 Games",
      fun: "😄 Fun",
      sports: "⚽ Sports",
      owner: "👑 Owner",
      settings: "⚙️ Settings",
      utility: "🔧 Utility"
    },
    
    // Command Permissions
    permissions: {
      levels: {
        USER: 0,
        MOD: 1,
        ADMIN: 2,
        OWNER: 3
      },
      
      // Default permission level for commands
      defaults: {
        USER: 0,
        MOD: 1,
        ADMIN: 2,
        OWNER: 3
      }
    },
    
    // Cooldowns
    cooldowns: {
      enabled: true,
      default: 3, // seconds
      user: 5,    // per-user cooldown
      guild: 2    // per-guild cooldown
    },
    
    // Aliases
    aliases: {
      "help": ["h", "commands"],
      "ping": ["p", "test"],
      "weather": ["w", "temp"],
      "translate": ["tr", "trans"],
      "qrcode": ["qr", "barcode"]
    }
  },

  // =============================================
  // MESSAGE & EMBED CONFIGURATION
  // =============================================
  messages: {
    // Default Messages
    defaults: {
      error: "❌ An error occurred. Please try again later.",
      noPermission: "🚫 You don't have permission to use this command.",
      commandDisabled: "🔒 This command is currently disabled.",
      rateLimited: "⏳ You're being rate limited. Please wait a moment.",
      maintenance: "🔧 The bot is currently under maintenance.",
      cooldown: "⏰ Please wait {time} seconds before using this command again.",
      notFound: "🔍 Command not found. Use `.help` to see available commands."
    },
    
    // Welcome Messages
    welcome: {
      enabled: true,
      message: "Welcome {user} to {server}! 🎉",
      channel: "general", // or channel ID
      embed: true,
      dm: false
    },
    
    // Goodbye Messages
    goodbye: {
      enabled: false,
      message: "Goodbye {user}! 👋",
      channel: "general"
    },
    
    // Auto Responses
    autoResponses: {
      enabled: false,
      responses: [
        { trigger: "hello", response: "Hi there! 👋" },
        { trigger: "thanks", response: "You're welcome! 😊" },
        { trigger: "bot", response: "Yes, I'm a bot! 🤖" }
      ]
    }
  },

  // =============================================
  // ENVIRONMENT & DEPLOYMENT
  // =============================================
  environment: {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    isTesting: process.env.NODE_ENV === "test",
    
    // Deployment
    deployment: {
      type: process.env.DEPLOYMENT_TYPE || "standalone", // standalone, docker, pm2, kubernetes
      cluster: process.env.CLUSTER_MODE === "true" || false,
      instances: parseInt(process.env.INSTANCES) || 1
    },
    
    // Maintenance Mode
    maintenance: {
      enabled: process.env.MAINTENANCE_MODE === "true" || false,
      message: "The bot is currently undergoing maintenance. Please check back later."
    }
  },

  // =============================================
  // VALIDATION & SANITIZATION
  // =============================================
  validation: {
    // Input Validation
    inputs: {
      maxLength: {
        message: 2000,
        command: 100,
        argument: 500
      },
      minLength: {
        message: 1,
        command: 1,
        argument: 1
      }
    },
    
    // File Validation
    files: {
      maxSize: {
        image: 10 * 1024 * 1024, // 10MB
        video: 50 * 1024 * 1024, // 50MB
        audio: 20 * 1024 * 1024, // 20MB
        document: 5 * 1024 * 1024 // 5MB
      },
      allowedTypes: {
        image: ["jpg", "jpeg", "png", "gif", "webp"],
        video: ["mp4", "mov", "avi", "mkv"],
        audio: ["mp3", "wav", "ogg", "flac"],
        document: ["pdf", "txt", "doc", "docx"]
      }
    },
    
    // URL Validation
    urls: {
      allowedDomains: [
        "youtube.com", "youtu.be",
        "twitter.com", "x.com",
        "instagram.com",
        "tiktok.com",
        "facebook.com",
        "discord.com",
        "github.com"
      ],
      blockedDomains: [
        "malware.com",
        "phishing-site.com",
        "explicit-content.com"
      ]
    }
  },

  // =============================================
  // UPDATES & NOTIFICATIONS
  // =============================================
  updates: {
    // Auto Updates
    autoUpdate: {
      enabled: process.env.AUTO_UPDATE === "true" || false,
      checkInterval: 24 * 60 * 60 * 1000, // 24 hours
      notifyChannel: process.env.UPDATE_NOTIFY_CHANNEL
    },
    
    // Version Check
    version: {
      current: "1.8.7",
      checkUrl: "https://api.github.com/repos/laurie/mayonk-bot/releases/latest",
      notifyOnUpdate: true
    },
    
    // Change Log
    changelog: {
      url: "https://github.com/laurie/mayonk-bot/blob/main/CHANGELOG.md",
      showOnUpdate: true
    }
  },

  // =============================================
  // CUSTOMIZATION
  // =============================================
  customization: {
    // Embeds
    embed: {
      footer: {
        text: "Mayonk Bot v{version} | {guild}",
        icon: "https://cdn.discordapp.com/avatars/{botId}/{botAvatar}.png"
      },
      author: {
        name: "{botName}",
        icon: "https://cdn.discordapp.com/avatars/{botId}/{botAvatar}.png",
        url: "https://github.com/laurie/mayonk-bot"
      }
    },
    
    // Menus
    menu: {
      type: "paginated", // paginated, select, button
      timeout: 60000, // 60 seconds
      itemsPerPage: 10,
      showPageNumbers: true
    },
    
    // Themes
    themes: {
      default: {
        primary: "#5865F2",
        secondary: "#57F287",
        background: "#2F3136",
        text: "#FFFFFF"
      },
      dark: {
        primary: "#202225",
        secondary: "#4F545C",
        background: "#36393F",
        t
