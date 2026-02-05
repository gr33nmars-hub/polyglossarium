# Polyglossarium Content Generator

Automated content generation system for creating structured educational articles for all topics in the Polyglossarium encyclopedia.

## Overview

This generator processes 280+ topics from `curriculum.js` and creates comprehensive, structured articles in Russian for each topic. It uses web search for finding authoritative sources and AI tools for content generation, with robust error handling and progress tracking.

### Key Features

- ✅ **Automated Content Generation**: Generates structured educational articles for 280+ topics
- ✅ **Web Search Integration**: Finds and prioritizes authoritative sources using exa-search MCP
- ✅ **AI-Powered Writing**: Uses sequential thinking for structured content planning
- ✅ **Progress Tracking**: Saves progress after each topic, supports resume from interruption
- ✅ **Error Recovery**: Automatic retry (up to 3 attempts) with exponential backoff
- ✅ **Content Validation**: Validates structure, word count, links, and language
- ✅ **Real-time Monitoring**: Progress indicator with ETA and detailed logging
- ✅ **Backup & Rollback**: Automatic backup before modifications

## Directory Structure

```
generator/
├── config.json              # Configuration file with paths, limits, and API settings
├── logger.js               # Logging infrastructure
├── progress.json           # Progress tracking file (created during execution)
├── generation.log          # Detailed log file (created during execution)
├── summary.json            # Final summary report (created after completion)
├── package.json            # Node.js dependencies and scripts
├── README.md              # This file
├── USAGE.md               # Detailed usage guide
└── src/                   # Source code
    ├── CurriculumReader.js          # Reads and parses curriculum.js
    ├── TopicIterator.js             # Manages topic iteration and progress
    ├── WebSearchClient.js           # Web search API client
    ├── ContentGenerator.js          # Generates structured content
    ├── ContentValidator.js          # Validates generated content
    ├── TopicDescriptionsWriter.js   # Writes to topicDescriptions.js
    ├── main.js                      # Main orchestration script
    └── __tests__/                   # Test files
        ├── CurriculumReader.test.js
        ├── TopicIterator.test.js
        ├── WebSearchClient.test.js
        ├── ContentGenerator.test.js
        ├── ContentValidator.test.js
        ├── TopicDescriptionsWriter.test.js
        └── main.test.js
```

## Installation

### Prerequisites

Before installing, ensure you have:

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **npm**: Comes with Node.js
- **Access to exa-search MCP**: For web search functionality
- **Access to sequential thinking API**: For content generation
- **Write permissions**: For data files in the project directory

### Installation Steps

1. **Navigate to the generator directory**:
   ```bash
   cd .kiro/specs/polyglossarium-content-generator/generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify installation**:
   ```bash
   npm test
   ```

4. **Configure paths** (if needed):
   Edit `config.json` to match your project structure.

### Troubleshooting Installation

**Issue**: `npm install` fails with permission errors
- **Solution**: Run with `sudo npm install` or fix npm permissions

**Issue**: Tests fail with "Cannot find module" errors
- **Solution**: Ensure you're in the correct directory and dependencies are installed

**Issue**: API access errors
- **Solution**: Verify you have access to exa-search MCP and sequential thinking API

## Configuration

The `config.json` file contains all configuration options. You can customize these settings to match your needs.

### Configuration File Structure

```json
{
  "paths": { ... },
  "limits": { ... },
  "api": { ... },
  "validation": { ... },
  "logging": { ... }
}
```

### Example Configuration Files

Two example configuration files are provided to help you get started:

#### config.example.json

A comprehensive example with detailed inline comments explaining every configuration option. This file includes:
- Detailed descriptions of each setting
- Valid ranges and recommended values
- Usage notes and best practices
- Troubleshooting tips
- Performance considerations

**Note**: JSON does not support comments. This file uses comment syntax for documentation purposes. You'll need to remove all comment lines (starting with `//`) before using it as a valid JSON file.

**Usage**:
```bash
# View the example file to understand all options
cat config.example.json

# Copy and customize (remember to remove comments)
cp config.example.json config.json
# Edit config.json and remove all comment lines
```

#### config.template.json

A clean, ready-to-use JSON template with sensible defaults and no comments. This file can be used directly without modification.

**Usage**:
```bash
# Copy the template to create your config
cp config.template.json config.json

# Customize as needed
nano config.json
```

**Quick Start**:
```bash
# Option 1: Use template directly (fastest)
cp config.template.json config.json
node src/main.js

# Option 2: Customize from example (recommended)
cp config.template.json config.json
# Edit config.json to adjust paths, limits, etc.
node src/main.js
```

### Paths Configuration

Controls where the generator reads input and writes output:

| Option | Description | Default |
|--------|-------------|---------|
| `curriculumPath` | Path to curriculum.js file | `web/src/data/curriculum.js` |
| `descriptionsPath` | Path to topicDescriptions.js file | `web/src/data/topicDescriptions.js` |
| `progressPath` | Path to progress tracking file | `generator/progress.json` |
| `logPath` | Path to log file | `generator/generation.log` |
| `backupPath` | Path for backup of topicDescriptions.js | `web/src/data/topicDescriptions.js.backup` |

**Example**:
```json
{
  "paths": {
    "curriculumPath": "web/src/data/curriculum.js",
    "descriptionsPath": "web/src/data/topicDescriptions.js",
    "progressPath": ".kiro/specs/polyglossarium-content-generator/generator/progress.json",
    "logPath": ".kiro/specs/polyglossarium-content-generator/generator/generation.log",
    "backupPath": "web/src/data/topicDescriptions.js.backup"
  }
}
```

### Limits Configuration

Controls content generation constraints:

| Option | Description | Default | Valid Range |
|--------|-------------|---------|-------------|
| `maxRetries` | Maximum retry attempts for failed topics | 3 | 1-10 |
| `minWordCount` | Minimum word count for articles | 500 | 100-1000 |
| `maxWordCount` | Maximum word count for articles | 2000 | 1000-5000 |
| `minLinks` | Minimum number of links per article | 5 | 1-20 |
| `maxLinks` | Maximum number of links per article | 10 | 5-50 |
| `parallelism` | Number of topics to process in parallel | 1 | 1-5 |

**Example**:
```json
{
  "limits": {
    "maxRetries": 3,
    "minWordCount": 500,
    "maxWordCount": 2000,
    "minLinks": 5,
    "maxLinks": 10,
    "parallelism": 1
  }
}
```

**Note**: Parallelism > 1 is experimental and may cause rate limit issues.

### API Configuration

Controls API rate limits and retry behavior:

| Option | Description | Default |
|--------|-------------|---------|
| `rateLimit.webSearch` | Max web search requests per minute | 10 |
| `rateLimit.sequentialThinking` | Max sequential thinking requests per minute | 20 |
| `retryDelay.initial` | Initial retry delay in milliseconds | 1000 |
| `retryDelay.multiplier` | Retry delay multiplier (exponential backoff) | 2 |
| `retryDelay.maxDelay` | Maximum retry delay in milliseconds | 30000 |

