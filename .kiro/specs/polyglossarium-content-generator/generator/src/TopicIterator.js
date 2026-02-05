import fs from 'fs/promises';
import path from 'path';

/**
 * TopicIterator - Manages iteration through topics with progress tracking
 * 
 * This class handles:
 * - Iterating through topics sequentially
 * - Tracking processed topics to avoid duplicates
 * - Persisting progress to disk for recovery
 * - Managing retry attempts for failed topics
 * - Providing progress statistics
 * 
 * Implements Requirements: 1.3, 7.2, 7.3, 7.4, 9.1, 9.4
 */
class TopicIterator {
  /**
   * Creates a new TopicIterator instance
   * @param {Array<Topic>} topics - Array of topics to iterate through
   * @param {string} progressFile - Path to progress file for persistence
   */
  constructor(topics, progressFile) {
    if (!Array.isArray(topics)) {
      throw new Error('Topics must be an array');
    }
    
    if (!progressFile || typeof progressFile !== 'string') {
      throw new Error('Progress file path must be a non-empty string');
    }
    
    this.topics = topics;
    this.progressFile = progressFile;
    this.currentIndex = 0;
    this.processed = new Set();
    this.failed = new Map(); // Map of topicId -> attempt count
  }

  /**
   * Loads saved progress from disk
   * Restores currentIndex, processed set, and failed map
   * 
   * @returns {Promise<void>}
   * @throws {Error} If progress file exists but cannot be parsed
   * 
   * Implements Requirement 7.3: Resume from last saved state
   */
  async loadProgress() {
    try {
      const fileContent = await fs.readFile(this.progressFile, 'utf-8');
      const progress = JSON.parse(fileContent);
      
      // Restore state from saved progress
      this.currentIndex = progress.currentIndex || 0;
      this.processed = new Set(progress.processed || []);
      
      // Restore failed map from object
      this.failed = new Map();
      if (progress.failed && typeof progress.failed === 'object') {
        for (const [topicId, attempts] of Object.entries(progress.failed)) {
          this.failed.set(topicId, attempts);
        }
      }
      
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, start fresh
        return false;
      }
      
      // File exists but couldn't be parsed
      throw new Error(`Failed to load progress file: ${error.message}`);
    }
  }

  /**
   * Saves current progress to disk
   * Persists currentIndex, processed set, and failed map
   * 
   * @returns {Promise<void>}
   * @throws {Error} If progress cannot be saved
   * 
   * Implements Requirement 7.2: Save progress after each successful topic
   */
  async saveProgress() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.progressFile);
      await fs.mkdir(dir, { recursive: true });
      
      // Convert Set and Map to serializable formats
      const progress = {
        currentIndex: this.currentIndex,
        processed: Array.from(this.processed),
        failed: Object.fromEntries(this.failed),
        timestamp: new Date().toISOString(),
        stats: this.getStats()
      };
      
      // Write to file with pretty formatting
      await fs.writeFile(
        this.progressFile,
        JSON.stringify(progress, null, 2),
        'utf-8'
      );
    } catch (error) {
      throw new Error(`Failed to save progress: ${error.message}`);
    }
  }

  /**
   * Returns the next unprocessed topic
   * Skips topics that are already processed
   * 
   * @returns {Topic|null} Next topic to process, or null if all done
   * 
   * Implements Requirement 1.3: Track processed topics to avoid duplicates
   */
  next() {
    // Find next unprocessed topic
    while (this.currentIndex < this.topics.length) {
      const topic = this.topics[this.currentIndex];
      
      // Skip if already processed
      if (this.processed.has(topic.id)) {
        this.currentIndex++;
        continue;
      }
      
      // Skip if failed too many times and shouldn't retry
      if (this.failed.has(topic.id) && !this.shouldRetry(topic.id)) {
        this.currentIndex++;
        continue;
      }
      
      // Return this topic (don't increment index yet)
      return topic;
    }
    
    // All topics processed
    return null;
  }

  /**
   * Marks a topic as successfully processed
   * Adds to processed set and saves progress
   * 
   * @param {string} topicId - ID of the topic
   * @returns {Promise<void>}
   * 
   * Implements Requirement 1.3: Track processed topics
   */
  async markProcessed(topicId) {
    if (!topicId || typeof topicId !== 'string') {
      throw new Error('Topic ID must be a non-empty string');
    }
    
    this.processed.add(topicId);
    
    // Remove from failed if it was there
    if (this.failed.has(topicId)) {
      this.failed.delete(topicId);
    }
    
    // Move to next topic
    this.currentIndex++;
    
    // Save progress after successful processing
    await this.saveProgress();
  }

  /**
   * Marks a topic as failed
   * Increments failure count and saves progress
   * 
   * @param {string} topicId - ID of the topic
   * @param {Error} error - Error that occurred
   * @returns {Promise<void>}
   * 
   * Implements Requirement 7.1: Log errors with topic ID
   */
  async markFailed(topicId, error) {
    if (!topicId || typeof topicId !== 'string') {
      throw new Error('Topic ID must be a non-empty string');
    }
    
    // Increment failure count
    const currentAttempts = this.failed.get(topicId) || 0;
    this.failed.set(topicId, currentAttempts + 1);
    
    // If max retries exceeded, move to next topic
    if (!this.shouldRetry(topicId)) {
      this.currentIndex++;
    }
    
    // Save progress after failure
    await this.saveProgress();
  }

  /**
   * Checks if a topic should be retried
   * Returns true if attempts < 3
   * 
   * @param {string} topicId - ID of the topic
   * @returns {boolean} true if should retry, false otherwise
   * 
   * Implements Requirement 7.4: Retry failed topics up to 3 times
   */
  shouldRetry(topicId) {
    const attempts = this.failed.get(topicId) || 0;
    return attempts < 3;
  }

  /**
   * Returns progress statistics
   * 
   * @returns {Object} Statistics object with counts
   * 
   * Implements Requirement 9.1, 9.4: Progress reporting
   */
  getStats() {
    // Count permanently failed topics (attempts >= 3)
    let permanentlyFailed = 0;
    for (const [topicId, attempts] of this.failed.entries()) {
      if (attempts >= 3) {
        permanentlyFailed++;
      }
    }
    
    return {
      total: this.topics.length,
      processed: this.processed.size,
      failed: permanentlyFailed,
      remaining: this.topics.length - this.processed.size - permanentlyFailed
    };
  }

  /**
   * Returns list of permanently failed topic IDs
   * 
   * @returns {Array<string>} Array of topic IDs that failed after max retries
   * 
   * Implements Requirement 7.5: Report failed topics
   */
  getFailedTopics() {
    const failedTopics = [];
    
    for (const [topicId, attempts] of this.failed.entries()) {
      if (attempts >= 3) {
        failedTopics.push(topicId);
      }
    }
    
    return failedTopics;
  }

  /**
   * Resets the iterator to start from beginning
   * Clears all progress
   * 
   * @returns {Promise<void>}
   */
  async reset() {
    this.currentIndex = 0;
    this.processed.clear();
    this.failed.clear();
    await this.saveProgress();
  }
}

export default TopicIterator;
