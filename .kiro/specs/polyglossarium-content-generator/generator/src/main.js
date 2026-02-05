#!/usr/bin/env node

/**
 * Main Generator Script - Polyglossarium Content Generator
 * 
 * Orchestrates all components to process 290+ topics from curriculum.js
 * and generate comprehensive educational articles in Russian.
 * 
 * Features:
 * - Loads configuration from config file
 * - Initializes all components (reader, iterator, generator, validator, writer)
 * - Implements main processing loop with progress tracking
 * - Displays progress indicator
 * - Timestamped logging for each topic
 * - Error handling with topic ID logging
 * - Generates final summary report
 * 
 * Implements Requirements: 1.4, 1.5, 7.1, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Import components
import CurriculumReader from './CurriculumReader.js';
import TopicIterator from './TopicIterator.js';
import WebSearchClient from './WebSearchClient.js';
import ContentGenerator from './ContentGenerator.js';
import ContentValidator from './ContentValidator.js';
import TopicDescriptionsWriter from './TopicDescriptionsWriter.js';
import { Logger } from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main Generator class that orchestrates the entire generation process
 */
class MainGenerator {
  constructor(configPath) {
    this.configPath = configPath;
    this.config = null;
    this.logger = null;
    this.components = {};
    this.stats = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      startTime: null,
      endTime: null,
      processingTimes: []
    };
  }

  /**
   * Loads configuration from config file
   * @returns {Promise<void>}
   */
  async loadConfig() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(configContent);
      
      // Resolve relative paths from project root
      const projectRoot = path.resolve(__dirname, '../../../..');
      this.config.paths.curriculumPath = path.resolve(projectRoot, this.config.paths.curriculumPath);
      this.config.paths.descriptionsPath = path.resolve(projectRoot, this.config.paths.descriptionsPath);
      this.config.paths.progressPath = path.resolve(projectRoot, this.config.paths.progressPath);
      this.config.paths.logPath = path.resolve(projectRoot, this.config.paths.logPath);
      
      console.log('✓ Configuration loaded successfully');
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  /**
   * Initializes all components
   * @returns {Promise<void>}
   */
  async initializeComponents() {
    try {
      // Initialize logger
      this.logger = new Logger(
        this.config.paths.logPath,
        this.config.logging.level
      );
      this.logger.info('Initializing Polyglossarium Content Generator');

      // Initialize CurriculumReader
      this.components.reader = new CurriculumReader(
        this.config.paths.curriculumPath
      );
      console.log('✓ CurriculumReader initialized');

      // Initialize WebSearchClient
      this.components.webSearch = new WebSearchClient({
        rateLimit: this.config.api.rateLimit.webSearch,
        retryDelay: this.config.api.retryDelay
      });
      console.log('✓ WebSearchClient initialized');

      // Initialize ContentGenerator
      this.components.generator = new ContentGenerator(
        this.components.webSearch,
        {
          minLinks: this.config.limits.minLinks,
          maxLinks: this.config.limits.maxLinks,
          language: 'ru'
        }
      );
      console.log('✓ ContentGenerator initialized');

      // Initialize ContentValidator
      this.components.validator = new ContentValidator();
      console.log('✓ ContentValidator initialized');

      // Initialize TopicDescriptionsWriter
      this.components.writer = new TopicDescriptionsWriter(
        this.config.paths.descriptionsPath
      );
      console.log('✓ TopicDescriptionsWriter initialized');

      this.logger.info('All components initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize components: ${error.message}`);
    }
  }

  /**
   * Reads curriculum and initializes topic iterator
   * @returns {Promise<void>}
   */
  async loadTopics() {
    try {
      // Read all topics from curriculum
      const topics = await this.components.reader.readCurriculum();
      this.stats.total = topics.length;
      
      console.log(`✓ Loaded ${topics.length} topics from curriculum`);
      this.logger.info('Topics loaded from curriculum', { count: topics.length });

      // Initialize TopicIterator
      this.components.iterator = new TopicIterator(
        topics,
        this.config.paths.progressPath
      );

      // Try to load existing progress
      const progressLoaded = await this.components.iterator.loadProgress();
      if (progressLoaded) {
        const stats = this.components.iterator.getStats();
        console.log(`✓ Resumed from previous progress: ${stats.processed} topics already processed`);
        this.logger.info('Progress loaded', stats);
      }

      console.log('✓ TopicIterator initialized');
    } catch (error) {
      throw new Error(`Failed to load topics: ${error.message}`);
    }
  }

  /**
   * Calculates hash of curriculum file for immutability check
   * @returns {Promise<string>} SHA256 hash of curriculum file
   */
  async calculateCurriculumHash() {
    try {
      const content = await fs.readFile(this.config.paths.curriculumPath, 'utf-8');
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      if (this.logger) {
        this.logger.warn('Failed to calculate curriculum hash', { error: error.message });
      }
      return null;
    }
  }

  /**
   * Processes a single topic
   * @param {Object} topic - Topic to process
   * @returns {Promise<boolean>} True if successful, false if failed
   */
  async processTopic(topic) {
    const startTime = Date.now();
    
    try {
      this.logger.topicStart(topic.id, topic.title);
      
      // Step 1: Generate content
      const description = await this.components.generator.generateDescription(topic);
      
      // Step 2: Validate content
      const validationResult = this.components.validator.validate(description);
      
      if (!validationResult.valid) {
        this.logger.warn('Content validation failed', {
          topicId: topic.id,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        });
        
        // Log validation errors but continue (will be flagged for manual review)
        console.log(`  ⚠ Validation warnings for ${topic.id}: ${validationResult.errors.join(', ')}`);
      }
      
      // Step 3: Write to file
      await this.components.writer.updateTopic(topic.id, description);
      
      // Mark as processed
      await this.components.iterator.markProcessed(topic.id);
      
      const duration = Date.now() - startTime;
      this.stats.processingTimes.push(duration);
      this.stats.successful++;
      
      this.logger.topicComplete(topic.id, duration);
      
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.topicFailed(topic.id, error, this.components.iterator.failed.get(topic.id) || 0);
      
      // Mark as failed
      await this.components.iterator.markFailed(topic.id, error);
      
      // Check if we should retry
      if (this.components.iterator.shouldRetry(topic.id)) {
        console.log(`  ✗ Failed ${topic.id}: ${error.message} (will retry)`);
      } else {
        console.log(`  ✗ Failed ${topic.id}: ${error.message} (max retries exceeded)`);
        this.stats.failed++;
      }
      
      return false;
    }
  }

  /**
   * Displays progress indicator
   * @param {Object} topic - Current topic being processed
   */
  displayProgress(topic) {
    const stats = this.components.iterator.getStats();
    const percentage = ((stats.processed / stats.total) * 100).toFixed(1);
    
    // Calculate estimated time remaining
    let eta = 'calculating...';
    if (this.stats.processingTimes.length >= 5) {
      const avgTime = this.stats.processingTimes.reduce((a, b) => a + b, 0) / this.stats.processingTimes.length;
      const remainingMs = stats.remaining * avgTime;
      eta = this.formatDuration(remainingMs);
    }
    
    console.log(`\n[${'='.repeat(Math.floor(percentage / 2))}${' '.repeat(50 - Math.floor(percentage / 2))}] ${percentage}%`);
    console.log(`Processing: ${topic.title} (${topic.id})`);
    console.log(`Progress: ${stats.processed}/${stats.total} | Successful: ${this.stats.successful} | Failed: ${stats.failed} | Remaining: ${stats.remaining}`);
    console.log(`ETA: ${eta}`);
  }

  /**
   * Formats duration in milliseconds to human-readable string
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Main processing loop
   * @returns {Promise<void>}
   */
  async processAllTopics() {
    console.log('\n' + '='.repeat(60));
    console.log('Starting content generation...');
    console.log('='.repeat(60) + '\n');
    
    this.stats.startTime = Date.now();
    
    // Calculate initial curriculum hash for immutability check
    const initialHash = await this.calculateCurriculumHash();
    
    let topic;
    while ((topic = this.components.iterator.next()) !== null) {
      this.displayProgress(topic);
      await this.processTopic(topic);
    }
    
    this.stats.endTime = Date.now();
    
    // Verify curriculum immutability
    const finalHash = await this.calculateCurriculumHash();
    if (initialHash && finalHash && initialHash !== finalHash) {
      this.logger.error('Curriculum file was modified during generation!');
      console.error('\n⚠ WARNING: Curriculum file was modified during generation!');
    } else if (initialHash && finalHash) {
      this.logger.info('Curriculum immutability verified');
      console.log('\n✓ Curriculum file integrity verified');
    }
    
    // Update final stats
    const finalStats = this.components.iterator.getStats();
    this.stats.processed = finalStats.processed;
    this.stats.failed = finalStats.failed;
    this.stats.skipped = 0; // We don't skip topics, we retry or fail them
  }

  /**
   * Verifies that topicDescriptions.js contains all processed topics
   * and has valid JavaScript syntax
   * @returns {Promise<Object>} Verification result with any discrepancies
   */
  async verifyGeneratedContent() {
    console.log('\n' + '='.repeat(60));
    console.log('VERIFYING GENERATED CONTENT');
    console.log('='.repeat(60) + '\n');
    
    const verificationResult = {
      valid: true,
      syntaxValid: false,
      missingTopics: [],
      totalProcessed: 0,
      totalInFile: 0
    };
    
    try {
      // Step 1: Read the topicDescriptions.js file
      console.log('Reading topicDescriptions.js...');
      const descriptions = await this.components.writer.readExisting();
      verificationResult.totalInFile = Object.keys(descriptions).length;
      console.log(`✓ Found ${verificationResult.totalInFile} entries in file`);
      
      // Step 2: Get list of successfully processed topics
      const processedTopics = Array.from(this.components.iterator.processed);
      verificationResult.totalProcessed = processedTopics.length;
      console.log(`✓ ${verificationResult.totalProcessed} topics were successfully processed`);
      
      // Step 3: Verify all processed topics have entries
      console.log('\nVerifying topic entries...');
      for (const topicId of processedTopics) {
        if (!descriptions[topicId]) {
          verificationResult.missingTopics.push(topicId);
          verificationResult.valid = false;
        }
      }
      
      if (verificationResult.missingTopics.length === 0) {
        console.log('✓ All processed topics have entries in topicDescriptions.js');
      } else {
        console.log(`✗ ${verificationResult.missingTopics.length} processed topics are missing from file:`);
        verificationResult.missingTopics.forEach(topicId => {
          console.log(`  - ${topicId}`);
        });
      }
      
      // Step 4: Validate JavaScript syntax
      console.log('\nValidating JavaScript syntax...');
      const fileContent = await fs.readFile(this.config.paths.descriptionsPath, 'utf-8');
      verificationResult.syntaxValid = this.components.writer.validateSyntax(fileContent);
      
      if (verificationResult.syntaxValid) {
        console.log('✓ JavaScript syntax is valid');
      } else {
        console.log('✗ JavaScript syntax is invalid');
        verificationResult.valid = false;
      }
      
      // Log verification results
      this.logger.info('Content verification completed', verificationResult);
      
      console.log('\n' + '='.repeat(60));
      
      if (verificationResult.valid && verificationResult.syntaxValid) {
        console.log('✓ VERIFICATION PASSED');
      } else {
        console.log('✗ VERIFICATION FAILED');
      }
      console.log('='.repeat(60));
      
      return verificationResult;
    } catch (error) {
      console.error(`✗ Verification failed: ${error.message}`);
      this.logger.error('Content verification failed', error);
      verificationResult.valid = false;
      verificationResult.error = error.message;
      return verificationResult;
    }
  }

  /**
   * Generates and displays final summary report
   * @returns {Promise<void>}
   */
  async generateSummaryReport() {
    console.log('\n' + '='.repeat(60));
    console.log('GENERATION SUMMARY');
    console.log('='.repeat(60));
    
    const duration = this.stats.endTime - this.stats.startTime;
    const avgTime = this.stats.processingTimes.length > 0
      ? this.stats.processingTimes.reduce((a, b) => a + b, 0) / this.stats.processingTimes.length
      : 0;
    
    const summary = {
      total: this.stats.total,
      processed: this.stats.processed,
      successful: this.stats.successful,
      failed: this.stats.failed,
      skipped: this.stats.skipped,
      duration: this.formatDuration(duration),
      averageTimePerTopic: this.formatDuration(avgTime)
    };
    
    console.log(`Total topics:           ${summary.total}`);
    console.log(`Processed:              ${summary.processed}`);
    console.log(`Successful:             ${summary.successful}`);
    console.log(`Failed:                 ${summary.failed}`);
    console.log(`Skipped:                ${summary.skipped}`);
    console.log(`Total duration:         ${summary.duration}`);
    console.log(`Average time per topic: ${summary.averageTimePerTopic}`);
    
    // List failed topics
    const failedTopics = this.components.iterator.getFailedTopics();
    if (failedTopics.length > 0) {
      console.log('\nFailed topics:');
      failedTopics.forEach(topicId => {
        console.log(`  - ${topicId}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Log summary
    this.logger.summary({
      ...summary,
      failedTopics
    });
    
    // Save summary to file
    const summaryPath = path.join(
      path.dirname(this.config.paths.progressPath),
      'summary.json'
    );
    await fs.writeFile(
      summaryPath,
      JSON.stringify({ ...summary, failedTopics }, null, 2),
      'utf-8'
    );
    
    console.log(`\n✓ Summary saved to ${summaryPath}`);
  }

  /**
   * Main entry point
   * @returns {Promise<void>}
   */
  async run() {
    try {
      console.log('Polyglossarium Content Generator');
      console.log('================================\n');
      
      // Step 1: Load configuration
      await this.loadConfig();
      
      // Step 2: Initialize components
      await this.initializeComponents();
      
      // Step 3: Load topics
      await this.loadTopics();
      
      // Step 4: Process all topics
      await this.processAllTopics();
      
      // Step 5: Verify generated content
      await this.verifyGeneratedContent();
      
      // Step 6: Generate summary report
      await this.generateSummaryReport();
      
      console.log('\n✓ Generation completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('\n✗ Fatal error:', error.message);
      if (this.logger) {
        this.logger.error('Fatal error', error);
      }
      process.exit(1);
    }
  }
}

/**
 * CLI Argument Parser
 */
class CLIParser {
  constructor(args) {
    this.args = args;
    this.options = {
      resume: true,
      dryRun: false,
      topics: null,
      help: false,
      config: null
    };
  }

  /**
   * Parses command-line arguments
   * @returns {Object} Parsed options
   */
  parse() {
    for (let i = 0; i < this.args.length; i++) {
      const arg = this.args[i];
      
      switch (arg) {
        case '--help':
        case '-h':
          this.options.help = true;
          break;
          
        case '--resume':
          this.options.resume = true;
          break;
          
        case '--no-resume':
          this.options.resume = false;
          break;
          
        case '--dry-run':
          this.options.dryRun = true;
          break;
          
        case '--topics':
          if (i + 1 < this.args.length) {
            this.options.topics = this.args[i + 1].split(',').map(id => id.trim());
            i++; // Skip next argument
          } else {
            throw new Error('--topics requires a comma-separated list of topic IDs');
          }
          break;
          
        case '--config':
          if (i + 1 < this.args.length) {
            this.options.config = this.args[i + 1];
            i++; // Skip next argument
          } else {
            throw new Error('--config requires a path to configuration file');
          }
          break;
          
        default:
          // Ignore unknown arguments (could be node/script path)
          if (arg.startsWith('--')) {
            console.warn(`Warning: Unknown option ${arg}`);
          }
          break;
      }
    }
    
    return this.options;
  }

  /**
   * Displays help text with usage examples
   */
  static displayHelp() {
    console.log(`
Polyglossarium Content Generator
=================================

USAGE:
  node main.js [OPTIONS]

OPTIONS:
  --help, -h              Display this help message
  --config <path>         Use custom configuration file (default: ../config.json)
  --resume                Resume from previous progress (default behavior)
  --no-resume             Start fresh, ignoring previous progress
  --dry-run               Run without actually writing to files
  --topics <ids>          Process only specific topic IDs (comma-separated)

EXAMPLES:
  # Run with default configuration and resume from previous progress
  node main.js

  # Run with custom configuration file
  node main.js --config /path/to/config.json

  # Start fresh without resuming previous progress
  node main.js --no-resume

  # Run in dry-run mode (no file writes)
  node main.js --dry-run

  # Process only specific topics
  node main.js --topics "math-algebra,physics-mechanics,cs-algorithms"

  # Combine options
  node main.js --config custom.json --topics "math-algebra,physics-mechanics" --dry-run

CONFIGURATION:
  The configuration file should be a JSON file with the following structure:
  {
    "paths": {
      "curriculumPath": "path/to/curriculum.js",
      "descriptionsPath": "path/to/topicDescriptions.js",
      "progressPath": "path/to/progress.json",
      "logPath": "path/to/generation.log"
    },
    "limits": {
      "maxRetries": 3,
      "minWordCount": 500,
      "maxWordCount": 2000,
      "minLinks": 5,
      "maxLinks": 10
    },
    "api": {
      "rateLimit": {
        "webSearch": 10,
        "sequentialThinking": 20
      }
    }
  }

PROGRESS TRACKING:
  The generator automatically saves progress after each successful topic.
  Use --resume (default) to continue from where you left off.
  Use --no-resume to start fresh and reprocess all topics.

DRY RUN MODE:
  In dry-run mode, the generator will:
  - Read the curriculum and configuration
  - Generate content for topics
  - Validate the generated content
  - Display progress and statistics
  - NOT write to topicDescriptions.js
  - NOT update progress.json

  This is useful for testing configuration or previewing changes.

TOPIC FILTERING:
  Use --topics to process only specific topics by their IDs.
  Topic IDs should match those in curriculum.js.
  Multiple IDs should be comma-separated without spaces.

  Example: --topics "math-algebra,physics-mechanics,cs-algorithms"

EXIT CODES:
  0 - Success
  1 - Fatal error (configuration, initialization, or processing failure)

For more information, see the README.md file.
`);
  }

  /**
   * Validates parsed options
   * @param {Object} options - Parsed options
   * @throws {Error} If options are invalid
   */
  static validateOptions(options) {
    // Validate topics format if provided
    if (options.topics) {
      if (!Array.isArray(options.topics) || options.topics.length === 0) {
        throw new Error('--topics must be a non-empty comma-separated list of topic IDs');
      }
      
      // Validate each topic ID format (basic validation)
      for (const topicId of options.topics) {
        if (typeof topicId !== 'string' || topicId.length === 0) {
          throw new Error(`Invalid topic ID: ${topicId}`);
        }
      }
    }
    
    // Validate config path if provided
    if (options.config && typeof options.config !== 'string') {
      throw new Error('--config must be a valid file path');
    }
    
    // Warn about conflicting options
    if (options.dryRun && !options.resume) {
      console.warn('Warning: --no-resume has no effect in --dry-run mode');
    }
  }
}

/**
 * Enhanced MainGenerator with CLI support
 */
class CLIMainGenerator extends MainGenerator {
  constructor(configPath, cliOptions = {}) {
    super(configPath);
    this.cliOptions = cliOptions;
  }

  /**
   * Filters topics based on CLI options
   * @param {Array} topics - All topics from curriculum
   * @returns {Array} Filtered topics
   */
  filterTopics(topics) {
    if (!this.cliOptions.topics || this.cliOptions.topics.length === 0) {
      return topics;
    }
    
    const topicIds = new Set(this.cliOptions.topics);
    const filtered = topics.filter(topic => topicIds.has(topic.id));
    
    // Warn about topics that weren't found
    const foundIds = new Set(filtered.map(t => t.id));
    const notFound = this.cliOptions.topics.filter(id => !foundIds.has(id));
    
    if (notFound.length > 0) {
      console.warn(`\nWarning: The following topic IDs were not found in curriculum:`);
      notFound.forEach(id => console.warn(`  - ${id}`));
      console.warn('');
    }
    
    return filtered;
  }

  /**
   * Override loadTopics to support topic filtering and no-resume option
   */
  async loadTopics() {
    try {
      // Read all topics from curriculum
      const allTopics = await this.components.reader.readCurriculum();
      
      // Filter topics if --topics option is provided
      const topics = this.filterTopics(allTopics);
      
      if (this.cliOptions.topics) {
        console.log(`✓ Filtered to ${topics.length} topics (from ${allTopics.length} total)`);
      } else {
        console.log(`✓ Loaded ${topics.length} topics from curriculum`);
      }
      
      this.stats.total = topics.length;
      this.logger.info('Topics loaded from curriculum', { 
        total: allTopics.length,
        filtered: topics.length,
        topicFilter: this.cliOptions.topics || null
      });

      // Initialize TopicIterator
      this.components.iterator = new TopicIterator(
        topics,
        this.config.paths.progressPath
      );

      // Load existing progress only if --resume is enabled
      if (this.cliOptions.resume) {
        const progressLoaded = await this.components.iterator.loadProgress();
        if (progressLoaded) {
          const stats = this.components.iterator.getStats();
          console.log(`✓ Resumed from previous progress: ${stats.processed} topics already processed`);
          this.logger.info('Progress loaded', stats);
        }
      } else {
        console.log('✓ Starting fresh (--no-resume specified)');
        this.logger.info('Starting fresh, ignoring previous progress');
      }

      console.log('✓ TopicIterator initialized');
    } catch (error) {
      throw new Error(`Failed to load topics: ${error.message}`);
    }
  }

  /**
   * Override processTopic to support dry-run mode
   */
  async processTopic(topic) {
    const startTime = Date.now();
    
    try {
      this.logger.topicStart(topic.id, topic.title);
      
      // Step 1: Generate content
      const description = await this.components.generator.generateDescription(topic);
      
      // Step 2: Validate content
      const validationResult = this.components.validator.validate(description);
      
      if (!validationResult.valid) {
        this.logger.warn('Content validation failed', {
          topicId: topic.id,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        });
        
        console.log(`  ⚠ Validation warnings for ${topic.id}: ${validationResult.errors.join(', ')}`);
      }
      
      // Step 3: Write to file (skip in dry-run mode)
      if (!this.cliOptions.dryRun) {
        await this.components.writer.updateTopic(topic.id, description);
      } else {
        console.log(`  [DRY RUN] Would write topic ${topic.id}`);
      }
      
      // Mark as processed (skip in dry-run mode)
      if (!this.cliOptions.dryRun) {
        await this.components.iterator.markProcessed(topic.id);
      }
      
      const duration = Date.now() - startTime;
      this.stats.processingTimes.push(duration);
      this.stats.successful++;
      
      this.logger.topicComplete(topic.id, duration);
      
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.topicFailed(topic.id, error, this.components.iterator.failed.get(topic.id) || 0);
      
      // Mark as failed (skip in dry-run mode)
      if (!this.cliOptions.dryRun) {
        await this.components.iterator.markFailed(topic.id, error);
      }
      
      // Check if we should retry
      if (this.components.iterator.shouldRetry(topic.id)) {
        console.log(`  ✗ Failed ${topic.id}: ${error.message} (will retry)`);
      } else {
        console.log(`  ✗ Failed ${topic.id}: ${error.message} (max retries exceeded)`);
        this.stats.failed++;
      }
      
      return false;
    }
  }

  /**
   * Override run to display CLI options
   */
  async run() {
    try {
      console.log('Polyglossarium Content Generator');
      console.log('================================\n');
      
      // Display CLI options
      if (this.cliOptions.dryRun) {
        console.log('⚠ DRY RUN MODE - No files will be modified\n');
      }
      if (this.cliOptions.topics) {
        console.log(`📋 Topic Filter: ${this.cliOptions.topics.length} topic(s) specified\n`);
      }
      if (!this.cliOptions.resume) {
        console.log('🔄 Starting fresh (ignoring previous progress)\n');
      }
      
      // Step 1: Load configuration
      await this.loadConfig();
      
      // Step 2: Initialize components
      await this.initializeComponents();
      
      // Step 3: Load topics
      await this.loadTopics();
      
      // Step 4: Process all topics
      await this.processAllTopics();
      
      // Step 5: Verify generated content (skip in dry-run mode)
      if (!this.cliOptions.dryRun) {
        await this.verifyGeneratedContent();
      } else {
        console.log('\n[DRY RUN] Skipping content verification');
      }
      
      // Step 6: Generate summary report
      await this.generateSummaryReport();
      
      if (this.cliOptions.dryRun) {
        console.log('\n✓ Dry run completed successfully! (No files were modified)');
      } else {
        console.log('\n✓ Generation completed successfully!');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('\n✗ Fatal error:', error.message);
      if (this.logger) {
        this.logger.error('Fatal error', error);
      }
      process.exit(1);
    }
  }
}

// Run the generator if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    // Parse CLI arguments
    const cliParser = new CLIParser(process.argv.slice(2));
    const options = cliParser.parse();
    
    // Display help if requested
    if (options.help) {
      CLIParser.displayHelp();
      process.exit(0);
    }
    
    // Validate options
    CLIParser.validateOptions(options);
    
    // Determine config path
    const configPath = options.config || path.resolve(__dirname, '../config.json');
    
    // Create and run generator
    const generator = new CLIMainGenerator(configPath, options);
    generator.run();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('\nUse --help for usage information.');
    process.exit(1);
  }
}

export default MainGenerator;
export { CLIParser, CLIMainGenerator };