**Example**:
```json
{
  "api": {
    "rateLimit": {
      "webSearch": 10,
      "sequentialThinking": 20
    },
    "retryDelay": {
      "initial": 1000,
      "multiplier": 2,
      "maxDelay": 30000
    }
  }
}
```

**Retry Behavior**: 
- First retry: 1 second delay
- Second retry: 2 seconds delay
- Third retry: 4 seconds delay
- Subsequent retries: capped at 30 seconds

### Validation Configuration

Controls content quality validation:

| Option | Description | Default |
|--------|-------------|---------|
| `requiredSections` | List of required sections in each article | See below |
| `minCyrillicRatio` | Minimum ratio of Cyrillic to alphabetic characters | 0.7 |

**Example**:
```json
{
  "validation": {
    "requiredSections": [
      "intro",
      "techStack",
      "processes",
      "applications",
      "intersections"
    ],
    "minCyrillicRatio": 0.7
  }
}
```

**Required Sections**:
1. **intro**: Introductory paragraph explaining the discipline
2. **techStack**: Technology stack and tools
3. **processes**: Typical processes and methodologies
4. **applications**: Real-world applications
5. **intersections**: Connections with other areas

### Logging Configuration

Controls logging behavior:

| Option | Description | Default | Valid Values |
|--------|-------------|---------|--------------|
| `level` | Minimum log level to record | `info` | `debug`, `info`, `warn`, `error` |
| `timestampFormat` | Timestamp format in logs | `ISO8601` | `ISO8601` |
| `includeStackTrace` | Include stack traces in error logs | `true` | `true`, `false` |

**Example**:
```json
{
  "logging": {
    "level": "info",
    "timestampFormat": "ISO8601",
    "includeStackTrace": true
  }
}
```

**Log Levels**:
- **debug**: Detailed debugging information (verbose)
- **info**: General informational messages (default)
- **warn**: Warning messages for potential issues
- **error**: Error messages for failures

### Custom Configuration

To use a custom configuration file:

```bash
node src/main.js /path/to/custom-config.json
```

## Usage

### Basic Usage

Run the generator with default configuration:

```bash
cd .kiro/specs/polyglossarium-content-generator/generator
node src/main.js
```

The generator will:
1. Load configuration from `config.json`
2. Read all topics from `curriculum.js`
3. Process each topic sequentially
4. Save progress after each successful topic
5. Generate a summary report when complete

### Command-Line Options

The generator supports several command-line options:

#### Resume from Last Progress

```bash
node src/main.js --resume
```

Resumes from the last saved progress. Useful after interruption or failure.

#### Dry Run Mode

```bash
node src/main.js --dry-run
```

Validates configuration and simulates processing without saving any changes. Useful for testing.

#### Process Specific Topics

```bash
node src/main.js --topics 1,2,3
```

Processes only the specified topic IDs. Useful for testing or regenerating specific topics.

#### Set Log Level

```bash
node src/main.js --log-level debug
```

Sets the log level for this run. Options: `debug`, `info`, `warn`, `error`.

#### Custom Configuration File

```bash
node src/main.js /path/to/custom-config.json
```

Uses a custom configuration file instead of the default `config.json`.

#### Combine Options

```bash
node src/main.js --resume --log-level debug
```

You can combine multiple options as needed.

### Usage Examples

#### First-Time Run

```bash
# Start fresh generation
node src/main.js
```

#### Resume After Interruption

```bash
# Generator was interrupted (Ctrl+C, crash, etc.)
# Simply restart it - it will resume automatically
node src/main.js
```

#### Test Configuration

```bash
# Validate configuration without making changes
node src/main.js --dry-run
```

#### Debug Specific Topics

```bash
# Process specific topics with debug logging
node src/main.js --topics 1,5,10 --log-level debug
```

#### Regenerate Failed Topics

```bash
# After reviewing failed topics in summary report
# Process them again with debug logging
node src/main.js --topics 42,87,156 --log-level debug
```

### What Happens During Execution

1. **Initialization**:
   - Loads configuration from `config.json`
   - Initializes logger
   - Creates backup of `topicDescriptions.js`
   - Reads curriculum and extracts all topics
   - Loads progress from previous run (if any)

2. **Processing Loop**:
   - For each unprocessed topic:
     - Displays progress indicator
     - Searches for authoritative sources
     - Generates structured content
     - Validates content quality
     - Saves to `topicDescriptions.js`
     - Updates progress file
     - Logs completion with timestamp

3. **Error Handling**:
   - If a topic fails:
     - Logs error with topic ID
     - Retries up to 3 times with exponential backoff
     - If all retries fail, marks as permanently failed
     - Continues with next topic

4. **Completion**:
   - Verifies curriculum.js unchanged
   - Generates summary report
   - Saves summary to `summary.json`
   - Displays statistics

### Understanding the Output

#### Console Output

During execution, you'll see real-time progress:

```
[2024-01-15T10:30:00.000Z] INFO: Generation started
[2024-01-15T10:30:01.000Z] INFO: Loaded 290 topics from curriculum
[2024-01-15T10:30:02.000Z] INFO: Created backup: topicDescriptions.js.backup

[==========================                        ] 52.3%
Processing: Machine Learning (ml-101)
Progress: 150/290 | Successful: 148 | Failed: 2 | Remaining: 140
ETA: 2h 15m

[2024-01-15T10:30:45.000Z] INFO: Topic processing completed
```

#### Progress Indicator

The progress bar shows:
- **Percentage**: Overall completion percentage
- **Current Topic**: Topic being processed (title and ID)
- **Progress**: Processed/Total topics
- **Successful**: Successfully generated topics
- **Failed**: Failed topics (after all retries)
- **Remaining**: Topics left to process
- **ETA**: Estimated time to completion

#### Log File

All operations are logged to `generation.log`:

```json
{"timestamp":"2024-01-15T10:30:00.000Z","level":"INFO","message":"Generation started"}
{"timestamp":"2024-01-15T10:30:45.000Z","level":"INFO","message":"Topic processing started","topicId":"ml-101","topicTitle":"Machine Learning"}
{"timestamp":"2024-01-15T10:31:12.000Z","level":"INFO","message":"Topic processing completed","topicId":"ml-101","duration":27333}
{"timestamp":"2024-01-15T10:31:15.000Z","level":"ERROR","message":"Topic processing failed","topicId":"ml-102","attempt":1,"errorMessage":"Rate limit exceeded"}
```

#### Summary Report

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
  - advanced-quantum-computing (quantum-101)
  - complex-topology (math-topology-advanced)
  - advanced-category-theory (math-category-theory)
  - quantum-field-theory (physics-qft)
  - advanced-algebraic-geometry (math-alg-geo)

