# Implementation Plan: Polyglossarium Content Generator

## Overview

This implementation plan creates a Node.js-based content generator that processes all 280+ topics from curriculum.js and generates comprehensive, structured articles in Russian for each topic. The system uses web search for finding authoritative sources and AI tools for content generation, with robust error handling and progress tracking.

## Tasks

- [x] 1. Set up project structure and configuration
  - Create generator directory structure under `.kiro/specs/polyglossarium-content-generator/`
  - Create configuration file with paths, limits, and API settings
  - Set up logging infrastructure
  - Initialize progress tracking file
  - _Requirements: 6.1, 7.2, 9.2_

- [ ] 2. Implement CurriculumReader component
  - [x] 2.1 Create CurriculumReader class
    - Implement readCurriculum() to parse curriculum.js
    - Implement extractTopics() to flatten category structure
    - Add error handling for file not found and parse errors
    - _Requirements: 1.1, 1.2, 5.1_
  
  - [ ]* 2.2 Write property test for curriculum reading
    - **Property 10: Data Extraction Completeness**
    - **Validates: Requirements 5.1**
    - Generate random curriculum structures
    - Verify all topic IDs and titles are extracted without loss
  
  - [ ]* 2.3 Write unit tests for CurriculumReader
    - Test with valid curriculum structure
    - Test with empty curriculum
    - Test with malformed data
    - _Requirements: 5.1_

- [ ] 3. Implement TopicIterator component
  - [x] 3.1 Create TopicIterator class
    - Implement constructor with topics and progress file path
    - Implement loadProgress() to restore state from disk
    - Implement saveProgress() to persist state
    - Implement next() to get next unprocessed topic
    - Implement markProcessed() and markFailed()
    - Implement shouldRetry() with 3-attempt limit
    - Implement getStats() for progress reporting
    - _Requirements: 1.3, 7.2, 7.3, 7.4, 9.1, 9.4_
  
  - [ ]* 3.2 Write property test for no duplicate processing
    - **Property 2: No Duplicate Processing**
    - **Validates: Requirements 1.3**
    - Run iterator through random topic lists
    - Verify processed set has no duplicates
  
  - [ ]* 3.3 Write property test for progress persistence
    - **Property 15: Progress Persistence**
    - **Validates: Requirements 7.2**
    - Process random topics, save progress after each
    - Verify progress file updated correctly
  
  - [ ]* 3.4 Write property test for recovery from interruption
    - **Property 16: Recovery from Interruption**
    - **Validates: Requirements 7.3**
    - Interrupt processing, restart iterator
    - Verify no reprocessing of completed topics
  
  - [ ]* 3.5 Write property test for retry limit
    - **Property 17: Retry Limit**
    - **Validates: Requirements 7.4**
    - Inject failures for random topics
    - Verify exactly 3 retry attempts per topic

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement WebSearchClient component
  - [x] 5.1 Create WebSearchClient class
    - Implement search() to call exa-search MCP
    - Implement buildQueries() to generate search queries in Russian and English
    - Implement filterByQuality() to prioritize official docs and academic sources
    - Add rate limiting with exponential backoff
    - Add error handling for API errors
    - _Requirements: 3.1, 3.2, 3.4, 6.2, 6.5_
  
  - [ ]* 5.2 Write property test for source quality prioritization
    - **Property 6: Source Quality Prioritization**
    - **Validates: Requirements 3.2**
    - Generate random search results with different types
    - Verify official docs rank higher than other sources
  
  - [ ]* 5.3 Write property test for graceful error handling
    - **Property 14: Graceful Error Handling**
    - **Validates: Requirements 6.5**
    - Inject API errors (rate limit, timeout)
    - Verify system catches errors and continues
  
  - [ ]* 5.4 Write unit tests for WebSearchClient
    - Test query building for different topics
    - Test filtering logic
    - Test rate limiting behavior
    - _Requirements: 3.1, 3.2, 6.5_

