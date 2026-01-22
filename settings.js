module.exports = {
  // Bot Core Settings
  BOT_NAME: "Mayonk",
  OWNER_NAME: "Laurie",
  OWNER_NUMBER: "1234567890",
  PREFIX: ".",
  
  // Bot Credentials (Discord)
  TOKEN: process.env.DISCORD_TOKEN || "your-bot-token-here",
  CLIENT_ID: "your-client-id",
  GUILD_ID: "your-guild-id",
  
  // Database Configuration
  DATABASE: {
    type: "mongodb", // or "sqlite", "postgres", "mysql"
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/mayonk",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // API Keys
  API_KEYS: {
    OPENAI: process.env.OPENAI_API_KEY || "",
    GOOGLE_GEMINI: process.env.GEMINI_API_KEY || "",
    DEEPAI: process.env.DEEPAI_API_KEY || "",
    REMINI: process.env.REMINI_API_KEY || "",
    WEATHER: process.env.WEATHER_API_KEY || "",
    YOUTUBE: process.env.YOUTUBE_API_KEY || "",
    IMDB: process.env.IMDB_API_KEY || "",
    // Add other API keys as needed
  },
  
  // Feature Toggles
  FEATURES: {
    AI_ENABLED: true,
    DOWNLOAD_ENABLED: true,
    IMAGE_ENABLED: true,
    AUDIO_ENABLED: true,
    GROUP_MANAGEMENT: true,
    SPORTS_UPDATES: true,
    AUTO_MODERATION: true
  },
  
  // Group Settings
  GROUP_SETTINGS: {
    WELCOME_MESSAGE: "Welcome to the group!",
    GOODBYE_MESSAGE: "Goodbye!",
    AUTO_APPROVE: false,
    MAX_WARNINGS: 3,
    ANTISPAM_THRESHOLD: 5,
    ANTI_LINK_ENABLED: true
  },
  
  // AI Settings
  AI_SETTINGS: {
    DEFAULT_MODEL: "gpt-3.5-turbo",
    MAX_TOKENS: 1500,
    TEMPERATURE: 0.7,
    ENABLED_MODELS: ["gpt", "gemini", "deepseek", "llama"]
  },
  
  // Download Settings
  DOWNLOAD_SETTINGS: {
    MAX_FILE_SIZE: 100, // MB
    ALLOWED_FORMATS: ["mp4", "mp3", "jpg", "png", "gif"],
    TEMP_FOLDER: "./temp",
    AUTO_CLEANUP: true,
    CLEANUP_INTERVAL: 3600 // seconds
  },
  
  // Audio Settings
  AUDIO_SETTINGS: {
    MAX_DURATION: 300, // seconds
    DEFAULT_VOLUME: 1.0,
    ALLOWED_EFFECTS: ["bass", "deep", "robot", "reverse"]
  },
  
  // Image Settings
  IMAGE_SETTINGS: {
    MAX_RESOLUTION: "1920x1080",
    QUALITY: 85,
    ALLOWED_FORMATS: ["jpg", "png", "webp"],
    EPHOTO360_ENDPOINT: "https://ephoto360.com/api"
  },
  
  // Security Settings
  SECURITY: {
    SUDO_USERS: ["1234567890"], // Owner's number
    ALLOWED_USERS: [],
    BLACKLISTED_USERS: [],
    ANTIBOT_ENABLED: true,
    RATE_LIMIT: {
      WINDOW: 60000, // 1 minute
      MAX: 30 // requests per window
    }
  },
  
  // Auto Features
  AUTO_FEATURES: {
    AUTO_REACT: false,
    AUTO_TYPING: false,
    AUTO_READ: false,
    AUTO_BLOCK: false,
    AUTO_RECORD: false,
    AUTO_BIO: false
  },
  
  // Logging
  LOGGING: {
    LEVEL: "info", // debug, info, warn, error
    SAVE_TO_FILE: true,
    FILE_PATH: "./logs",
    CONSOLE_OUTPUT: true
  },
  
  // Performance
  PERFORMANCE: {
    CACHE_ENABLED: true,
    CACHE_DURATION: 300, // seconds
    MAX_CONCURRENT_DOWNLOADS: 3,
    TIMEOUT: 30000 // milliseconds
  },
  
  // Web Server (if applicable)
  WEB_SERVER: {
    ENABLED: false,
    PORT: 3000,
    HOST: "localhost"
  },
  
  // External Services
  SERVICES: {
    // Sports APIs
    FOOTBALL_API: "https://api.football-data.org/v4",
    WWE_API: "https://api.sportsdata.io/v3/wwe",
    
    // Religion APIs
    BIBLE_API: "https://bible-api.com",
    QURAN_API: "https://api.alquran.cloud/v1",
    
    // Other APIs
    DICTIONARY_API: "https://api.dictionaryapi.dev/api/v2",
    LYRICS_API: "https://api.lyrics.ovh/v1"
  },
  
  // Default Messages
  MESSAGES: {
    ERROR: "An error occurred. Please try again later.",
    NO_PERMISSION: "You don't have permission to use this command.",
    COMMAND_DISABLED: "This command is currently disabled.",
    RATE_LIMITED: "You're being rate limited. Please wait a moment.",
    MAINTENANCE: "The bot is currently under maintenance."
  },
  
  // Sticker Settings
  STICKER_SETTINGS: {
    PACK_NAME: "Mayonk Stickers",
    AUTHOR_NAME: "Mayonk Bot",
    EMOJIS: ["👍", "❤️", "😂", "😮", "😢", "😡"]
  },
  
  // Time Settings
  TIME: {
    TIMEZONE: "UTC",
    DATE_FORMAT: "DD/MM/YYYY",
    TIME_FORMAT: "HH:mm:ss"
  },
  
  // Experimental Features
  EXPERIMENTAL: {
    VOICE_COMMANDS: false,
    IMAGE_RECOGNITION: false,
    REAL_TIME_TRANSLATION: false
  }
};
