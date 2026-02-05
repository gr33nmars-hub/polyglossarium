/**
 * Unit tests for Logger class
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Logger', () => {
  const testLogPath = path.join(__dirname, 'test.log');
  let logger;
  
  beforeEach(() => {
    // Clean up test log file
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
    logger = new Logger(testLogPath, 'debug');
  });
  
  afterEach(() => {
    // Clean up test log file
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
  });
  
  test('should create log file on initialization', () => {
    expect(fs.existsSync(testLogPath)).toBe(true);
  });
  
  test('should log info messages', () => {
    logger.info('Test message', { key: 'value' });
    
    const logContent = fs.readFileSync(testLogPath, 'utf8');
    const logLines = logContent.trim().split('\n');
    
    // Should have 2 lines: initialization + test message
    expect(logLines.length).toBeGreaterThanOrEqual(2);
    
    const lastLog = JSON.parse(logLines[logLines.length - 1]);
    expect(lastLog.level).toBe('INFO');
    expect(lastLog.message).toBe('Test message');
    expect(lastLog.key).toBe('value');
    expect(lastLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
  
  test('should log error messages with error object', () => {
    const error = new Error('Test error');
    logger.error('Error occurred', error, { topicId: '1' });
    
    const logContent = fs.readFileSync(testLogPath, 'utf8');
    const logLines = logContent.trim().split('\n');
    const lastLog = JSON.parse(logLines[logLines.length - 1]);
    
    expect(lastLog.level).toBe('ERROR');
    expect(lastLog.message).toBe('Error occurred');
    expect(lastLog.errorMessage).toBe('Test error');
    expect(lastLog.errorStack).toBeDefined();
    expect(lastLog.topicId).toBe('1');
  });
  
  test('should respect log level', () => {
    const warnLogger = new Logger(testLogPath, 'warn');
    
    // Clear initialization logs
    fs.writeFileSync(testLogPath, '', 'utf8');
    
    warnLogger.debug('Debug message');
    warnLogger.info('Info message');
    warnLogger.warn('Warn message');
    
    const logContent = fs.readFileSync(testLogPath, 'utf8');
    const logLines = logContent.trim().split('\n').filter(line => line);
    
    // Should only have warn message
    expect(logLines.length).toBe(1);
    const log = JSON.parse(logLines[0]);
    expect(log.level).toBe('WARN');
  });
  
  test('should log topic start', () => {
    logger.topicStart('1', 'Test Topic');
    
    const logContent = fs.readFileSync(testLogPath, 'utf8');
    const logLines = logContent.trim().split('\n');
    const lastLog = JSON.parse(logLines[logLines.length - 1]);
    
    expect(lastLog.message).toBe('Topic processing started');
    expect(lastLog.topicId).toBe('1');
    expect(lastLog.topicTitle).toBe('Test Topic');
  });
  
  test('should log topic completion', () => {
    logger.topicComplete('1', 5000);
    
    const logContent = fs.readFileSync(testLogPath, 'utf8');
    const logLines = logContent.trim().split('\n');
    const lastLog = JSON.parse(logLines[logLines.length - 1]);
    
    expect(lastLog.message).toBe('Topic processing completed');
    expect(lastLog.topicId).toBe('1');
    expect(lastLog.duration).toBe(5000);
  });
  
  test('should log topic failure', () => {
    const error = new Error('Generation failed');
    logger.topicFailed('1', error, 2);
    
    const logContent = fs.readFileSync(testLogPath, 'utf8');
    const logLines = logContent.trim().split('\n');
    const lastLog = JSON.parse(logLines[logLines.length - 1]);
    
    expect(lastLog.level).toBe('ERROR');
    expect(lastLog.message).toBe('Topic processing failed');
    expect(lastLog.topicId).toBe('1');
    expect(lastLog.attempt).toBe(2);
    expect(lastLog.errorMessage).toBe('Generation failed');
  });
  
  test('should log summary', () => {
    const stats = {
      total: 280,
      successful: 275,
      failed: 5,
      skipped: 0
    };
    
    logger.summary(stats);
    
    const logContent = fs.readFileSync(testLogPath, 'utf8');
    const logLines = logContent.trim().split('\n');
    const lastLog = JSON.parse(logLines[logLines.length - 1]);
    
    expect(lastLog.message).toBe('Generation summary');
    expect(lastLog.total).toBe(280);
    expect(lastLog.successful).toBe(275);
    expect(lastLog.failed).toBe(5);
  });
});