Validation warnings:
  - 12 topics with word count near minimum (500-550 words)
  - 3 topics with word count near maximum (1950-2000 words)
  - 5 topics with minimum link count (5 links)

Recommendations:
  - Review failed topics manually
  - Consider regenerating topics with validation warnings
  - Verify content quality for flagged topics
============================================================
```

## Error Recovery Procedures

The generator is designed to handle errors gracefully and recover from interruptions. This section explains how to handle various error scenarios.

### Understanding Error Types

#### 1. Transient Errors

**Description**: Temporary errors that may resolve on retry.

**Examples**:
- Network timeouts
- API rate limits
- Temporary service unavailability

**Recovery**: Automatic retry with exponential backoff (1s, 2s, 4s, 8s, ...)

**Action Required**: None - the generator handles these automatically.

#### 2. Permanent Errors

**Description**: Errors that won't resolve on retry.

**Examples**:
- Invalid topic data
- Content generation failures
- Validation failures

**Recovery**: After 3 failed attempts, topic is marked as permanently failed and processing continues.

**Action Required**: Manual review of failed topics after completion.

#### 3. Critical Errors

**Description**: Errors that prevent the generator from continuing.

**Examples**:
- File system errors (disk full, permission denied)
- Configuration errors
- Missing dependencies

**Recovery**: Generator saves progress and exits gracefully.

**Action Required**: Fix the underlying issue and restart the generator.

### Recovery Procedures

#### Scenario 1: Generator Interrupted (Ctrl+C, Crash, Power Loss)

**Symptoms**:
- Generator stops unexpectedly
- Progress indicator disappears
- No summary report generated

**Recovery Steps**:

1. **Check the last saved progress**:
   ```bash
   cat progress.json
   ```
   This shows how many topics were successfully processed.

2. **Review the log file**:
   ```bash
   tail -n 50 generation.log
   ```
   Check for any errors before interruption.

3. **Restart the generator**:
   ```bash
   node src/main.js
   ```
   The generator automatically resumes from the last saved state.

**What Happens**:
- Generator loads `progress.json`
- Skips already processed topics
- Continues from where it left off
- No topics are reprocessed

**Example**:
```bash
# Generator was interrupted at topic 150/290
# Restart it
node src/main.js

# Output:
[2024-01-15T14:30:00.000Z] INFO: Loaded progress: 150 topics already processed
[2024-01-15T14:30:01.000Z] INFO: Resuming from topic 151/290
```

#### Scenario 2: API Rate Limit Exceeded

**Symptoms**:
- Error messages: "Rate limit exceeded"
- Topics failing repeatedly
- Slow progress

**Recovery Steps**:

1. **Wait for rate limit to reset** (usually 1 minute):
   ```bash
   # Wait 60 seconds, then restart
   sleep 60
   node src/main.js
   ```

2. **Reduce rate limit in config**:
   ```json
   {
     "api": {
       "rateLimit": {
         "webSearch": 5,  // Reduced from 10
         "sequentialThinking": 10  // Reduced from 20
       }
     }
   }
   ```

3. **Restart the generator**:
   ```bash
   node src/main.js
   ```

**Prevention**:
- Use conservative rate limits in `config.json`
- Avoid running multiple generators simultaneously
- Monitor API usage in logs

#### Scenario 3: Topics Failing Validation

**Symptoms**:
- Topics marked as failed in summary
- Validation errors in logs
- Content doesn't meet quality standards

**Recovery Steps**:

1. **Review failed topics in summary**:
   ```bash
   cat summary.json
   ```

2. **Check validation errors in logs**:
   ```bash
   grep "validation failed" generation.log
   ```

3. **Adjust validation settings** (if appropriate):
   ```json
   {
     "limits": {
       "minWordCount": 400,  // Reduced from 500
       "maxWordCount": 2500  // Increased from 2000
     }
   }
   ```

4. **Regenerate failed topics**:
   ```bash
   node src/main.js --topics 42,87,156
   ```

**Manual Review**:
- Failed topics are saved even if validation fails
- Review content in `topicDescriptions.js`
- Edit manually if needed

#### Scenario 4: Disk Full or Permission Errors

**Symptoms**:
- Error messages: "ENOSPC" (no space) or "EACCES" (permission denied)
- Generator exits immediately
- Files not being written

**Recovery Steps**:

1. **Check disk space**:
   ```bash
   df -h
   ```

2. **Free up space** (if needed):
   ```bash
   # Remove old log files, backups, etc.
   rm -f *.log.old *.backup.old
   ```

3. **Check file permissions**:
   ```bash
   ls -la web/src/data/
   ```

4. **Fix permissions** (if needed):
   ```bash
   chmod 644 web/src/data/topicDescriptions.js
   ```

5. **Restart the generator**:
   ```bash
   node src/main.js
   ```

#### Scenario 5: Corrupted Progress File

**Symptoms**:
- Error messages: "Invalid JSON in progress.json"
- Generator won't start
- Progress file unreadable

**Recovery Steps**:

1. **Backup corrupted file**:
   ```bash
   cp progress.json progress.json.corrupted
   ```

2. **Delete corrupted file**:
   ```bash
   rm progress.json
   ```

3. **Restart from beginning** (or restore from backup):
   ```bash
   # Option 1: Start fresh
   node src/main.js

   # Option 2: Restore from backup (if available)
   cp progress.json.backup progress.json
   node src/main.js
   ```

**Prevention**:
- Don't manually edit `progress.json`
- Don't interrupt during file writes
- Keep backups of progress file

#### Scenario 6: Invalid Output Generated

**Symptoms**:
- JavaScript syntax errors in `topicDescriptions.js`
- Application won't load
- Parse errors

**Recovery Steps**:

1. **Restore from backup**:
   ```bash
   cp web/src/data/topicDescriptions.js.backup web/src/data/topicDescriptions.js
   ```

2. **Review the log** to identify problematic topic:
   ```bash
   grep "ERROR" generation.log | tail -n 20
   ```

3. **Fix the issue** (adjust validation, fix escaping, etc.)

4. **Restart the generator**:
   ```bash
   node src/main.js
   ```

**Validation**:
```bash
# Verify JavaScript syntax
node -c web/src/data/topicDescriptions.js
```

### Emergency Recovery

If all else fails and you need to start completely fresh:

```bash
# 1. Restore original files from backup
cp web/src/data/topicDescriptions.js.backup web/src/data/topicDescriptions.js

# 2. Delete progress file
rm progress.json

# 3. Clear log file
> generation.log

