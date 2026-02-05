import TopicIterator from '../TopicIterator.js';
import fs from 'fs/promises';
import path from 'path';
import { jest } from '@jest/globals';

describe('TopicIterator', () => {
  const testProgressFile = path.join(
    process.cwd(),
    '.kiro/specs/polyglossarium-content-generator/generator/src/__tests__/test-progress.json'
  );

  const sampleTopics = [
    { id: 'topic1', title: 'Topic 1', categoryName: 'Category A', categoryId: 1 },
    { id: 'topic2', title: 'Topic 2', categoryName: 'Category A', categoryId: 1 },
    { id: 'topic3', title: 'Topic 3', categoryName: 'Category B', categoryId: 2 },
    { id: 'topic4', title: 'Topic 4', categoryName: 'Category B', categoryId: 2 },
    { id: 'topic5', title: 'Topic 5', categoryName: 'Category C', categoryId: 3 }
  ];

  // Clean up test progress file before and after tests
  beforeEach(async () => {
    try {
      await fs.unlink(testProgressFile);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    try {
      await fs.unlink(testProgressFile);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  describe('constructor', () => {
    test('should create iterator with valid topics and progress file', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      expect(iterator.topics).toBe(sampleTopics);
      expect(iterator.progressFile).toBe(testProgressFile);
      expect(iterator.currentIndex).toBe(0);
      expect(iterator.processed).toBeInstanceOf(Set);
      expect(iterator.processed.size).toBe(0);
      expect(iterator.failed).toBeInstanceOf(Map);
      expect(iterator.failed.size).toBe(0);
    });

    test('should throw error if topics is not an array', () => {
      expect(() => {
        new TopicIterator('not an array', testProgressFile);
      }).toThrow('Topics must be an array');
    });

    test('should throw error if progress file is not provided', () => {
      expect(() => {
        new TopicIterator(sampleTopics, '');
      }).toThrow('Progress file path must be a non-empty string');
    });

    test('should throw error if progress file is not a string', () => {
      expect(() => {
        new TopicIterator(sampleTopics, null);
      }).toThrow('Progress file path must be a non-empty string');
    });
  });

  describe('next()', () => {
    test('should return first topic on first call', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      const topic = iterator.next();
      
      expect(topic).toEqual(sampleTopics[0]);
      expect(iterator.currentIndex).toBe(0);
    });

    test('should return null when all topics are processed', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      // Mark all topics as processed
      for (const topic of sampleTopics) {
        iterator.processed.add(topic.id);
      }
      
      const topic = iterator.next();
      expect(topic).toBeNull();
    });

    test('should skip already processed topics', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      // Mark first two topics as processed
      iterator.processed.add('topic1');
      iterator.processed.add('topic2');
      
      const topic = iterator.next();
      expect(topic).toEqual(sampleTopics[2]); // Should return topic3
    });

    test('should skip topics that failed max times', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      // Mark first topic as failed 3 times
      iterator.failed.set('topic1', 3);
      
      const topic = iterator.next();
      expect(topic).toEqual(sampleTopics[1]); // Should return topic2
    });

    test('should return topic that failed but can be retried', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      // Mark first topic as failed 2 times (can still retry)
      iterator.failed.set('topic1', 2);
      
      const topic = iterator.next();
      expect(topic).toEqual(sampleTopics[0]); // Should return topic1 for retry
    });
  });

  describe('markProcessed()', () => {
    test('should add topic to processed set', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      await iterator.markProcessed('topic1');
      
      expect(iterator.processed.has('topic1')).toBe(true);
      expect(iterator.processed.size).toBe(1);
    });

    test('should increment currentIndex', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      expect(iterator.currentIndex).toBe(0);
      await iterator.markProcessed('topic1');
      expect(iterator.currentIndex).toBe(1);
    });

    test('should remove topic from failed map if present', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      iterator.failed.set('topic1', 2);
      await iterator.markProcessed('topic1');
      
      expect(iterator.failed.has('topic1')).toBe(false);
    });

    test('should save progress to disk', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      await iterator.markProcessed('topic1');
      
      // Verify file was created
      const fileContent = await fs.readFile(testProgressFile, 'utf-8');
      const progress = JSON.parse(fileContent);
      
      expect(progress.processed).toContain('topic1');
      expect(progress.currentIndex).toBe(1);
    });

    test('should throw error if topicId is not a string', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      await expect(iterator.markProcessed(null)).rejects.toThrow(
        'Topic ID must be a non-empty string'
      );
    });

    test('should throw error if topicId is empty', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      await expect(iterator.markProcessed('')).rejects.toThrow(
        'Topic ID must be a non-empty string'
      );
    });
  });

  describe('markFailed()', () => {
    test('should increment failure count', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      await iterator.markFailed('topic1', new Error('Test error'));
      
      expect(iterator.failed.get('topic1')).toBe(1);
    });

    test('should increment failure count on multiple failures', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      await iterator.markFailed('topic1', new Error('Error 1'));
      await iterator.markFailed('topic1', new Error('Error 2'));
      await iterator.markFailed('topic1', new Error('Error 3'));
      
      expect(iterator.failed.get('topic1')).toBe(3);
    });

    test('should not increment currentIndex if can retry', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      expect(iterator.currentIndex).toBe(0);
      await iterator.markFailed('topic1', new Error('Test error'));
      expect(iterator.currentIndex).toBe(0); // Should stay at 0 for retry
    });

    test('should increment currentIndex after max retries', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      expect(iterator.currentIndex).toBe(0);
      
      // Fail 3 times
      await iterator.markFailed('topic1', new Error('Error 1'));
      await iterator.markFailed('topic1', new Error('Error 2'));
      await iterator.markFailed('topic1', new Error('Error 3'));
      
      expect(iterator.currentIndex).toBe(1); // Should move to next after 3rd failure
    });

    test('should save progress to disk', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      await iterator.markFailed('topic1', new Error('Test error'));
      
      // Verify file was created
      const fileContent = await fs.readFile(testProgressFile, 'utf-8');
      const progress = JSON.parse(fileContent);
      
      expect(progress.failed.topic1).toBe(1);
    });

    test('should throw error if topicId is not a string', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      await expect(iterator.markFailed(null, new Error('Test'))).rejects.toThrow(
        'Topic ID must be a non-empty string'
      );
    });
  });

  describe('shouldRetry()', () => {
    test('should return true if no failures', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      expect(iterator.shouldRetry('topic1')).toBe(true);
    });

    test('should return true if attempts < 3', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      iterator.failed.set('topic1', 1);
      expect(iterator.shouldRetry('topic1')).toBe(true);
      
      iterator.failed.set('topic1', 2);
      expect(iterator.shouldRetry('topic1')).toBe(true);
    });

    test('should return false if attempts >= 3', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      iterator.failed.set('topic1', 3);
      expect(iterator.shouldRetry('topic1')).toBe(false);
      
      iterator.failed.set('topic1', 4);
      expect(iterator.shouldRetry('topic1')).toBe(false);
    });
  });

  describe('getStats()', () => {
    test('should return correct stats for fresh iterator', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      const stats = iterator.getStats();
      
      expect(stats.total).toBe(5);
      expect(stats.processed).toBe(0);
      expect(stats.failed).toBe(0);
      expect(stats.remaining).toBe(5);
    });

    test('should return correct stats with processed topics', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      iterator.processed.add('topic1');
      iterator.processed.add('topic2');
      
      const stats = iterator.getStats();
      
      expect(stats.total).toBe(5);
      expect(stats.processed).toBe(2);
      expect(stats.failed).toBe(0);
      expect(stats.remaining).toBe(3);
    });

    test('should return correct stats with failed topics', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      iterator.failed.set('topic1', 3); // Permanently failed
      iterator.failed.set('topic2', 2); // Can still retry
      
      const stats = iterator.getStats();
      
      expect(stats.total).toBe(5);
      expect(stats.processed).toBe(0);
      expect(stats.failed).toBe(1); // Only permanently failed
      expect(stats.remaining).toBe(4);
    });

    test('should return correct stats with mixed state', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      iterator.processed.add('topic1');
      iterator.processed.add('topic2');
      iterator.failed.set('topic3', 3); // Permanently failed
      
      const stats = iterator.getStats();
      
      expect(stats.total).toBe(5);
      expect(stats.processed).toBe(2);
      expect(stats.failed).toBe(1);
      expect(stats.remaining).toBe(2);
    });
  });

  describe('getFailedTopics()', () => {
    test('should return empty array if no failures', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      const failed = iterator.getFailedTopics();
      
      expect(failed).toEqual([]);
    });

    test('should return only permanently failed topics', () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      iterator.failed.set('topic1', 3); // Permanently failed
      iterator.failed.set('topic2', 2); // Can still retry
      iterator.failed.set('topic3', 3); // Permanently failed
      
      const failed = iterator.getFailedTopics();
      
      expect(failed).toHaveLength(2);
      expect(failed).toContain('topic1');
      expect(failed).toContain('topic3');
      expect(failed).not.toContain('topic2');
    });
  });

  describe('saveProgress() and loadProgress()', () => {
    test('should save and load progress correctly', async () => {
      const iterator1 = new TopicIterator(sampleTopics, testProgressFile);
      
      // Set some state
      iterator1.currentIndex = 2;
      iterator1.processed.add('topic1');
      iterator1.processed.add('topic2');
      iterator1.failed.set('topic3', 2);
      
      // Save progress
      await iterator1.saveProgress();
      
      // Create new iterator and load progress
      const iterator2 = new TopicIterator(sampleTopics, testProgressFile);
      const loaded = await iterator2.loadProgress();
      
      expect(loaded).toBe(true);
      expect(iterator2.currentIndex).toBe(2);
      expect(iterator2.processed.has('topic1')).toBe(true);
      expect(iterator2.processed.has('topic2')).toBe(true);
      expect(iterator2.processed.size).toBe(2);
      expect(iterator2.failed.get('topic3')).toBe(2);
    });

    test('should return false if progress file does not exist', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      const loaded = await iterator.loadProgress();
      
      expect(loaded).toBe(false);
    });

    test('should throw error if progress file is corrupted', async () => {
      // Write invalid JSON to progress file
      await fs.mkdir(path.dirname(testProgressFile), { recursive: true });
      await fs.writeFile(testProgressFile, 'invalid json', 'utf-8');
      
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      await expect(iterator.loadProgress()).rejects.toThrow(
        'Failed to load progress file'
      );
    });

    test('should include timestamp in saved progress', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      await iterator.saveProgress();
      
      const fileContent = await fs.readFile(testProgressFile, 'utf-8');
      const progress = JSON.parse(fileContent);
      
      expect(progress.timestamp).toBeDefined();
      expect(new Date(progress.timestamp).toISOString()).toBe(progress.timestamp);
    });

    test('should include stats in saved progress', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      iterator.processed.add('topic1');
      iterator.failed.set('topic2', 3);
      
      await iterator.saveProgress();
      
      const fileContent = await fs.readFile(testProgressFile, 'utf-8');
      const progress = JSON.parse(fileContent);
      
      expect(progress.stats).toBeDefined();
      expect(progress.stats.total).toBe(5);
      expect(progress.stats.processed).toBe(1);
      expect(progress.stats.failed).toBe(1);
    });
  });

  describe('reset()', () => {
    test('should reset all state', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      // Set some state
      iterator.currentIndex = 3;
      iterator.processed.add('topic1');
      iterator.processed.add('topic2');
      iterator.failed.set('topic3', 2);
      
      // Reset
      await iterator.reset();
      
      expect(iterator.currentIndex).toBe(0);
      expect(iterator.processed.size).toBe(0);
      expect(iterator.failed.size).toBe(0);
    });

    test('should save reset state to disk', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      // Set some state and save
      iterator.processed.add('topic1');
      await iterator.saveProgress();
      
      // Reset
      await iterator.reset();
      
      // Load and verify
      const iterator2 = new TopicIterator(sampleTopics, testProgressFile);
      await iterator2.loadProgress();
      
      expect(iterator2.currentIndex).toBe(0);
      expect(iterator2.processed.size).toBe(0);
      expect(iterator2.failed.size).toBe(0);
    });
  });

  describe('integration: full iteration cycle', () => {
    test('should iterate through all topics successfully', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      const processedTopics = [];
      
      let topic = iterator.next();
      while (topic !== null) {
        processedTopics.push(topic);
        await iterator.markProcessed(topic.id);
        topic = iterator.next();
      }
      
      expect(processedTopics).toHaveLength(5);
      expect(iterator.processed.size).toBe(5);
      
      const stats = iterator.getStats();
      expect(stats.processed).toBe(5);
      expect(stats.remaining).toBe(0);
    });

    test('should handle failures and retries correctly', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      // Process first topic successfully
      let topic = iterator.next();
      await iterator.markProcessed(topic.id);
      
      // Fail second topic twice, then succeed
      topic = iterator.next();
      expect(topic.id).toBe('topic2');
      await iterator.markFailed(topic.id, new Error('Error 1'));
      
      topic = iterator.next();
      expect(topic.id).toBe('topic2'); // Should retry
      await iterator.markFailed(topic.id, new Error('Error 2'));
      
      topic = iterator.next();
      expect(topic.id).toBe('topic2'); // Should retry again
      await iterator.markProcessed(topic.id);
      
      // Continue with remaining topics
      topic = iterator.next();
      expect(topic.id).toBe('topic3');
    });

    test('should skip permanently failed topics', async () => {
      const iterator = new TopicIterator(sampleTopics, testProgressFile);
      
      // Fail first topic 3 times
      let topic = iterator.next();
      expect(topic.id).toBe('topic1');
      
      await iterator.markFailed(topic.id, new Error('Error 1'));
      topic = iterator.next();
      expect(topic.id).toBe('topic1');
      
      await iterator.markFailed(topic.id, new Error('Error 2'));
      topic = iterator.next();
      expect(topic.id).toBe('topic1');
      
      await iterator.markFailed(topic.id, new Error('Error 3'));
      
      // Should move to next topic
      topic = iterator.next();
      expect(topic.id).toBe('topic2');
      
      const stats = iterator.getStats();
      expect(stats.failed).toBe(1);
      expect(stats.processed).toBe(0);
    });

    test('should resume from saved progress', async () => {
      // First session: process 2 topics
      const iterator1 = new TopicIterator(sampleTopics, testProgressFile);
      
      let topic = iterator1.next();
      await iterator1.markProcessed(topic.id);
      
      topic = iterator1.next();
      await iterator1.markProcessed(topic.id);
      
      // Second session: load and continue
      const iterator2 = new TopicIterator(sampleTopics, testProgressFile);
      await iterator2.loadProgress();
      
      expect(iterator2.processed.size).toBe(2);
      
      topic = iterator2.next();
      expect(topic.id).toBe('topic3'); // Should continue from topic3
      
      // Process remaining topics
      while (topic !== null) {
        await iterator2.markProcessed(topic.id);
        topic = iterator2.next();
      }
      
      const stats = iterator2.getStats();
      expect(stats.processed).toBe(5);
      expect(stats.remaining).toBe(0);
    });
  });
});