- [ ] 6. Implement ContentGenerator component
  - [x] 6.1 Create ContentGenerator class
    - Implement generateDescription() main method
    - Implement planArticle() using sequential thinking
    - Implement findSources() using WebSearchClient
    - Implement generateIntro() for introductory paragraph
    - Implement generateTechStack() for technology section
    - Implement generateProcesses() for processes section
    - Implement generateApplications() for applications section
    - Implement generateIntersections() for intersections section
    - Implement formatLinks() to create [text](url) format
    - Implement assembleDescription() to combine sections
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.3, 3.5, 4.1, 6.1, 6.3_
  
  - [ ]* 6.2 Write property test for complete article structure
    - **Property 5: Complete Article Structure**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.1**
    - Generate articles for random topics
    - Verify all five sections present in correct order
  
  - [ ]* 6.3 Write property test for link count constraint
    - **Property 7: Link Count Constraint**
    - **Validates: Requirements 3.3**
    - Generate articles for random topics
    - Verify 5-10 links per article
  
  - [ ]* 6.4 Write property test for link format consistency
    - **Property 8: Link Format Consistency**
    - **Validates: Requirements 3.5, 5.3, 8.3**
    - Generate articles for random topics
    - Verify all links match [text](url) format with valid URLs
  
  - [ ]* 6.5 Write property test for Russian language content
    - **Property 9: Russian Language Content**
    - **Validates: Requirements 4.1, 8.4**
    - Generate articles for random topics
    - Verify Cyrillic characters comprise ≥70% of alphabetic characters
  
  - [ ]* 6.6 Write property test for tool usage verification
    - **Property 13: Tool Usage Verification**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
    - Mock tools, generate content
    - Verify Web_Search, Sequential_Thinking, and validation are called

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement ContentValidator component
  - [x] 8.1 Create ContentValidator class
    - Implement validate() main method
    - Implement hasAllSections() to check section presence
    - Implement countWords() for word count validation
    - Implement validateLinks() for link format checking
    - Implement isRussian() for language detection
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 8.2 Write property test for word count constraint
    - **Property 19: Word Count Constraint**
    - **Validates: Requirements 8.2**
    - Generate articles with random content
    - Verify word count between 500-2000
  
  - [ ]* 8.3 Write property test for validation flagging
    - **Property 20: Validation Flagging**
    - **Validates: Requirements 8.5**
    - Generate articles with intentional validation failures
    - Verify failed articles are flagged for manual review
  
  - [ ]* 8.4 Write unit tests for ContentValidator
    - Test section detection logic
    - Test word counting with various inputs
    - Test link format validation
    - Test language detection
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 9. Implement TopicDescriptionsWriter component
  - [x] 9.1 Create TopicDescriptionsWriter class
    - Implement createBackup() to backup original file
    - Implement readExisting() to parse current topicDescriptions.js
    - Implement updateTopic() to add/update single topic
    - Implement saveAll() to write complete file
    - Implement validateSyntax() to check JavaScript validity
    - Add proper escaping for quotes and special characters
    - _Requirements: 5.2, 5.4, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 9.2 Write property test for output format validity
    - **Property 11: Output Format Validity**
    - **Validates: Requirements 5.2, 5.4, 10.2, 10.5**
    - Generate random descriptions
    - Verify output conforms to {id: {title, description}} structure
    - Verify valid JavaScript syntax
  
  - [ ]* 9.3 Write property test for character escaping
    - **Property 25: Character Escaping**
    - **Validates: Requirements 10.3**
    - Generate content with quotes, newlines, backslashes
    - Verify proper escaping in saved file
  
  - [ ]* 9.4 Write property test for backup creation
    - **Property 26: Backup Creation**
    - **Validates: Requirements 10.4**
    - Run writer to modify file
    - Verify backup exists before modifications
  
  - [ ]* 9.5 Write unit tests for TopicDescriptionsWriter
    - Test reading existing file
    - Test updating single topic
    - Test saving with special characters
    - Test syntax validation
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [ ] 10. Implement main generator orchestration
  - [x] 10.1 Create main generator script
    - Load configuration from config file
    - Initialize all components (reader, iterator, generator, validator, writer)
    - Implement main processing loop
    - Add progress indicator display
    - Add timestamped logging for each topic
    - Add error handling with topic ID logging
    - Generate final summary report
    - _Requirements: 1.4, 1.5, 7.1, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 10.2 Write property test for complete topic coverage
    - **Property 1: Complete Topic Coverage**
    - **Validates: Requirements 1.1, 1.2**
    - Generate random curriculum structures
    - Verify every topic is processed or marked failed
  
  - [ ]* 10.3 Write property test for statistics accuracy
    - **Property 3: Statistics Accuracy**
    - **Validates: Requirements 1.4, 9.4**
    - Run generator on random curriculum
    - Verify (successful + failed + skipped) = total topics
  
  - [ ]* 10.4 Write property test for error resilience
    - **Property 4: Error Resilience**
    - **Validates: Requirements 1.5, 7.1**
    - Inject failures for random topics
    - Verify system continues and logs failures with topic IDs
  
  - [ ]* 10.5 Write property test for failure reporting
    - **Property 18: Failure Reporting**
    - **Validates: Requirements 7.5, 9.3**
    - Run generator with injected failures
    - Verify final report lists all failed topics
  
  - [ ]* 10.6 Write property test for progress indicator accuracy
    - **Property 21: Progress Indicator Accuracy**
    - **Validates: Requirements 9.1**
    - Monitor progress indicator during execution
    - Verify processed count matches processed set size
  
  - [ ]* 10.7 Write property test for timestamped logging
    - **Property 22: Timestamped Logging**
    - **Validates: Requirements 9.2**
    - Process random topics
    - Verify each has log entry with topic ID and ISO 8601 timestamp
  
  - [ ]* 10.8 Write property test for time estimation
    - **Property 23: Time Estimation**
    - **Validates: Requirements 9.5**
    - Process topics, check time estimates
    - Verify estimate = (remaining × average time per topic)

