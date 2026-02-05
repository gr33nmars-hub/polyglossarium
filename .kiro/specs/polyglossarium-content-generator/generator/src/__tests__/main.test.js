import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import MainGenerator, { CLIParser, CLIMainGenerator } from '../main.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('MainGenerator', () => {
  let testConfigPath;
  let testConfig;
  let generator;

  beforeEach(async () => {
    // Create a test configuration
    testConfig = {
      paths: {
        curriculumPath: 'test/data/curriculum.js',
        descriptionsPath: 'test/data/topicDescriptions.js',
        progressPath: 'test/data/progress.json',
        logPath: 'test/data/generation.log'
      },
      limits: {
        maxRetries: 3,
        minWordCount: 500,
        maxWordCount: 2000,
        minLinks: 5,
        maxLinks: 10,
        parallelism: 1
      },
      api: {
        rateLimit: {
          webSearch: 10,
          sequentialThinking: 20
        },
        retryDelay: {
          initial: 100,
          multiplier: 2,
          maxDelay: 1000
        }
      },
      validation: {
        requiredSections: ['intro', 'techStack', 'processes', 'applications', 'intersections'],
        minCyrillicRatio: 0.7
      },
      logging: {
        level: 'info',
        timestampFormat: 'ISO8601',
        includeStackTrace: true
      }
    };

    // Write test config to temporary file
    testConfigPath = path.join(__dirname, 'test-config.json');
    await fs.writeFile(testConfigPath, JSON.stringify(testConfig, null, 2), 'utf-8');

    generator = new MainGenerator(testConfigPath);
  });

  afterEach(async () => {
    // Clean up test config
    try {
      await fs.unlink(testConfigPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  describe('constructor', () => {
    test('should create a MainGenerator instance', () => {
      expect(generator).toBeDefined();
      expect(generator.configPath).toBe(testConfigPath);
      expect(generator.config).toBeNull();
      expect(generator.logger).toBeNull();
      expect(generator.components).toEqual({});
    });

    test('should initialize stats object', () => {
      expect(generator.stats).toEqual({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        startTime: null,
        endTime: null,
        processingTimes: []
      });
    });
  });

  describe('loadConfig', () => {
    test('should load configuration from file', async () => {
      await generator.loadConfig();
      
      expect(generator.config).toBeDefined();
      expect(generator.config.limits.maxRetries).toBe(3);
      expect(generator.config.limits.minWordCount).toBe(500);
      expect(generator.config.limits.maxWordCount).toBe(2000);
    });

    test('should throw error if config file not found', async () => {
      generator.configPath = 'nonexistent-config.json';
      
      await expect(generator.loadConfig()).rejects.toThrow('Failed to load configuration');
    });

    test('should throw error if config file is invalid JSON', async () => {
      const invalidConfigPath = path.join(__dirname, 'invalid-config.json');
      await fs.writeFile(invalidConfigPath, 'invalid json', 'utf-8');
      
      generator.configPath = invalidConfigPath;
      
      await expect(generator.loadConfig()).rejects.toThrow('Failed to load configuration');
      
      // Clean up
      await fs.unlink(invalidConfigPath);
    });
  });

  describe('formatDuration', () => {
    test('should format seconds correctly', () => {
      expect(generator.formatDuration(5000)).toBe('5s');
      expect(generator.formatDuration(45000)).toBe('45s');
    });

    test('should format minutes correctly', () => {
      expect(generator.formatDuration(60000)).toBe('1m 0s');
      expect(generator.formatDuration(125000)).toBe('2m 5s');
    });

    test('should format hours correctly', () => {
      expect(generator.formatDuration(3600000)).toBe('1h 0m');
      expect(generator.formatDuration(7325000)).toBe('2h 2m');
    });
  });

  describe('calculateCurriculumHash', () => {
    test('should calculate SHA256 hash of curriculum file', async () => {
      // Create a test curriculum file
      const testCurriculumPath = path.join(__dirname, 'test-curriculum.js');
      const testContent = 'export const curriculum = [];';
      await fs.writeFile(testCurriculumPath, testContent, 'utf-8');
      
      await generator.loadConfig();
      generator.config.paths.curriculumPath = testCurriculumPath;
      
      const hash = await generator.calculateCurriculumHash();
      
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64); // SHA256 produces 64 hex characters
      
      // Clean up
      await fs.unlink(testCurriculumPath);
    });

    test('should return null if curriculum file not found', async () => {
      await generator.loadConfig();
      generator.config.paths.curriculumPath = 'nonexistent-curriculum.js';
      
      const hash = await generator.calculateCurriculumHash();
      
      expect(hash).toBeNull();
    });
  });

  describe('displayProgress', () => {
    test('should display progress without errors', async () => {
      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await generator.loadConfig();
      
      // Create mock iterator with stats
      generator.components.iterator = {
        getStats: () => ({
          total: 100,
          processed: 50,
          failed: 2,
          remaining: 48
        })
      };
      
      generator.stats.successful = 48;
      generator.stats.processingTimes = [1000, 1200, 1100, 1050, 1150];
      
      const mockTopic = {
        id: 'test-1',
        title: 'Test Topic'
      };
      
      generator.displayProgress(mockTopic);
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('integration', () => {
    test('should have all required methods', () => {
      expect(typeof generator.loadConfig).toBe('function');
      expect(typeof generator.initializeComponents).toBe('function');
      expect(typeof generator.loadTopics).toBe('function');
      expect(typeof generator.calculateCurriculumHash).toBe('function');
      expect(typeof generator.processTopic).toBe('function');
      expect(typeof generator.displayProgress).toBe('function');
      expect(typeof generator.formatDuration).toBe('function');
      expect(typeof generator.processAllTopics).toBe('function');
      expect(typeof generator.verifyGeneratedContent).toBe('function');
      expect(typeof generator.generateSummaryReport).toBe('function');
      expect(typeof generator.run).toBe('function');
    });
  });

  describe('verifyGeneratedContent', () => {
    test('should verify all processed topics have entries in topicDescriptions.js', async () => {
      // Create test topicDescriptions.js file
      const testDescriptionsPath = path.join(__dirname, 'test-descriptions.js');
      const testContent = `export const topicDescriptions = {
  "topic-1": {
    title: "Topic 1",
    description: "Description 1"
  },
  "topic-2": {
    title: "Topic 2",
    description: "Description 2"
  }
};`;
      await fs.writeFile(testDescriptionsPath, testContent, 'utf-8');
      
      await generator.loadConfig();
      generator.config.paths.descriptionsPath = testDescriptionsPath;
      
      // Mock components
      const TopicDescriptionsWriter = (await import('../TopicDescriptionsWriter.js')).default;
      generator.components.writer = new TopicDescriptionsWriter(testDescriptionsPath);
      generator.components.iterator = {
        processed: new Set(['topic-1', 'topic-2'])
      };
      generator.logger = {
        info: jest.fn(),
        error: jest.fn()
      };
      
      const result = await generator.verifyGeneratedContent();
      
      expect(result.valid).toBe(true);
      expect(result.syntaxValid).toBe(true);
      expect(result.missingTopics).toEqual([]);
      expect(result.totalProcessed).toBe(2);
      expect(result.totalInFile).toBe(2);
      
      // Clean up
      await fs.unlink(testDescriptionsPath);
    });

    test('should detect missing topics in topicDescriptions.js', async () => {
      // Create test topicDescriptions.js file with only one topic
      const testDescriptionsPath = path.join(__dirname, 'test-descriptions-missing.js');
      const testContent = `export const topicDescriptions = {
  "topic-1": {
    title: "Topic 1",
    description: "Description 1"
  }
};`;
      await fs.writeFile(testDescriptionsPath, testContent, 'utf-8');
      
      await generator.loadConfig();
      generator.config.paths.descriptionsPath = testDescriptionsPath;
      
      // Mock components
      const TopicDescriptionsWriter = (await import('../TopicDescriptionsWriter.js')).default;
      generator.components.writer = new TopicDescriptionsWriter(testDescriptionsPath);
      generator.components.iterator = {
        processed: new Set(['topic-1', 'topic-2', 'topic-3'])
      };
      generator.logger = {
        info: jest.fn(),
        error: jest.fn()
      };
      
      const result = await generator.verifyGeneratedContent();
      
      expect(result.valid).toBe(false);
      expect(result.syntaxValid).toBe(true);
      expect(result.missingTopics).toEqual(['topic-2', 'topic-3']);
      expect(result.totalProcessed).toBe(3);
      expect(result.totalInFile).toBe(1);
      
      // Clean up
      await fs.unlink(testDescriptionsPath);
    });

    test('should detect invalid JavaScript syntax', async () => {
      // Create test topicDescriptions.js file with invalid syntax
      const testDescriptionsPath = path.join(__dirname, 'test-descriptions-invalid.js');
      const testContent = `export const topicDescriptions = {
  "topic-1": {
    title: "Topic 1",
    description: "Description 1"
  },
  // Missing closing brace
`;
      await fs.writeFile(testDescriptionsPath, testContent, 'utf-8');
      
      await generator.loadConfig();
      generator.config.paths.descriptionsPath = testDescriptionsPath;
      
      // Mock components
      const TopicDescriptionsWriter = (await import('../TopicDescriptionsWriter.js')).default;
      generator.components.writer = new TopicDescriptionsWriter(testDescriptionsPath);
      generator.components.iterator = {
        processed: new Set(['topic-1'])
      };
      generator.logger = {
        info: jest.fn(),
        error: jest.fn()
      };
      
      const result = await generator.verifyGeneratedContent();
      
      expect(result.valid).toBe(false);
      expect(result.syntaxValid).toBe(false);
      
      // Clean up
      await fs.unlink(testDescriptionsPath);
    });

    test('should handle verification errors gracefully', async () => {
      await generator.loadConfig();
      generator.config.paths.descriptionsPath = 'nonexistent-file.js';
      
      // Mock components
      const TopicDescriptionsWriter = (await import('../TopicDescriptionsWriter.js')).default;
      generator.components.writer = new TopicDescriptionsWriter('nonexistent-file.js');
      generator.components.iterator = {
        processed: new Set(['topic-1'])
      };
      generator.logger = {
        info: jest.fn(),
        error: jest.fn()
      };
      
      const result = await generator.verifyGeneratedContent();
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('curriculum immutability verification', () => {
    test('should detect if curriculum file is modified during processing', async () => {
      // Create a test curriculum file
      const testCurriculumPath = path.join(__dirname, 'test-curriculum-immutable.js');
      const initialContent = 'export const curriculum = [];';
      await fs.writeFile(testCurriculumPath, initialContent, 'utf-8');
      
      await generator.loadConfig();
      generator.config.paths.curriculumPath = testCurriculumPath;
      
      // Calculate initial hash
      const initialHash = await generator.calculateCurriculumHash();
      
      // Simulate modification
      const modifiedContent = 'export const curriculum = [{ id: 1 }];';
      await fs.writeFile(testCurriculumPath, modifiedContent, 'utf-8');
      
      // Calculate final hash
      const finalHash = await generator.calculateCurriculumHash();
      
      // Verify hashes are different
      expect(initialHash).not.toBe(finalHash);
      expect(initialHash).toBeDefined();
      expect(finalHash).toBeDefined();
      
      // Clean up
      await fs.unlink(testCurriculumPath);
    });

    test('should verify curriculum remains unchanged when not modified', async () => {
      // Create a test curriculum file
      const testCurriculumPath = path.join(__dirname, 'test-curriculum-unchanged.js');
      const content = 'export const curriculum = [];';
      await fs.writeFile(testCurriculumPath, content, 'utf-8');
      
      await generator.loadConfig();
      generator.config.paths.curriculumPath = testCurriculumPath;
      
      // Calculate hash twice without modification
      const hash1 = await generator.calculateCurriculumHash();
      const hash2 = await generator.calculateCurriculumHash();
      
      // Verify hashes are identical
      expect(hash1).toBe(hash2);
      expect(hash1).toBeDefined();
      
      // Clean up
      await fs.unlink(testCurriculumPath);
    });
  });
});

describe('CLIParser', () => {
  describe('parse', () => {
    test('should parse --help flag', () => {
      const parser = new CLIParser(['--help']);
      const options = parser.parse();
      
      expect(options.help).toBe(true);
    });

    test('should parse -h flag', () => {
      const parser = new CLIParser(['-h']);
      const options = parser.parse();
      
      expect(options.help).toBe(true);
    });

    test('should parse --resume flag', () => {
      const parser = new CLIParser(['--resume']);
      const options = parser.parse();
      
      expect(options.resume).toBe(true);
    });

    test('should parse --no-resume flag', () => {
      const parser = new CLIParser(['--no-resume']);
      const options = parser.parse();
      
      expect(options.resume).toBe(false);
    });

    test('should parse --dry-run flag', () => {
      const parser = new CLIParser(['--dry-run']);
      const options = parser.parse();
      
      expect(options.dryRun).toBe(true);
    });

    test('should parse --topics with single topic', () => {
      const parser = new CLIParser(['--topics', 'math-algebra']);
      const options = parser.parse();
      
      expect(options.topics).toEqual(['math-algebra']);
    });

    test('should parse --topics with multiple topics', () => {
      const parser = new CLIParser(['--topics', 'math-algebra,physics-mechanics,cs-algorithms']);
      const options = parser.parse();
      
      expect(options.topics).toEqual(['math-algebra', 'physics-mechanics', 'cs-algorithms']);
    });

    test('should parse --topics with spaces around commas', () => {
      const parser = new CLIParser(['--topics', 'math-algebra, physics-mechanics, cs-algorithms']);
      const options = parser.parse();
      
      expect(options.topics).toEqual(['math-algebra', 'physics-mechanics', 'cs-algorithms']);
    });

    test('should parse --config with path', () => {
      const parser = new CLIParser(['--config', '/path/to/config.json']);
      const options = parser.parse();
      
      expect(options.config).toBe('/path/to/config.json');
    });

    test('should parse multiple options together', () => {
      const parser = new CLIParser([
        '--config', 'custom.json',
        '--topics', 'topic1,topic2',
        '--dry-run',
        '--no-resume'
      ]);
      const options = parser.parse();
      
      expect(options.config).toBe('custom.json');
      expect(options.topics).toEqual(['topic1', 'topic2']);
      expect(options.dryRun).toBe(true);
      expect(options.resume).toBe(false);
    });

    test('should throw error if --topics has no value', () => {
      const parser = new CLIParser(['--topics']);
      
      expect(() => parser.parse()).toThrow('--topics requires a comma-separated list of topic IDs');
    });

    test('should throw error if --config has no value', () => {
      const parser = new CLIParser(['--config']);
      
      expect(() => parser.parse()).toThrow('--config requires a path to configuration file');
    });

    test('should warn about unknown options', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const parser = new CLIParser(['--unknown-option']);
      parser.parse();
      
      expect(consoleSpy).toHaveBeenCalledWith('Warning: Unknown option --unknown-option');
      
      consoleSpy.mockRestore();
    });

    test('should have default values', () => {
      const parser = new CLIParser([]);
      const options = parser.parse();
      
      expect(options.resume).toBe(true);
      expect(options.dryRun).toBe(false);
      expect(options.topics).toBeNull();
      expect(options.help).toBe(false);
      expect(options.config).toBeNull();
    });
  });

  describe('displayHelp', () => {
    test('should display help text without errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      CLIParser.displayHelp();
      
      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Verify key sections are present
      expect(output).toContain('USAGE:');
      expect(output).toContain('OPTIONS:');
      expect(output).toContain('EXAMPLES:');
      expect(output).toContain('--help');
      expect(output).toContain('--config');
      expect(output).toContain('--resume');
      expect(output).toContain('--dry-run');
      expect(output).toContain('--topics');
      
      consoleSpy.mockRestore();
    });
  });

  describe('validateOptions', () => {
    test('should validate valid options', () => {
      const options = {
        resume: true,
        dryRun: false,
        topics: ['topic1', 'topic2'],
        config: '/path/to/config.json'
      };
      
      expect(() => CLIParser.validateOptions(options)).not.toThrow();
    });

    test('should throw error for empty topics array', () => {
      const options = {
        topics: []
      };
      
      expect(() => CLIParser.validateOptions(options)).toThrow(
        '--topics must be a non-empty comma-separated list of topic IDs'
      );
    });

    test('should throw error for invalid topics format', () => {
      const options = {
        topics: ['valid-topic', '']
      };
      
      expect(() => CLIParser.validateOptions(options)).toThrow('Invalid topic ID:');
    });

    test('should throw error for non-string config', () => {
      const options = {
        config: 123
      };
      
      expect(() => CLIParser.validateOptions(options)).toThrow(
        '--config must be a valid file path'
      );
    });

    test('should warn about conflicting options', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const options = {
        dryRun: true,
        resume: false
      };
      
      CLIParser.validateOptions(options);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Warning: --no-resume has no effect in --dry-run mode'
      );
      
      consoleSpy.mockRestore();
    });
  });
});

describe('CLIMainGenerator', () => {
  let testConfigPath;
  let testConfig;
  let generator;

  beforeEach(async () => {
    // Create a test configuration
    testConfig = {
      paths: {
        curriculumPath: 'test/data/curriculum.js',
        descriptionsPath: 'test/data/topicDescriptions.js',
        progressPath: 'test/data/progress.json',
        logPath: 'test/data/generation.log'
      },
      limits: {
        maxRetries: 3,
        minWordCount: 500,
        maxWordCount: 2000,
        minLinks: 5,
        maxLinks: 10,
        parallelism: 1
      },
      api: {
        rateLimit: {
          webSearch: 10,
          sequentialThinking: 20
        },
        retryDelay: {
          initial: 100,
          multiplier: 2,
          maxDelay: 1000
        }
      },
      validation: {
        requiredSections: ['intro', 'techStack', 'processes', 'applications', 'intersections'],
        minCyrillicRatio: 0.7
      },
      logging: {
        level: 'info',
        timestampFormat: 'ISO8601',
        includeStackTrace: true
      }
    };

    // Write test config to temporary file
    testConfigPath = path.join(__dirname, 'test-config-cli.json');
    await fs.writeFile(testConfigPath, JSON.stringify(testConfig, null, 2), 'utf-8');
  });

  afterEach(async () => {
    // Clean up test config
    try {
      await fs.unlink(testConfigPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  describe('constructor', () => {
    test('should create CLIMainGenerator with options', () => {
      const options = { dryRun: true, topics: ['topic1'] };
      generator = new CLIMainGenerator(testConfigPath, options);
      
      expect(generator).toBeDefined();
      expect(generator.cliOptions).toEqual(options);
    });

    test('should create CLIMainGenerator with default options', () => {
      generator = new CLIMainGenerator(testConfigPath);
      
      expect(generator).toBeDefined();
      expect(generator.cliOptions).toEqual({});
    });
  });

  describe('filterTopics', () => {
    beforeEach(() => {
      generator = new CLIMainGenerator(testConfigPath, {});
    });

    test('should return all topics when no filter is specified', () => {
      const topics = [
        { id: 'topic1', title: 'Topic 1' },
        { id: 'topic2', title: 'Topic 2' },
        { id: 'topic3', title: 'Topic 3' }
      ];
      
      const filtered = generator.filterTopics(topics);
      
      expect(filtered).toEqual(topics);
    });

    test('should filter topics by ID', () => {
      generator.cliOptions.topics = ['topic1', 'topic3'];
      
      const topics = [
        { id: 'topic1', title: 'Topic 1' },
        { id: 'topic2', title: 'Topic 2' },
        { id: 'topic3', title: 'Topic 3' }
      ];
      
      const filtered = generator.filterTopics(topics);
      
      expect(filtered).toEqual([
        { id: 'topic1', title: 'Topic 1' },
        { id: 'topic3', title: 'Topic 3' }
      ]);
    });

    test('should warn about topics not found', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      generator.cliOptions.topics = ['topic1', 'nonexistent'];
      
      const topics = [
        { id: 'topic1', title: 'Topic 1' },
        { id: 'topic2', title: 'Topic 2' }
      ];
      
      const filtered = generator.filterTopics(topics);
      
      expect(filtered).toEqual([{ id: 'topic1', title: 'Topic 1' }]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('The following topic IDs were not found')
      );
      expect(consoleSpy).toHaveBeenCalledWith('  - nonexistent');
      
      consoleSpy.mockRestore();
    });

    test('should return empty array if no topics match', () => {
      generator.cliOptions.topics = ['nonexistent1', 'nonexistent2'];
      
      const topics = [
        { id: 'topic1', title: 'Topic 1' },
        { id: 'topic2', title: 'Topic 2' }
      ];
      
      const filtered = generator.filterTopics(topics);
      
      expect(filtered).toEqual([]);
    });
  });

  describe('dry-run mode', () => {
    test('should not write files in dry-run mode', async () => {
      generator = new CLIMainGenerator(testConfigPath, { dryRun: true });
      await generator.loadConfig();
      
      // Mock components
      generator.logger = {
        topicStart: jest.fn(),
        topicComplete: jest.fn(),
        warn: jest.fn()
      };
      
      generator.components.generator = {
        generateDescription: jest.fn().mockResolvedValue({
          title: 'Test Topic',
          description: 'Test description'
        })
      };
      
      generator.components.validator = {
        validate: jest.fn().mockReturnValue({
          valid: true,
          errors: [],
          warnings: []
        })
      };
      
      const writerUpdateSpy = jest.fn();
      generator.components.writer = {
        updateTopic: writerUpdateSpy
      };
      
      const iteratorMarkProcessedSpy = jest.fn();
      generator.components.iterator = {
        markProcessed: iteratorMarkProcessedSpy,
        markFailed: jest.fn(),
        shouldRetry: jest.fn(),
        failed: new Map()
      };
      
      const topic = { id: 'test-topic', title: 'Test Topic' };
      await generator.processTopic(topic);
      
      // Verify writer was NOT called
      expect(writerUpdateSpy).not.toHaveBeenCalled();
      
      // Verify iterator markProcessed was NOT called
      expect(iteratorMarkProcessedSpy).not.toHaveBeenCalled();
    });

    test('should still generate and validate content in dry-run mode', async () => {
      generator = new CLIMainGenerator(testConfigPath, { dryRun: true });
      await generator.loadConfig();
      
      // Mock components
      generator.logger = {
        topicStart: jest.fn(),
        topicComplete: jest.fn(),
        warn: jest.fn()
      };
      
      const generateSpy = jest.fn().mockResolvedValue({
        title: 'Test Topic',
        description: 'Test description'
      });
      
      const validateSpy = jest.fn().mockReturnValue({
        valid: true,
        errors: [],
        warnings: []
      });
      
      generator.components.generator = {
        generateDescription: generateSpy
      };
      
      generator.components.validator = {
        validate: validateSpy
      };
      
      generator.components.writer = {
        updateTopic: jest.fn()
      };
      
      generator.components.iterator = {
        markProcessed: jest.fn(),
        markFailed: jest.fn(),
        shouldRetry: jest.fn(),
        failed: new Map()
      };
      
      const topic = { id: 'test-topic', title: 'Test Topic' };
      await generator.processTopic(topic);
      
      // Verify generation and validation were called
      expect(generateSpy).toHaveBeenCalledWith(topic);
      expect(validateSpy).toHaveBeenCalled();
    });
  });

  describe('no-resume mode', () => {
    test('should not load progress when resume is false', async () => {
      generator = new CLIMainGenerator(testConfigPath, { resume: false });
      await generator.loadConfig();
      
      // Mock components
      generator.logger = {
        info: jest.fn()
      };
      
      const CurriculumReader = (await import('../CurriculumReader.js')).default;
      
      // Create a mock curriculum file with proper format expected by CurriculumReader
      const testCurriculumPath = path.join(__dirname, 'test-curriculum-no-resume.js');
      const curriculumContent = `export const curriculum = [
  {
    "id": 1,
    "category": "Test Category",
    "topics": [
      { "id": "topic1", "title": "Topic 1" }
    ]
  }
];`;
      await fs.writeFile(testCurriculumPath, curriculumContent, 'utf-8');
      
      generator.config.paths.curriculumPath = testCurriculumPath;
      generator.components.reader = new CurriculumReader(testCurriculumPath);
      
      // Create a progress file
      const testProgressPath = path.join(__dirname, 'test-progress-no-resume.json');
      await fs.writeFile(testProgressPath, JSON.stringify({
        currentIndex: 1,
        processed: ['topic1'],
        failed: {}
      }), 'utf-8');
      
      generator.config.paths.progressPath = testProgressPath;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await generator.loadTopics();
      
      // Verify "Starting fresh" message was displayed
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('Starting fresh');
      
      // Verify progress was not loaded (iterator should start from beginning)
      const stats = generator.components.iterator.getStats();
      expect(stats.processed).toBe(0);
      
      consoleSpy.mockRestore();
      
      // Clean up
      await fs.unlink(testCurriculumPath);
      await fs.unlink(testProgressPath);
    });
  });
});