# 4. Start fresh
node src/main.js
```

### Best Practices for Error Prevention

1. **Always keep backups**: The generator creates automatic backups, but keep additional backups for safety.

2. **Monitor disk space**: Ensure sufficient disk space before starting (at least 100 MB free).

3. **Use conservative rate limits**: Start with lower rate limits and increase if needed.

4. **Run in a stable environment**: Use a stable network connection and avoid running on battery power.

5. **Review logs regularly**: Check `generation.log` periodically for warnings or errors.

6. **Test with small subset first**: Use `--topics 1,2,3` to test before processing all topics.

7. **Keep progress file safe**: Don't manually edit or delete `progress.json` during execution.

## Monitoring and Logging

The generator provides comprehensive monitoring and logging capabilities to track progress, diagnose issues, and analyze performance.

### Log Files

#### generation.log

**Location**: `.kiro/specs/polyglossarium-content-generator/generator/generation.log`

**Format**: JSON lines (one JSON object per line)

**Content**: All operations, errors, and events

**Example**:
```json
{"timestamp":"2024-01-15T10:30:00.000Z","level":"INFO","message":"Generation started"}
{"timestamp":"2024-01-15T10:30:01.000Z","level":"INFO","message":"Loaded 290 topics from curriculum"}
{"timestamp":"2024-01-15T10:30:45.000Z","level":"INFO","message":"Topic processing started","topicId":"ml-101","topicTitle":"Machine Learning"}
{"timestamp":"2024-01-15T10:31:12.000Z","level":"INFO","message":"Topic processing completed","topicId":"ml-101","duration":27333}
{"timestamp":"2024-01-15T10:31:15.000Z","level":"ERROR","message":"Topic processing failed","topicId":"ml-102","attempt":1,"errorMessage":"Rate limit exceeded","errorStack":"..."}
```

**Log Levels**:
- **DEBUG**: Detailed debugging information (verbose)
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failures

#### progress.json

**Location**: `.kiro/specs/polyglossarium-content-generator/generator/progress.json`

**Format**: JSON object

**Content**: Current progress state

**Example**:
```json
{
  "currentIndex": 150,
  "processed": ["1", "2", "3", "..."],
  "failed": {
    "42": 3,
    "87": 2
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "stats": {
    "total": 290,
    "successful": 148,
    "failed": 2,
    "skipped": 0
  }
}
```

**Fields**:
- `currentIndex`: Current position in topic list
- `processed`: Set of successfully processed topic IDs
- `failed`: Map of topic IDs to retry attempt counts
- `timestamp`: Last update time (ISO 8601)
- `stats`: Current statistics

#### summary.json

**Location**: `.kiro/specs/polyglossarium-content-generator/generator/summary.json`

**Format**: JSON object

**Content**: Final summary report

**Example**:
```json
{
  "timestamp": "2024-01-15T14:30:00.000Z",
  "duration": 16320000,
  "stats": {
    "total": 290,
    "processed": 290,
    "successful": 285,
    "failed": 5,
    "skipped": 0
  },
  "averageTimePerTopic": 56276,
  "failedTopics": [
    {"id": "quantum-101", "title": "Advanced Quantum Computing", "attempts": 3},
    {"id": "math-topology-advanced", "title": "Complex Topology", "attempts": 3}
  ],
  "validationWarnings": [
    {"topicId": "ml-101", "warning": "Word count near minimum (520 words)"},
    {"topicId": "physics-qm", "warning": "Word count near maximum (1980 words)"}
  ]
}
```

### Monitoring Commands

#### View Real-Time Logs

```bash
# Follow log file in real-time
tail -f generation.log

# Follow with pretty-printing
tail -f generation.log | jq '.'
```

#### Check Current Progress

```bash
# View progress file
cat progress.json | jq '.'

# View just statistics
cat progress.json | jq '.stats'
```

#### Search for Errors

```bash
# Find all errors
grep '"level":"ERROR"' generation.log | jq '.'

# Find errors for specific topic
grep '"topicId":"ml-101"' generation.log | grep ERROR | jq '.'

# Count errors by type
grep ERROR generation.log | jq -r '.errorMessage' | sort | uniq -c
```

#### Analyze Performance

```bash
# Calculate average processing time
grep "Topic processing completed" generation.log | jq '.duration' | awk '{sum+=$1; count++} END {print sum/count/1000 "s"}'

# Find slowest topics
grep "Topic processing completed" generation.log | jq '{topic: .topicId, duration: .duration}' | sort -k2 -n | tail -10

# Find topics with retries
grep "Topic processing failed" generation.log | jq '{topic: .topicId, attempt: .attempt}' | sort | uniq
```

#### Monitor Rate Limits

```bash
# Count API calls per minute
grep "Web search" generation.log | jq -r '.timestamp' | cut -c1-16 | uniq -c

# Find rate limit errors
grep "Rate limit" generation.log | jq '.'
```

### Progress Tracking

The generator displays real-time progress during execution:

```
[==========================                        ] 52.3%
Processing: Machine Learning (ml-101)
Progress: 150/290 | Successful: 148 | Failed: 2 | Remaining: 140
ETA: 2h 15m
```

**Progress Bar Components**:
- **Visual Bar**: Shows completion percentage
- **Percentage**: Numeric completion percentage
- **Current Topic**: Topic being processed (title and ID)
- **Progress**: Processed/Total topics
- **Successful**: Successfully generated topics
- **Failed**: Failed topics (after all retries)
- **Remaining**: Topics left to process
- **ETA**: Estimated time to completion

**ETA Calculation**:
```
ETA = (Remaining Topics) × (Average Time Per Topic)
```

The average is calculated from all successfully processed topics.

### Logging Best Practices

#### 1. Set Appropriate Log Level

For normal operation:
```json
{"logging": {"level": "info"}}
```

For debugging issues:
```json
{"logging": {"level": "debug"}}
```

For production (minimal logging):
```json
{"logging": {"level": "warn"}}
```

#### 2. Rotate Log Files

For long-running operations, rotate logs to prevent large files:

```bash
# Rotate log file
mv generation.log generation.log.$(date +%Y%m%d)

# Compress old logs
gzip generation.log.*

# Remove old logs (older than 30 days)
find . -name "generation.log.*" -mtime +30 -delete
```

#### 3. Monitor Disk Space

```bash
# Check log file size
du -h generation.log

# Monitor disk space
df -h .
```

#### 4. Parse Logs Programmatically

```javascript
// Read and parse log file
import fs from 'fs';

const logs = fs.readFileSync('generation.log', 'utf8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

// Filter errors
const errors = logs.filter(log => log.level === 'ERROR');

// Calculate statistics
const stats = {
  total: logs.length,
  errors: errors.length,
  warnings: logs.filter(log => log.level === 'WARN').length
};
```

### Monitoring Dashboards

For advanced monitoring, you can create custom dashboards:

#### Simple Dashboard Script

```bash
#!/bin/bash
# monitor.sh - Simple monitoring dashboard

while true; do
  clear
  echo "=== Polyglossarium Content Generator Monitor ==="
  echo ""
  echo "Progress:"
  cat progress.json | jq '.stats'
  echo ""
  echo "Recent Errors (last 5):"
  grep ERROR generation.log | tail -5 | jq -r '"\(.timestamp) - \(.topicId): \(.errorMessage)"'
  echo ""
  echo "Processing Rate:"
  echo "Last minute: $(grep "Topic processing completed" generation.log | tail -60 | wc -l) topics"
  echo ""
  sleep 10
done
```

Usage:
```bash
chmod +x monitor.sh
./monitor.sh
```

### Alert Configuration

Set up alerts for critical events:

```bash
# Alert on high error rate
ERROR_COUNT=$(grep ERROR generation.log | wc -l)
if [ $ERROR_COUNT -gt 50 ]; then
  echo "High error rate detected: $ERROR_COUNT errors" | mail -s "Generator Alert" admin@example.com
fi

# Alert on disk space
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
  echo "Disk space critical: ${DISK_USAGE}% used" | mail -s "Disk Alert" admin@example.com
fi
```

### Performance Metrics

The generator tracks several performance metrics:

| Metric | Description | Target |
|--------|-------------|--------|
| **Processing Time** | Average time per topic | 30-60 seconds |
| **Success Rate** | Percentage of successful topics | > 95% |
| **Retry Rate** | Percentage of topics requiring retry | < 10% |
| **Memory Usage** | Peak memory consumption | < 500 MB |
| **API Call Rate** | API calls per minute | Within rate limits |

**View Metrics**:
```bash
# Success rate
TOTAL=$(cat progress.json | jq '.stats.total')
SUCCESS=$(cat progress.json | jq '.stats.successful')
echo "Success rate: $(echo "scale=2; $SUCCESS * 100 / $TOTAL" | bc)%"

# Average processing time
grep "Topic processing completed" generation.log | jq '.duration' | awk '{sum+=$1; count++} END {print "Average: " sum/count/1000 "s"}'

# Memory usage (during execution)
ps aux | grep "node src/main.js" | awk '{print "Memory: " $6/1024 " MB"}'
```

## Output

The generator updates `topicDescriptions.js` with generated content for each topic.

### Output File Structure

**Location**: `web/src/data/topicDescriptions.js`

**Format**: JavaScript ES6 module exporting an object

**Example**:
```javascript
export const topicDescriptions = {
  "1": {
    title: "Критическое мышление и логика",
    description: "Критическое мышление — это дисциплина, которая изучает методы анализа, оценки и построения аргументов...\n\n**Технологический стек:**\nВ критическом мышлении используются различные инструменты...\n\n**Процессы и методологии:**\nОсновные процессы включают...\n\n**Применения:**\nКритическое мышление применяется в...\n\n**Пересечения с другими областями:**\nКритическое мышление тесно связано с...\n\n**Источники:**\n[Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/logic-classical/)\n[Critical Thinking Web](http://www.criticalthinking.org/)\n..."
  },
  "2": {
    title: "Математическая логика",
    description: "..."
  }
  // ... more topics
};
```

### Article Structure

Each generated article contains five required sections:

#### 1. Introduction (Введение)

Explains what the discipline is, its core concepts, and why it's important.

**Example**:
```
Машинное обучение — это раздел искусственного интеллекта, который изучает 
методы построения алгоритмов, способных обучаться на данных. Основная идея 
заключается в том, что система может автоматически улучшать свою производительность 
с опытом, без явного программирования каждого шага.
```

#### 2. Technology Stack (Технологический стек)

Lists and describes tools, technologies, frameworks, and libraries used in the field.

**Example**:
```
**Технологический стек:**

В машинном обучении используются следующие инструменты:
- Python и библиотеки (NumPy, Pandas, Scikit-learn)
- TensorFlow и PyTorch для глубокого обучения
- Jupyter Notebooks для экспериментов
- Git для версионирования кода
- Docker для развертывания моделей
```

#### 3. Processes (Процессы и методологии)

Describes typical workflows, methodologies, and best practices.

**Example**:
```
**Процессы и методологии:**

Типичный процесс машинного обучения включает:
1. Сбор и подготовка данных
2. Исследовательский анализ данных (EDA)
3. Выбор и обучение модели
4. Оценка и валидация
5. Развертывание и мониторинг
```

#### 4. Applications (Применения)

Provides real-world examples and use cases.

**Example**:
```
**Применения:**

Машинное обучение применяется в:
- Компьютерном зрении (распознавание лиц, автономные автомобили)
- Обработке естественного языка (переводчики, чат-боты)
- Рекомендательных системах (Netflix, Amazon)
- Медицинской диагностике
- Финансовом прогнозировании
```

#### 5. Intersections (Пересечения с другими областями)

Explains connections with other disciplines and interdisciplinary aspects.

**Example**:
```
**Пересечения с другими областями:**

Машинное обучение тесно связано с:
- Статистикой (теория вероятностей, статистический вывод)
- Математикой (линейная алгебра, оптимизация)
- Информатикой (алгоритмы, структуры данных)
- Нейронаукой (искусственные нейронные сети)
- Этикой (справедливость алгоритмов, приватность)
```

#### 6. Sources (Источники)

5-10 authoritative links in markdown format `[text](url)`.

**Example**:
```
**Источники:**
[Machine Learning Course - Stanford](https://www.coursera.org/learn/machine-learning)
[Scikit-learn Documentation](https://scikit-learn.org/stable/)
[Deep Learning Book](https://www.deeplearningbook.org/)
[Papers with Code](https://paperswithcode.com/)
[Google AI Blog](https://ai.googleblog.com/)
```

### Link Format

All links follow the markdown format: `[text](url)`

**Valid Examples**:
- `[Stanford Encyclopedia](https://plato.stanford.edu/)`
- `[Python Documentation](https://docs.python.org/3/)`
- `[Nature Journal](https://www.nature.com/)`

**Invalid Examples**:
- `https://example.com` (missing text)
- `[Example]` (missing URL)
- `<a href="...">Example</a>` (HTML format)

### Character Escaping

Special characters are properly escaped in the JavaScript file:

| Character | Escaped As | Example |
|-----------|-----------|---------|
| `"` | `\"` | `"He said \"hello\""` |
| `'` | `\'` | `"It\'s working"` |
| `\` | `\\` | `"Path: C:\\Users"` |
| Newline | `\n` | `"Line 1\nLine 2"` |
| Tab | `\t` | `"Col1\tCol2"` |

### Backup Files

Before making any changes, the generator creates a backup:

**Backup Location**: `web/src/data/topicDescriptions.js.backup`

**Backup Timing**: Created once at the start of generation

**Backup Content**: Complete copy of original `topicDescriptions.js`

To restore from backup:
```bash
cp web/src/data/topicDescriptions.js.backup web/src/data/topicDescriptions.js
```

## Validation

Each generated article is validated for quality and correctness before being saved.

### Validation Checks

#### 1. Section Presence

**Check**: All five required sections must be present.

**Required Sections**:
- Introduction (intro)
- Technology Stack (techStack)
- Processes (processes)
- Applications (applications)
- Intersections (intersections)

**Failure**: Article is flagged for manual review but still saved.

#### 2. Word Count

**Check**: Article must be between 500-2000 words.

**Counting Method**: 
- Splits text by whitespace
- Counts non-empty tokens
- Excludes URLs from count

**Failure**: 
- < 500 words: Flagged as "too short"
- > 2000 words: Flagged as "too long"

#### 3. Link Count

**Check**: Article must have 5-10 links.

**Counting Method**:
- Matches pattern: `\[([^\]]+)\]\(([^)]+)\)`
- Counts unique URLs

**Failure**:
- < 5 links: Flagged as "insufficient sources"
- > 10 links: Flagged as "too many sources"

#### 4. Link Format

**Check**: All links must follow markdown format `[text](url)`.

**Validation**:
- Text must not be empty
- URL must be valid (starts with http:// or https://)
- URL must be accessible (optional check)

**Failure**: Article is flagged for manual review.

#### 5. Language Detection

**Check**: Content must be primarily in Russian.

**Method**:
- Counts Cyrillic characters
- Counts total alphabetic characters
- Calculates ratio: Cyrillic / Alphabetic

**Threshold**: ≥ 70% Cyrillic characters

**Failure**: Article is flagged as "wrong language".

#### 6. JavaScript Syntax

**Check**: Generated file must be valid JavaScript.

**Method**:
- Attempts to parse the file
- Checks for syntax errors

**Failure**: Critical error - file is not saved, backup is restored.

### Validation Results

Validation results are logged and included in the summary report:

```json
{
  "topicId": "ml-101",
  "valid": true,
  "errors": [],
  "warnings": [
    "Word count near minimum (520 words)"
  ]
}
```

**Status**:
- **Valid**: All checks passed
- **Valid with warnings**: Passed but close to limits
- **Invalid**: Failed one or more checks

### Manual Review

Articles that fail validation are still saved but flagged for manual review:

```
Validation warnings:
  - ml-101: Word count near minimum (520 words)
  - physics-qm: Word count near maximum (1980 words)
  - math-topology: Insufficient sources (4 links)
  - cs-algorithms: Link format issues
  - philosophy-ethics: Wrong language (65% Cyrillic)
```

**Review Process**:
1. Check `summary.json` for flagged topics
2. Review content in `topicDescriptions.js`
3. Edit manually if needed
4. Or regenerate with adjusted settings

### Validation Configuration

Adjust validation settings in `config.json`:

```json
{
  "limits": {
    "minWordCount": 500,
    "maxWordCount": 2000,
    "minLinks": 5,
    "maxLinks": 10
  },
  "validation": {
    "requiredSections": ["intro", "techStack", "processes", "applications", "intersections"],
    "minCyrillicRatio": 0.7
  }
}
```

## Performance

### Expected Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Processing time per topic** | 30-60 seconds | Depends on API latency |
| **Total processing time** | 2.5-5 hours | For 280 topics |
| **Memory usage** | < 500 MB | Peak during execution |
| **Disk space** | ~10 MB | For generated content |
| **API calls per topic** | 5-10 | Web search + content generation |

### Performance Factors

#### 1. API Latency

**Impact**: Largest factor in processing time

**Typical Latencies**:
- Web search: 1-3 seconds per query
- Sequential thinking: 10-30 seconds per generation
- Content validation: < 1 second

**Optimization**:
- Use caching for repeated queries
- Batch API calls when possible
- Use parallel processing (experimental)

#### 2. Network Speed

**Impact**: Affects API call latency

**Requirements**:
- Stable internet connection
- Minimum 1 Mbps download/upload
- Low latency (< 100ms to API servers)

**Optimization**:
- Use wired connection instead of WiFi
- Run during off-peak hours
- Use CDN-cached resources

#### 3. System Resources

**Impact**: Minimal - generator is I/O bound, not CPU bound

**Requirements**:
- CPU: Any modern processor
- RAM: 512 MB minimum, 1 GB recommended
- Disk: 100 MB free space

**Optimization**:
- Close unnecessary applications
- Ensure sufficient disk space
- Use SSD for faster file I/O

### Performance Optimization

#### 1. Parallel Processing (Experimental)

Process multiple topics simultaneously:

```json
{
  "limits": {
    "parallelism": 3
  }
}
```

**Benefits**:
- Faster total processing time
- Better resource utilization

**Risks**:
- Higher risk of rate limit errors
- Increased memory usage
- More complex error handling

**Recommendation**: Start with `parallelism: 1`, increase cautiously.

#### 2. Caching

Cache web search results to avoid duplicate queries:

```javascript
// Enable caching in config
{
  "cache": {
    "enabled": true,
    "ttl": 3600,  // 1 hour
    "maxSize": 1000  // Max cached items
  }
}
```

**Benefits**:
- Faster processing for similar topics
- Reduced API calls
- Lower costs

**Note**: Caching is not yet implemented but planned for future versions.

#### 3. Rate Limit Optimization

Find optimal rate limits for your API tier:

```bash
# Start conservative
{
  "api": {
    "rateLimit": {
      "webSearch": 5,
      "sequentialThinking": 10
    }
  }
}

# Gradually increase if no errors
{
  "api": {
    "rateLimit": {
      "webSearch": 10,
      "sequentialThinking": 20
    }
  }
}
```

### Performance Monitoring

Track performance metrics during execution:

```bash
# Monitor processing rate
watch -n 10 'grep "Topic processing completed" generation.log | wc -l'

# Calculate average time
grep "Topic processing completed" generation.log | jq '.duration' | awk '{sum+=$1; count++} END {print sum/count/1000 "s"}'

# Monitor memory usage
watch -n 5 'ps aux | grep "node src/main.js" | awk "{print \$6/1024 \" MB\"}"'
```

### Performance Benchmarks

Typical performance on different systems:

| System | Time per Topic | Total Time (280 topics) |
|--------|---------------|------------------------|
| **High-end** (fast network, premium API) | 30s | 2.5 hours |
| **Mid-range** (average network, standard API) | 45s | 3.5 hours |
| **Low-end** (slow network, free API) | 60s | 5 hours |

## Backup and Rollback

### Automatic Backup

The generator automatically creates a backup before making any changes:

**Backup File**: `web/src/data/topicDescriptions.js.backup`

**Timing**: Created once at the start of generation

**Content**: Complete copy of original `topicDescriptions.js`

### Manual Backup

Create additional backups for safety:

```bash
# Create timestamped backup
cp web/src/data/topicDescriptions.js web/src/data/topicDescriptions.js.$(date +%Y%m%d_%H%M%S)

# Create compressed backup
tar -czf topicDescriptions_backup_$(date +%Y%m%d).tar.gz web/src/data/topicDescriptions.js
```

### Rollback Procedures

#### Simple Rollback

Restore from automatic backup:

```bash
cp web/src/data/topicDescriptions.js.backup web/src/data/topicDescriptions.js
```

#### Selective Rollback

Restore specific topics from backup:

```javascript
// restore-topics.js
import fs from 'fs';

// Read backup and current files
const backup = JSON.parse(fs.readFileSync('topicDescriptions.js.backup'));
const current = JSON.parse(fs.readFileSync('topicDescriptions.js'));

// Restore specific topics
const topicsToRestore = ['ml-101', 'physics-qm'];
topicsToRestore.forEach(id => {
  if (backup[id]) {
    current[id] = backup[id];
  }
});

// Save
fs.writeFileSync('topicDescriptions.js', JSON.stringify(current, null, 2));
```

#### Git-Based Rollback

If using version control:

```bash
# View changes
git diff web/src/data/topicDescriptions.js

# Rollback to previous commit
git checkout HEAD~1 web/src/data/topicDescriptions.js

# Rollback to specific commit
git checkout abc123 web/src/data/topicDescriptions.js
```

### Backup Best Practices

1. **Keep multiple backups**: Don't rely on a single backup file
2. **Use version control**: Commit changes regularly to Git
3. **Test backups**: Verify backups can be restored
4. **Document changes**: Keep notes on what was changed
5. **Backup before major changes**: Create backup before regenerating many topics

## Development

### Project Structure

```
generator/
├── src/
│   ├── CurriculumReader.js          # Reads curriculum.js
│   ├── TopicIterator.js             # Manages iteration and progress
│   ├── WebSearchClient.js           # Web search API client
│   ├── ContentGenerator.js          # Generates structured content
│   ├── ContentValidator.js          # Validates content quality
│   ├── TopicDescriptionsWriter.js   # Writes to topicDescriptions.js
│   ├── main.js                      # Main orchestration script
│   └── __tests__/                   # Test files
│       ├── CurriculumReader.test.js
│       ├── TopicIterator.test.js
│       ├── WebSearchClient.test.js
│       ├── ContentGenerator.test.js
│       ├── ContentValidator.test.js
│       ├── TopicDescriptionsWriter.test.js
│       └── main.test.js
├── config.json                      # Configuration
├── logger.js                        # Logging infrastructure
├── package.json                     # Dependencies and scripts
├── README.md                        # This file
└── USAGE.md                         # Detailed usage guide
```

### Running Tests

#### All Tests

```bash
npm test
```

#### Specific Test Suite

```bash
npm test -- CurriculumReader.test.js
```

#### Watch Mode

```bash
npm test:watch
```

#### Coverage Report

```bash
npm test:coverage
```

#### Property-Based Tests

```bash
npm test -- --grep "Property"
```

### Test Types

#### Unit Tests

Test individual components and functions:

```javascript
// Example: CurriculumReader.test.js
describe('CurriculumReader', () => {
  test('reads curriculum file', () => {
    const reader = new CurriculumReader('path/to/curriculum.js');
    const topics = reader.readCurriculum();
    expect(topics).toHaveLength(290);
  });
});
```

#### Property-Based Tests

Test universal properties across many inputs:

```javascript
// Example: TopicIterator property test
import fc from 'fast-check';

test('Property 2: No Duplicate Processing', () => {
  fc.assert(
    fc.property(fc.array(fc.string()), (topics) => {
      const iterator = new TopicIterator(topics, 'test-progress.json');
      const processed = new Set();
      
      let topic;
      while ((topic = iterator.next()) !== null) {
        expect(processed.has(topic)).toBe(false);
        processed.add(topic);
        iterator.markProcessed(topic);
      }
    })
  );
});
```

#### Integration Tests

Test component interactions:

```javascript
// Example: End-to-end test
test('generates content for topic', async () => {
  const generator = new ContentGenerator(webSearch, sequentialThinking);
  const topic = { id: '1', title: 'Test Topic' };
  
  const description = await generator.generateDescription(topic);
  
  expect(description).toHaveProperty('title');
  expect(description).toHaveProperty('description');
  expect(description.description).toContain('**Технологический стек:**');
});
```

### Adding New Features

1. **Create feature branch**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Implement feature**:
   - Add code to appropriate component
   - Follow existing code style
   - Add JSDoc comments

3. **Write tests**:
   - Add unit tests for new functions
   - Add property tests if applicable
   - Ensure coverage > 80%

4. **Update documentation**:
   - Update README.md
   - Update USAGE.md if needed
   - Add comments to config.json

5. **Test with small subset**:
   ```bash
   node src/main.js --topics 1,2,3 --dry-run
   ```

6. **Run full test suite**:
   ```bash
   npm test
   ```

7. **Create pull request**:
   - Describe changes
   - Link to requirements
   - Include test results

### Code Style

#### JavaScript Style Guide

- Use ES6+ features (import/export, async/await, arrow functions)
- Use 2 spaces for indentation
- Use single quotes for strings
- Add JSDoc comments for all functions
- Use descriptive variable names

#### Example:

```javascript
/**
 * Generates structured content for a topic
 * @param {Topic} topic - The topic to generate content for
 * @returns {Promise<TopicDescription>} Generated description
 */
async generateDescription(topic) {
  const sources = await this.findSources(topic);
  const intro = await this.generateIntro(topic, sources);
  // ...
  return { title: topic.title, description };
}
```

### Linting and Formatting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

### Debugging

#### Enable Debug Logging

```json
{
  "logging": {
    "level": "debug"
  }
}
```

#### Use Node.js Debugger

```bash
node --inspect src/main.js
```

Then open Chrome DevTools: `chrome://inspect`

#### Add Debug Statements

```javascript
console.log('Debug:', { topicId, sources: sources.length });
```

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Update documentation
6. Submit pull request

## Troubleshooting

### Common Issues and Solutions

#### Issue: Generator won't start

**Symptoms**:
- Error: "Cannot find module"
- Error: "ENOENT: no such file or directory"

**Solutions**:

1. **Check dependencies**:
   ```bash
   npm install
   ```

2. **Verify paths in config.json**:
   ```bash
   cat config.json | jq '.paths'
   ```

3. **Check file permissions**:
   ```bash
   ls -la web/src/data/
   ```

4. **Verify Node.js version**:
   ```bash
   node --version  # Should be 18+
   ```

#### Issue: API rate limit errors

**Symptoms**:
- Error: "Rate limit exceeded"
- Error: "429 Too Many Requests"
- Topics failing repeatedly

**Solutions**:

1. **Wait for rate limit to reset**:
   ```bash
   sleep 60
   node src/main.js
   ```

2. **Reduce rate limits in config**:
   ```json
   {
     "api": {
       "rateLimit": {
         "webSearch": 5,
         "sequentialThinking": 10
       }
     }
   }
   ```

3. **Check API usage**:
   ```bash
   grep "Rate limit" generation.log
   ```

4. **Upgrade API tier** (if available)

#### Issue: Topics failing validation

**Symptoms**:
- Warning: "Validation failed"
- Topics flagged in summary report
- Content doesn't meet quality standards

**Solutions**:

1. **Review validation errors**:
   ```bash
   grep "validation failed" generation.log | jq '.'
   ```

2. **Adjust validation settings**:
   ```json
   {
     "limits": {
       "minWordCount": 400,
       "maxWordCount": 2500
     }
   }
   ```

3. **Regenerate specific topics**:
   ```bash
   node src/main.js --topics 42,87,156
   ```

4. **Manual review and edit**:
   - Open `topicDescriptions.js`
   - Find failed topic by ID
   - Edit content manually

#### Issue: Out of memory

**Symptoms**:
- Error: "JavaScript heap out of memory"
- Generator crashes during execution
- System becomes unresponsive

**Solutions**:

1. **Increase Node.js memory limit**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" node src/main.js
   ```

2. **Reduce parallelism**:
   ```json
   {
     "limits": {
       "parallelism": 1
     }
   }
   ```

3. **Close other applications**

4. **Restart and resume**:
   ```bash
   node src/main.js
   ```

#### Issue: Disk full

**Symptoms**:
- Error: "ENOSPC: no space left on device"
- Generator exits immediately
- Files not being written

**Solutions**:

1. **Check disk space**:
   ```bash
   df -h
   ```

2. **Free up space**:
   ```bash
   # Remove old logs
   rm -f *.log.old
   
   # Remove old backups
   rm -f *.backup.old
   
   # Clean npm cache
   npm cache clean --force
   ```

3. **Move to larger disk**:
   ```bash
   mv generator /path/to/larger/disk/
   ```

#### Issue: Invalid output generated

**Symptoms**:
- Error: "SyntaxError: Unexpected token"
- Application won't load
- Parse errors in topicDescriptions.js

**Solutions**:

1. **Restore from backup**:
   ```bash
   cp web/src/data/topicDescriptions.js.backup web/src/data/topicDescriptions.js
   ```

2. **Validate JavaScript syntax**:
   ```bash
   node -c web/src/data/topicDescriptions.js
   ```

3. **Check for escaping issues**:
   ```bash
   grep -n '\\' web/src/data/topicDescriptions.js
   ```

4. **Regenerate problematic topics**:
   ```bash
   # Find last successful topic in log
   grep "Topic processing completed" generation.log | tail -1
   
   # Restore backup and regenerate from that point
   cp web/src/data/topicDescriptions.js.backup web/src/data/topicDescriptions.js
   node src/main.js
   ```

#### Issue: Slow performance

**Symptoms**:
- Processing time > 60s per topic
- ETA > 6 hours for all topics
- High API latency

**Solutions**:

1. **Check network connection**:
   ```bash
   ping -c 5 api.example.com
   ```

2. **Monitor API latency**:
   ```bash
   grep "duration" generation.log | jq '.duration' | sort -n | tail -10
   ```

3. **Optimize rate limits**:
   ```json
   {
     "api": {
       "rateLimit": {
         "webSearch": 10,
         "sequentialThinking": 20
       }
     }
   }
   ```

4. **Use wired connection** instead of WiFi

5. **Run during off-peak hours**

#### Issue: Progress file corrupted

**Symptoms**:
- Error: "Invalid JSON in progress.json"
- Generator won't start
- Progress file unreadable

**Solutions**:

1. **Backup corrupted file**:
   ```bash
   cp progress.json progress.json.corrupted
   ```

2. **Delete and start fresh**:
   ```bash
   rm progress.json
   node src/main.js
   ```

3. **Or restore from backup** (if available):
   ```bash
   cp progress.json.backup progress.json
   node src/main.js
   ```

### Getting Help

#### Check Documentation

1. **README.md**: This file - comprehensive documentation
2. **USAGE.md**: Detailed usage guide
3. **requirements.md**: Requirements specification
4. **design.md**: Design document
5. **tasks.md**: Implementation tasks

#### Check Logs

```bash
# View recent errors
grep ERROR generation.log | tail -20 | jq '.'

# View specific topic
grep "topicId\":\"ml-101\"" generation.log | jq '.'

# View summary
cat summary.json | jq '.'
```

#### Debug Mode

Run with debug logging:

```bash
node src/main.js --log-level debug
```

#### Test with Small Subset

Test with a few topics first:

```bash
node src/main.js --topics 1,2,3 --dry-run
```

#### Contact Support

If issues persist:
1. Collect logs: `generation.log`, `summary.json`, `progress.json`
2. Note error messages and symptoms
3. Document steps to reproduce
4. Contact support with details

## FAQ

### General Questions

**Q: How long does it take to process all topics?**
A: Typically 2.5-5 hours for 280 topics, depending on API latency and network speed.

**Q: Can I run the generator multiple times?**
A: Yes, but it will regenerate content for all topics. Use `--topics` to regenerate specific topics.

**Q: Will it overwrite existing descriptions?**
A: Yes, but a backup is created first. You can restore from backup if needed.

**Q: Can I interrupt and resume?**
A: Yes, the generator saves progress after each topic. Simply restart it to resume.

### Configuration Questions

**Q: What are the optimal rate limits?**
A: Start with `webSearch: 10, sequentialThinking: 20`. Adjust based on your API tier.

**Q: Can I process topics in parallel?**
A: Yes, set `parallelism > 1` in config, but this is experimental and may cause rate limit issues.

**Q: How do I change the article length?**
A: Adjust `minWordCount` and `maxWordCount` in `config.json`.

### Error Questions

**Q: What if a topic fails after 3 retries?**
A: It's marked as permanently failed and listed in the summary report. You can regenerate it manually later.

**Q: What if the generator crashes?**
A: Simply restart it - it will resume from the last saved progress.

**Q: What if the output is invalid?**
A: Restore from backup and check logs for the problematic topic.

### Content Questions

**Q: Can I customize the article structure?**
A: Yes, modify `ContentGenerator.js` and update `requiredSections` in config.

**Q: Can I change the language?**
A: Yes, modify the prompts in `ContentGenerator.js` and adjust `minCyrillicRatio` in config.

**Q: How do I improve content quality?**
A: Review and adjust prompts in `ContentGenerator.js`, or manually edit generated content.

## Additional Resources

### Documentation

- **Requirements**: `.kiro/specs/polyglossarium-content-generator/requirements.md`
- **Design**: `.kiro/specs/polyglossarium-content-generator/design.md`
- **Tasks**: `.kiro/specs/polyglossarium-content-generator/tasks.md`
- **Usage Guide**: `USAGE.md`

### External Resources

- **Node.js Documentation**: https://nodejs.org/docs/
- **Jest Testing Framework**: https://jestjs.io/
- **fast-check (Property Testing)**: https://fast-check.dev/
- **exa-search MCP**: (API documentation)

### Support

For issues, questions, or contributions:
1. Check this README and other documentation
2. Review logs and error messages
3. Test with small subset first
4. Contact support with detailed information

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**License**: MIT