- [ ] 11. Implement curriculum immutability check
  - [x] 11.1 Add curriculum file integrity verification
    - Calculate hash of curriculum.js before processing
    - Calculate hash after processing
    - Verify hashes match
    - _Requirements: 5.5_
  
  - [ ]* 11.2 Write property test for curriculum immutability
    - **Property 12: Curriculum Immutability**
    - **Validates: Requirements 5.5**
    - Run generator
    - Verify curriculum.js unchanged byte-for-byte

- [ ] 12. Implement file update verification
  - [x] 12.1 Add post-generation verification
    - Verify topicDescriptions.js contains entries for all processed topics
    - Verify JavaScript syntax is valid
    - _Requirements: 10.1, 10.5_
  
  - [ ]* 12.2 Write property test for file update
    - **Property 24: File Update**
    - **Validates: Requirements 10.1**
    - Generate content for random topics
    - Verify topicDescriptions.js contains entries for all

- [ ] 13. Create CLI interface and documentation
  - [x] 13.1 Create command-line interface
    - Add command-line arguments (--resume, --dry-run, --topics)
    - Add help text and usage examples
    - Add configuration validation
    - _Requirements: 7.3_
  
  - [x] 13.2 Write README documentation
    - Document installation steps
    - Document configuration options
    - Document usage examples
    - Document error recovery procedures
    - Document monitoring and logging
  
  - [x] 13.3 Create example configuration file
    - Include all configuration options with comments
    - Provide sensible defaults
    - Document rate limits and constraints

- [ ] 14. Final integration and testing
  - [~] 14.1 Run end-to-end test with small curriculum subset
    - Test with 5-10 topics
    - Verify all components work together
    - Verify output quality
    - _Requirements: All_
  
  - [~] 14.2 Test error recovery scenarios
    - Test interruption and resume
    - Test API failures and retries
    - Test validation failures
    - _Requirements: 6.5, 7.1, 7.3, 7.4_
  
  - [~] 14.3 Performance testing
    - Measure processing time per topic
    - Verify memory usage stays under 500 MB
    - Test with parallel processing if implemented
  
  - [~] 14.4 Generate final report
    - Document test results
    - Document any issues found
    - Document recommendations for production run

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses JavaScript/Node.js to match the existing project structure
- Web search integration uses exa-search MCP
- Sequential thinking and context7 are used for content generation
- All content is generated in Russian language
- The system processes 280+ topics from curriculum.js
- Progress is saved incrementally to allow recovery from interruptions
- Failed topics are retried up to 3 times before being marked as permanently failed
