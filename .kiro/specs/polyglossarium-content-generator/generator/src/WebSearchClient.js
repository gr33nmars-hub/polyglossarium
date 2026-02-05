/**
 * WebSearchClient - Handles web search operations for finding authoritative sources
 * 
 * This class handles:
 * - Searching for sources using exa-search MCP
 * - Building search queries in Russian and English
 * - Filtering and prioritizing results by quality
 * - Rate limiting with exponential backoff
 * - Error handling for API failures
 * 
 * Implements Requirements: 3.1, 3.2, 3.4, 6.2, 6.5
 */
class WebSearchClient {
  /**
   * Creates a new WebSearchClient instance
   * @param {Object} config - Configuration object with rate limits and retry settings
   */
  constructor(config = {}) {
    this.config = {
      rateLimit: config.rateLimit || 10, // requests per minute
      retryDelay: {
        initial: config.retryDelay?.initial || 1000,
        multiplier: config.retryDelay?.multiplier || 2,
        maxDelay: config.retryDelay?.maxDelay || 30000
      }
    };
    
    // Track request timestamps for rate limiting
    this.requestTimestamps = [];
    
    // Track last request time for rate limiting
    this.lastRequestTime = 0;
  }

  /**
   * Searches for sources using exa-search MCP
   * Implements rate limiting and error handling
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {number} options.numResults - Number of results to return (default: 10)
   * @param {string} options.type - Search type: 'neural' or 'keyword' (default: 'neural')
   * @returns {Promise<Array<SearchResult>>} Array of search results
   * @throws {Error} If search fails after retries
   * 
   * Implements Requirements: 3.1, 6.2, 6.5
   */
  async search(query, options = {}) {
    if (!query || typeof query !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    const numResults = options.numResults || 10;
    const searchType = options.type || 'neural';

    // Apply rate limiting
    await this.applyRateLimit();

    // Attempt search with retries
    let lastError;
    let retryDelay = this.config.retryDelay.initial;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Call exa-search MCP
        // Note: This is a placeholder for the actual MCP call
        // In production, this would use the Kiro Powers API or MCP client
        const results = await this.callExaSearchMCP(query, {
          numResults,
          type: searchType
        });

        // Record successful request
        this.recordRequest();

        return results;
      } catch (error) {
        lastError = error;

        // Check if error is retryable
        if (this.isRetryableError(error)) {
          // Wait before retrying with exponential backoff
          await this.sleep(retryDelay);
          retryDelay = Math.min(
            retryDelay * this.config.retryDelay.multiplier,
            this.config.retryDelay.maxDelay
          );
        } else {
          // Non-retryable error, throw immediately
          throw error;
        }
      }
    }

