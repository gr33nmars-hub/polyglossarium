# Polyglossarium Content Generator - Usage Guide

## Overview

The main generator script orchestrates all components to process 290+ topics from `curriculum.js` and generate comprehensive educational articles in Russian for each topic.

## Features

- ✅ Loads configuration from config file
- ✅ Initializes all components (CurriculumReader, TopicIterator, WebSearchClient, ContentGenerator, ContentValidator, TopicDescriptionsWriter)
- ✅ Implements main processing loop with progress tracking
- ✅ Displays real-time progress indicator with ETA
- ✅ Timestamped logging for each topic
- ✅ Error handling with topic ID logging
- ✅ Automatic retry (up to 3 attempts per topic)
- ✅ Progress persistence (resume from interruption)
- ✅ Curriculum immutability verification
- ✅ Generates final summary report

## Installation

```bash
cd .kiro/specs/polyglossarium-content-generator/generator
npm install
```

## Configuration

The generator uses `config.json` for configuration. Key settings:

```json
{
  "paths": {
    "curriculumPath": "web/src/data/curriculum.js",
    "descriptionsPath": "web/src/data/topicDescriptions.js",
    "progressPath": ".kiro/specs/polyglossarium-content-generator/generator/progress.json",
    "logPath": ".kiro/specs/polyglossarium-content-generator/generator/generation.log"
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
      "webSearch": 10
    }
  }
}
```

## Usage

### Basic Usage

Run the generator with default configuration:

```bash
node src/main.js
```

### Custom Configuration

Run with a custom config file:

```bash
node src/main.js /path/to/custom-config.json
```

### Resume from Interruption

If the generator is interrupted, simply run it again. It will automatically resume from the last saved progress:

```bash
node src/main.js
```

The generator saves progress after each successfully processed topic in `progress.json`.

## Output

### Progress Display

During execution, you'll see real-time progress:

```
[==========================                        ] 52.3%
Processing: Machine Learning (ml-101)
Progress: 150/290 | Successful: 148 | Failed: 2 | Remaining: 140
ETA: 2h 15m
```

### Logs

All operations are logged to `generation.log` with timestamps:

```json
{"timestamp":"2024-01-15T10:30:45.123Z","level":"INFO","message":"Topic processing started","topicId":"ml-101","topicTitle":"Machine Learning"}
{"timestamp":"2024-01-15T10:31:12.456Z","level":"INFO","message":"Topic processing completed","topicId":"ml-101","duration":27333}
```

### Summary Report

After completion, a summary is displayed and saved to `summary.json`:

```
============================================================
GENERATION SUMMARY
============================================================
Total topics:           290
Processed:              290
Successful:             285
Failed:                 5
Skipped:                0
Total duration:         4h 32m
Average time per topic: 56s

Failed topics:
  - advanced-topic-1
  - complex-topic-2
  - ...
============================================================
```

## Error Handling

### Automatic Retry

If a topic fails to generate, the system will:
1. Log the error with topic ID
2. Retry up to 3 times
3. If all retries fail, mark as permanently failed and continue

### Recovery from Interruption

If the generator is interrupted (Ctrl+C, crash, etc.):
1. Progress is saved after each successful topic
2. Simply restart the generator
3. It will resume from the last saved state
4. No topics will be reprocessed

### Curriculum Immutability

The generator verifies that `curriculum.js` is not modified during execution:
- Calculates SHA256 hash before processing
- Verifies hash after completion
- Warns if file was modified

## Validation

Each generated article is validated for:
- ✅ All required sections present (intro, tech stack, processes, applications, intersections)
- ✅ Word count between 500-2000 words
- ✅ 5-10 properly formatted links
- ✅ Content in Russian (≥70% Cyrillic characters)

Articles that fail validation are flagged in the logs but still saved for manual review.

## Files Generated

- `topicDescriptions.js` - Updated with generated content
- `topicDescriptions.js.backup` - Backup of original file
- `progress.json` - Current progress state
- `generation.log` - Detailed logs
- `summary.json` - Final summary report

## Troubleshooting

### Generator won't start

Check that all paths in `config.json` are correct and files exist.

### API rate limit errors

Adjust `api.rateLimit.webSearch` in config to a lower value.

### Out of memory

The generator processes topics sequentially to minimize memory usage. If you still encounter issues, restart the generator - it will resume from where it left off.

### Failed topics

Check `generation.log` for detailed error messages. Common issues:
- Web search API failures
- Network timeouts
- Content validation failures

Failed topics are listed in the summary report for manual review.

## Development

### Running Tests

```bash
npm test
```

### Running Specific Tests

```bash
npm test -- main.test.js
```

### Debugging

Set log level to `debug` in `config.json`:

```json
{
  "logging": {
    "level": "debug"
  }
}
```

## Requirements Implemented

This implementation satisfies the following requirements:

- **1.4**: Reports completion statistics
- **1.5**: Logs errors and continues with remaining topics
- **7.1**: Error handling with topic ID logging
- **7.5**: Generates report of failed topics
- **9.1**: Displays progress indicator
- **9.2**: Timestamped logging for each topic
- **9.3**: Generates summary report
- **9.4**: Reports statistics (total, processed, successful, failed, skipped)
- **9.5**: Estimates remaining time based on average processing speed

## Architecture

```
MainGenerator
├── loadConfig()           - Loads configuration
├── initializeComponents() - Initializes all components
├── loadTopics()          - Reads curriculum and creates iterator
├── processAllTopics()    - Main processing loop
│   ├── displayProgress() - Shows progress indicator
│   └── processTopic()    - Processes single topic
│       ├── generate()    - Generates content
│       ├── validate()    - Validates content
│       └── write()       - Writes to file
└── generateSummaryReport() - Creates final report
```

## Next Steps

After running the generator:

1. Review the summary report
2. Check failed topics in the logs
3. Manually review flagged articles
4. Verify generated content quality
5. Deploy updated `topicDescriptions.js`

## Support

For issues or questions, check:
- `generation.log` for detailed error messages
- `summary.json` for overview of results
- Task list in `tasks.md` for implementation details
