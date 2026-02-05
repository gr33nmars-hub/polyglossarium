import fs from 'fs';
import path from 'path';

/**
 * Logger class for tracking generation progress and errors
 * Implements Requirements 7.2, 9.2
 */
export class Logger {
  constructor(logPath, level = 'info') {
    this.logPath = logPath;
    this.level = level;
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    // Ensure log directory exists
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Initialize log file
    this.log('info', 'Logger initialized', { logPath, level });
  }
  
  /**
   * Logs a message with timestamp and level
   * @param {string} level - Log level (debug, info, warn, error)
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  log(level, message, metadata = {}) {
    if (this.levels[level] < this.levels[this.level]) {
      return; // Skip if below configured level
    }
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...metadata
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      fs.appendFileSync(this.logPath, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
    
    // Also output to console
    const consoleMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    if (level === 'error') {
      console.error(consoleMessage, metadata);
    } else if (level === 'warn') {
      console.warn(consoleMessage, metadata);
    } else {
      console.log(consoleMessage, metadata);
    }
  }
  
  /**
   * Logs debug message
   */
  debug(message, metadata = {}) {
    this.log('debug', message, metadata);
  }
  
  /**
   * Logs info message
   */
  info(message, metadata = {}) {
    this.log('info', message, metadata);
  }
  
  /**
   * Logs warning message
   */
  warn(message, metadata = {}) {
    this.log('warn', message, metadata);
  }
  
  /**
   * Logs error message with optional error object
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {Object} metadata - Additional metadata
   */
  error(message, error = null, metadata = {}) {
    const errorData = {
      ...metadata
    };
    
    if (error) {
      errorData.errorMessage = error.message;
      errorData.errorStack = error.stack;
    }
    
    this.log('error', message, errorData);
  }
  
  /**
   * Logs topic processing start
   * @param {string} topicId - Topic ID
   * @param {string} topicTitle - Topic title
   */
  topicStart(topicId, topicTitle) {
    this.info('Topic processing started', { topicId, topicTitle });
  }
  
  /**
   * Logs topic processing completion
   * @param {string} topicId - Topic ID
   * @param {number} duration - Processing duration in ms
   */
  topicComplete(topicId, duration) {
    this.info('Topic processing completed', { topicId, duration });
  }
  
  /**
   * Logs topic processing failure
   * @param {string} topicId - Topic ID
   * @param {Error} error - Error object
   * @param {number} attempt - Attempt number
   */
  topicFailed(topicId, error, attempt) {
    this.error('Topic processing failed', error, { topicId, attempt });
  }
  
  /**
   * Logs generation summary
   * @param {Object} stats - Statistics object
   */
  summary(stats) {
    this.info('Generation summary', stats);
  }
}