    // All retries exhausted
    throw new Error(`Search failed after 3 attempts: ${lastError.message}`);
  }

  /**
   * Builds search queries for a topic in Russian and English
   * Generates multiple query variations with different keywords
   * 
   * @param {Topic} topic - Topic object with id, title, and categoryName
   * @returns {Array<string>} Array of search queries
   * 
   * Implements Requirement 3.1: Generate search queries
   */
  buildQueries(topic) {
    if (!topic || !topic.title) {
      throw new Error('Topic must have a title');
    }

    const queries = [];
    const title = topic.title;
    const category = topic.categoryName || '';

    // Russian queries with different keywords
    queries.push(`${title} документация`);
    queries.push(`${title} руководство`);
    queries.push(`${title} учебник`);
    
    if (category) {
      queries.push(`${title} ${category} обучение`);
    }

    // English queries with different keywords
    queries.push(`${title} documentation`);
    queries.push(`${title} tutorial`);
    queries.push(`${title} guide`);
    queries.push(`${title} official docs`);
    
    if (category) {
      queries.push(`${title} ${category} learning`);
    }

    // Academic queries
    queries.push(`${title} academic`);
    queries.push(`${title} research`);

    return queries;
  }

  /**
   * Filters and prioritizes search results by quality
   * Prioritizes official documentation and academic sources
   * 
   * @param {Array<SearchResult>} results - Array of search results
   * @returns {Array<SearchResult>} Filtered and sorted results
   * 
   * Implements Requirement 3.2: Prioritize official docs and academic sources
   */
  filterByQuality(results) {
    if (!Array.isArray(results)) {
      throw new Error('Results must be an array');
    }

    // Assign quality scores to each result
    const scoredResults = results.map(result => {
      let score = 0;
      const url = (result.url || '').toLowerCase();
      const title = (result.title || '').toLowerCase();
      const snippet = (result.snippet || '').toLowerCase();

      // Official documentation indicators (highest priority)
      if (url.includes('docs.') || url.includes('/docs/') || url.includes('/documentation/')) {
        score += 100;
      }
      if (url.includes('official') || title.includes('official')) {
        score += 80;
      }

      // Academic sources (high priority)
      if (url.includes('.edu') || url.includes('academic')) {
        score += 90;
      }
      if (url.includes('scholar') || url.includes('research')) {
        score += 85;
      }
      if (url.includes('arxiv') || url.includes('ieee') || url.includes('acm')) {
        score += 95;
      }

      // Educational platforms (medium-high priority)
      if (url.includes('tutorial') || title.includes('tutorial')) {
        score += 70;
      }
      if (url.includes('guide') || title.includes('guide')) {
        score += 65;
      }
      if (url.includes('learn') || title.includes('learn')) {
        score += 60;
      }

      // Well-known educational sites
      if (url.includes('wikipedia.org')) {
        score += 75;
      }
      if (url.includes('coursera') || url.includes('edx') || url.includes('udacity')) {
        score += 70;
      }
      if (url.includes('mdn.') || url.includes('w3schools')) {
        score += 80;
      }

      // GitHub repositories (medium priority)
      if (url.includes('github.com')) {
        score += 50;
      }

      // Penalize low-quality indicators
      if (url.includes('blog') && !url.includes('official')) {
        score -= 20;
      }
      if (url.includes('forum') || url.includes('stackoverflow')) {
        score -= 10; // Still useful but lower priority
      }
      if (url.includes('ads') || url.includes('promo')) {
        score -= 50;
      }

      // Boost if snippet contains educational keywords
      if (snippet.includes('documentation') || snippet.includes('документация')) {
        score += 10;
      }
      if (snippet.includes('tutorial') || snippet.includes('руководство')) {
        score += 8;
      }

      return {
        ...result,
        qualityScore: score
      };
    });

    // Sort by quality score (descending)
    scoredResults.sort((a, b) => b.qualityScore - a.qualityScore);

    // Filter out very low quality results (negative scores)
    const filtered = scoredResults.filter(result => result.qualityScore >= 0);

    return filtered;
  }

  /**
   * Applies rate limiting before making a request
   * Ensures we don't exceed the configured rate limit
   * 
   * @returns {Promise<void>}
   * 
   * Implements Requirement 6.5: Handle API rate limits gracefully
   */
  async applyRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );

    // Check if we've hit the rate limit
    if (this.requestTimestamps.length >= this.config.rateLimit) {
      // Calculate how long to wait
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestTimestamp);

      if (waitTime > 0) {
        // Wait until we can make another request
        await this.sleep(waitTime);
      }
    }

    // Also ensure minimum delay between requests (100ms)
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < 100) {
      await this.sleep(100 - timeSinceLastRequest);
    }
  }

  /**
   * Records a successful request for rate limiting
   */
  recordRequest() {
    const now = Date.now();
    this.requestTimestamps.push(now);
    this.lastRequestTime = now;
  }

  /**
   * Checks if an error is retryable
   * 
   * @param {Error} error - Error to check
   * @returns {boolean} true if error is retryable
   * 
   * Implements Requirement 6.5: Handle API errors gracefully
   */
  isRetryableError(error) {
    if (!error) return false;

    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';

    // Rate limit errors are retryable
    if (message.includes('rate limit') || code === 'rate_limit_exceeded') {
      return true;
    }

    // Timeout errors are retryable
    if (message.includes('timeout') || code === 'etimedout' || code === 'esockettimedout') {
      return true;
    }

    // Network errors are retryable
    if (message.includes('network') || code === 'econnreset' || code === 'econnrefused') {
      return true;
    }

    // Server errors (5xx) are retryable
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return true;
    }

    // Client errors (4xx) are generally not retryable
    if (message.includes('400') || message.includes('401') || message.includes('403') || message.includes('404')) {
      return false;
    }

    // Default to not retryable for unknown errors
    return false;
  }

  /**
   * Placeholder for actual exa-search MCP call
   * In production, this would use the Kiro Powers API or MCP client
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array<SearchResult>>} Search results
   * @private
   */
  async callExaSearchMCP(query, options) {
    // This is a placeholder implementation
    // In production, this would call the actual exa-search MCP
    // For now, we'll throw an error to indicate it needs to be implemented
    throw new Error('exa-search MCP integration not yet implemented. This method should be replaced with actual MCP call.');
  }

  /**
   * Sleep utility for delays
   * 
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default WebSearchClient;
