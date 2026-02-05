# Design Document: Polyglossarium Content Generator

## Overview

Polyglossarium Content Generator — это автоматизированная система для генерации структурированных образовательных статей для всех тем в энциклопедии. Система использует AI-инструменты (web search, sequential thinking) для создания качественного контента на русском языке с единым стилем и структурой.

Ключевые особенности:
- Обработка 280+ тем из всех академических дисциплин
- Автоматический поиск и подбор авторитетных источников
- Структурированная генерация с фиксированными разделами
- Сохранение прогресса и обработка ошибок
- Интеграция с существующей структурой данных

## Architecture

Система построена по pipeline-архитектуре с последовательными этапами обработки:

```
[Curriculum Reader] → [Topic Iterator] → [Content Generator] → [Validator] → [Writer]
                                              ↓
                                        [Web Search]
                                        [Sequential Thinking]
```

### Компоненты:

1. **Curriculum Reader**: Читает curriculum.js и извлекает список всех тем
2. **Topic Iterator**: Управляет итерацией по темам, отслеживает прогресс
3. **Content Generator**: Генерирует структурированный контент для каждой темы
4. **Web Search Client**: Взаимодействует с exa-search MCP для поиска источников
5. **Validator**: Проверяет качество и структуру сгенерированного контента
6. **Writer**: Сохраняет результаты в topicDescriptions.js

### Поток данных:

1. Чтение curriculum.js → список тем с ID и названиями
2. Для каждой темы:
   - Поиск источников через Web Search
   - Генерация структурированного контента
   - Валидация контента
   - Сохранение в topicDescriptions.js
3. Генерация итогового отчета

## Components and Interfaces

### CurriculumReader

```javascript
class CurriculumReader {
  /**
   * Читает curriculum.js и извлекает все темы
   * @returns {Array<Topic>} Массив объектов тем
   */
  readCurriculum() {
    // Читает файл curriculum.js
    // Извлекает все категории и темы
    // Возвращает плоский список тем с метаданными
  }
  
  /**
   * Извлекает темы из категории
   * @param {Object} category - Объект категории
   * @returns {Array<Topic>} Массив тем
   */
  extractTopics(category) {
    // Извлекает topics из категории
    // Добавляет categoryName к каждой теме
  }
}
```

### TopicIterator

```javascript
class TopicIterator {
  constructor(topics, progressFile) {
    this.topics = topics;
    this.progressFile = progressFile;
    this.currentIndex = 0;
    this.processed = new Set();
    this.failed = new Map();
  }
  
  /**
   * Загружает сохраненный прогресс
   */
  loadProgress() {
    // Читает progressFile
    // Восстанавливает currentIndex и processed
  }
  
  /**
   * Сохраняет текущий прогресс
   */
  saveProgress() {
    // Сохраняет currentIndex, processed, failed в progressFile
  }
  
  /**
   * Возвращает следующую тему для обработки
   * @returns {Topic|null} Следующая тема или null если все обработаны
   */
  next() {
    // Пропускает уже обработанные темы
    // Возвращает следующую необработанную тему
  }
  
  /**
   * Отмечает тему как обработанную
   * @param {string} topicId - ID темы
   */
  markProcessed(topicId) {
    this.processed.add(topicId);
    this.saveProgress();
  }
  
  /**
   * Отмечает тему как неудачную
   * @param {string} topicId - ID темы
   * @param {Error} error - Ошибка
   */
  markFailed(topicId, error) {
    const attempts = this.failed.get(topicId) || 0;
    this.failed.set(topicId, attempts + 1);
    this.saveProgress();
  }
  
  /**
   * Проверяет, нужно ли повторить тему
   * @param {string} topicId - ID темы
   * @returns {boolean} true если нужно повторить
   */
  shouldRetry(topicId) {
    const attempts = this.failed.get(topicId) || 0;
    return attempts < 3;
  }
  
  /**
   * Возвращает статистику прогресса
   * @returns {Object} Статистика
   */
  getStats() {
    return {
      total: this.topics.length,
      processed: this.processed.size,
      failed: this.failed.size,
      remaining: this.topics.length - this.processed.size
    };
  }
}
```

### ContentGenerator

```javascript
class ContentGenerator {
  constructor(webSearchClient, sequentialThinking) {
    this.webSearch = webSearchClient;
    this.sequentialThinking = sequentialThinking;
  }
  
  /**
   * Генерирует полное описание для темы
   * @param {Topic} topic - Объект темы
   * @returns {Promise<TopicDescription>} Сгенерированное описание
   */
  async generateDescription(topic) {
    // 1. Планирует структуру статьи
    const plan = await this.planArticle(topic);
    
    // 2. Ищет источники
    const sources = await this.findSources(topic);
    
    // 3. Генерирует каждый раздел
    const intro = await this.generateIntro(topic, sources);
    const techStack = await this.generateTechStack(topic, sources);
    const processes = await this.generateProcesses(topic, sources);
    const applications = await this.generateApplications(topic, sources);
    const intersections = await this.generateIntersections(topic, sources);
    
    // 4. Форматирует ссылки
    const links = this.formatLinks(sources);
    
    // 5. Собирает финальное описание
    return {
      title: topic.title,
      description: this.assembleDescription(
        intro, techStack, processes, applications, intersections, links
      )
    };
  }
  
  /**
   * Планирует структуру статьи
   * @param {Topic} topic - Объект темы
   * @returns {Promise<ArticlePlan>} План статьи
   */
  async planArticle(topic) {
    // Использует sequential thinking для планирования
    // Определяет ключевые аспекты темы
    // Возвращает структурированный план
  }
  
  /**
   * Ищет авторитетные источники
   * @param {Topic} topic - Объект темы
   * @returns {Promise<Array<Source>>} Массив источников
   */
  async findSources(topic) {
    // Формирует поисковые запросы
    // Вызывает web search API
    // Фильтрует и ранжирует результаты
    // Возвращает 5-10 лучших источников
  }
  
  /**
   * Генерирует вводный параграф
   * @param {Topic} topic - Объект темы
   * @param {Array<Source>} sources - Источники
   * @returns {Promise<string>} Вводный параграф
   */
  async generateIntro(topic, sources) {
    // Генерирует параграф, объясняющий что такое дисциплина
    // Использует информацию из источников
    // Поддерживает технический стиль
  }
  
  /**
   * Генерирует раздел о технологиях и инструментах
   * @param {Topic} topic - Объект темы
   * @param {Array<Source>} sources - Источники
   * @returns {Promise<string>} Раздел о технологиях
   */
  async generateTechStack(topic, sources) {
    // Описывает технологический стек
    // Перечисляет основные инструменты
    // Объясняет их применение
  }
  
  /**
   * Генерирует раздел о процессах
   * @param {Topic} topic - Объект темы
   * @param {Array<Source>} sources - Источники
   * @returns {Promise<string>} Раздел о процессах
   */
  async generateProcesses(topic, sources) {
    // Описывает типичные процессы и методологии
    // Объясняет рабочие процессы
  }
  
  /**
   * Генерирует раздел о применениях
   * @param {Topic} topic - Объект темы
   * @param {Array<Source>} sources - Источники
   * @returns {Promise<string>} Раздел о применениях
   */
  async generateApplications(topic, sources) {
    // Описывает реальные применения
    // Приводит примеры использования
  }
  
  /**
   * Генерирует раздел о пересечениях с другими областями
   * @param {Topic} topic - Объект темы
   * @param {Array<Source>} sources - Источники
   * @returns {Promise<string>} Раздел о пересечениях
   */
  async generateIntersections(topic, sources) {
    // Описывает связи с другими дисциплинами
    // Объясняет междисциплинарные аспекты
  }
  
  /**
   * Форматирует ссылки в компактный формат
   * @param {Array<Source>} sources - Источники
   * @returns {string} Отформатированные ссылки
   */
  formatLinks(sources) {
    // Преобразует источники в формат [text](url)
    // Создает компактное представление
  }
  
  /**
   * Собирает финальное описание из разделов
   * @param {...string} sections - Разделы статьи
   * @returns {string} Полное описание
   */
  assembleDescription(...sections) {
    // Объединяет разделы с правильными разделителями
    // Добавляет ссылки в конец
  }
}
```

### WebSearchClient

```javascript
class WebSearchClient {
  constructor(exaSearchMCP) {
    this.mcp = exaSearchMCP;
  }
  
  /**
   * Ищет источники по теме
   * @param {string} query - Поисковый запрос
   * @param {Object} options - Опции поиска
   * @returns {Promise<Array<SearchResult>>} Результаты поиска
   */
  async search(query, options = {}) {
    // Вызывает exa-search MCP
    // Обрабатывает результаты
    // Возвращает массив источников
  }
  
  /**
   * Фильтрует результаты по качеству
   * @param {Array<SearchResult>} results - Результаты поиска
   * @returns {Array<SearchResult>} Отфильтрованные результаты
   */
  filterByQuality(results) {
    // Приоритизирует официальную документацию
    // Фильтрует образовательные ресурсы
    // Удаляет низкокачественные источники
  }
  
  /**
   * Формирует поисковые запросы для темы
   * @param {Topic} topic - Объект темы
   * @returns {Array<string>} Массив запросов
   */
  buildQueries(topic) {
    // Создает запросы на русском и английском
    // Добавляет ключевые слова (documentation, tutorial, guide)
    // Возвращает список запросов
  }
}
```

### ContentValidator

```javascript
class ContentValidator {
  /**
   * Валидирует сгенерированное описание
   * @param {TopicDescription} description - Описание темы
   * @returns {ValidationResult} Результат валидации
   */
  validate(description) {
    const errors = [];
    const warnings = [];
    
    // Проверяет наличие всех разделов
    if (!this.hasAllSections(description.description)) {
      errors.push('Missing required sections');
    }
    
    // Проверяет длину
    const wordCount = this.countWords(description.description);
    if (wordCount < 500) {
      errors.push('Content too short');
    }
    if (wordCount > 2000) {
      warnings.push('Content might be too long');
    }
    
    // Проверяет формат ссылок
    if (!this.validateLinks(description.description)) {
      errors.push('Invalid link format');
    }
    
    // Проверяет язык
    if (!this.isRussian(description.description)) {
      errors.push('Content not in Russian');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Проверяет наличие всех обязательных разделов
   * @param {string} content - Контент
   * @returns {boolean} true если все разделы присутствуют
   */
  hasAllSections(content) {
    // Проверяет наличие ключевых слов разделов
    // Возвращает true если все разделы найдены
  }
  
  /**
   * Подсчитывает слова в тексте
   * @param {string} content - Контент
   * @returns {number} Количество слов
   */
  countWords(content) {
    // Разбивает текст на слова
    // Возвращает количество
  }
  
  /**
   * Валидирует формат ссылок
   * @param {string} content - Контент
   * @returns {boolean} true если все ссылки корректны
   */
  validateLinks(content) {
    // Проверяет формат [text](url)
    // Проверяет валидность URL
  }
  
  /**
   * Проверяет, что текст на русском языке
   * @param {string} content - Контент
   * @returns {boolean} true если текст на русском
   */
  isRussian(content) {
    // Проверяет наличие кириллицы
    // Проверяет соотношение кириллицы к латинице
  }
}
```

### TopicDescriptionsWriter

```javascript
class TopicDescriptionsWriter {
  constructor(filePath) {
    this.filePath = filePath;
    this.backupPath = filePath + '.backup';
  }
  
  /**
   * Создает резервную копию файла
   */
  async createBackup() {
    // Копирует текущий файл в .backup
  }
  
  /**
   * Читает существующие описания
   * @returns {Object} Объект с описаниями
   */
  async readExisting() {
    // Читает topicDescriptions.js
    // Парсит JavaScript объект
    // Возвращает существующие описания
  }
  
  /**
   * Обновляет описание темы
   * @param {string} topicId - ID темы
   * @param {TopicDescription} description - Новое описание
   */
  async updateTopic(topicId, description) {
    // Читает существующие описания
    // Обновляет или добавляет новое описание
    // Сохраняет обратно в файл
  }
  
  /**
   * Сохраняет все описания в файл
   * @param {Object} descriptions - Объект с описаниями
   */
  async saveAll(descriptions) {
    // Форматирует объект в JavaScript код
    // Экранирует специальные символы
    // Сохраняет в файл
    // Валидирует синтаксис
  }
  
  /**
   * Валидирует JavaScript синтаксис
   * @param {string} code - JavaScript код
   * @returns {boolean} true если синтаксис корректен
   */
  validateSyntax(code) {
    // Пытается распарсить код
    // Возвращает true если успешно
  }
}
```

## Data Models

### Topic

```javascript
{
  id: string,           // Уникальный ID темы
  title: string,        // Название темы
  categoryName: string, // Название категории
  categoryId: number    // ID категории
}
```

### TopicDescription

```javascript
{
  title: string,       // Название темы
  description: string  // Полное описание с разделами и ссылками
}
```

### Source

```javascript
{
  title: string,       // Название источника
  url: string,         // URL источника
  snippet: string,     // Краткое описание
  relevance: number,   // Оценка релевантности (0-1)
  type: string         // Тип: 'documentation', 'tutorial', 'academic', 'other'
}
```

### ArticlePlan

```javascript
{
  intro: string[],          // Ключевые пункты для введения
  techStack: string[],      // Технологии и инструменты
  processes: string[],      // Процессы и методологии
  applications: string[],   // Применения
  intersections: string[]   // Пересечения с другими областями
}
```

### ValidationResult

```javascript
{
  valid: boolean,      // true если валидация прошла
  errors: string[],    // Массив ошибок
  warnings: string[]   // Массив предупреждений
}
```

### ProgressState

```javascript
{
  currentIndex: number,           // Текущий индекс в списке тем
  processed: Set<string>,         // Множество обработанных ID
  failed: Map<string, number>,    // Карта неудачных попыток
  timestamp: string               // Время последнего сохранения
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be combined:

**Structural Validation (2.1-2.6)**: All section presence checks can be combined into one comprehensive property that validates complete article structure.

**Link Format Validation (3.5, 5.3, 8.3)**: These three criteria all check the same thing - link format. Can be combined into one property.

**Language Validation (4.1, 8.4)**: Both check for Russian language. Can be combined into one property.

**Format Validation (5.2, 5.4)**: Both check the output format structure. Can be combined.

**Process Verification (6.1, 6.2, 6.3)**: All verify that specific tools are used. Can be combined into one property about tool usage.

**Statistics Reporting (9.3, 9.4)**: Both about final report content. Can be combined.

**Syntax Validation (10.2, 10.5)**: Both check JavaScript syntax validity. Can be combined.

### Correctness Properties

Property 1: Complete Topic Coverage
*For any* curriculum structure, processing all categories should result in every topic being either successfully processed or marked as failed, with no topics skipped or lost.
**Validates: Requirements 1.1, 1.2**

Property 2: No Duplicate Processing
*For any* execution of the content generator, no topic ID should appear more than once in the processed set.
**Validates: Requirements 1.3**

Property 3: Statistics Accuracy
*For any* completed generation run, the sum of (successful + failed + skipped) should equal the total number of topics in the curriculum.
**Validates: Requirements 1.4, 9.4**

Property 4: Error Resilience
*For any* topic that fails during generation, the system should continue processing remaining topics and log the failure with the topic ID.
**Validates: Requirements 1.5, 7.1**

Property 5: Complete Article Structure
*For any* successfully generated article, it should contain all five required sections: introduction, technology stack, processes, applications, and intersections, in that exact order.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.1**

Property 6: Source Quality Prioritization
*For any* set of search results, when filtered and ranked, official documentation and academic resources should appear before other source types.
**Validates: Requirements 3.2**

Property 7: Link Count Constraint
*For any* generated article, the number of formatted links should be between 5 and 10 inclusive.
**Validates: Requirements 3.3**

Property 8: Link Format Consistency
*For any* generated article, all links should match the markdown format [text](url) with valid URLs.
**Validates: Requirements 3.5, 5.3, 8.3**

Property 9: Russian Language Content
*For any* generated article, the content should be primarily in Russian, with Cyrillic characters comprising at least 70% of alphabetic characters.
**Validates: Requirements 4.1, 8.4**

Property 10: Data Extraction Completeness
*For any* curriculum file, reading it should extract all topic IDs and titles without loss or corruption.
**Validates: Requirements 5.1**

Property 11: Output Format Validity
*For any* generated description, it should conform to the structure {id: {title: string, description: string}} and be valid JavaScript syntax.
**Validates: Requirements 5.2, 5.4, 10.2, 10.5**

Property 12: Curriculum Immutability
*For any* execution of the content generator, the curriculum.js file should remain byte-for-byte identical before and after execution.
**Validates: Requirements 5.5**

Property 13: Tool Usage Verification
*For any* topic generation, the system should invoke Web_Search for finding sources, Sequential_Thinking for planning, and validation before saving.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

Property 14: Graceful Error Handling
*For any* API error (rate limit, timeout, etc.), the system should catch the error, log it, and continue processing without crashing.
**Validates: Requirements 6.5**

Property 15: Progress Persistence
*For any* successful topic generation, the progress state should be saved to disk before proceeding to the next topic.
**Validates: Requirements 7.2**

Property 16: Recovery from Interruption
*For any* interrupted execution, restarting the generator should resume from the last successfully saved state without reprocessing completed topics.
**Validates: Requirements 7.3**

Property 17: Retry Limit
*For any* failed topic, the system should retry generation exactly 3 times before marking it as permanently failed.
**Validates: Requirements 7.4**

Property 18: Failure Reporting
*For any* completed generation run, the final report should list all topics that failed after all retry attempts.
**Validates: Requirements 7.5, 9.3**

Property 19: Word Count Constraint
*For any* generated article, the word count should be between 500 and 2000 words inclusive.
**Validates: Requirements 8.2**

Property 20: Validation Flagging
*For any* article that fails validation checks, it should be flagged in the output and included in the manual review list.
**Validates: Requirements 8.5**

Property 21: Progress Indicator Accuracy
*For any* point during execution, the progress indicator should show processed count equal to the size of the processed set, and total equal to the curriculum topic count.
**Validates: Requirements 9.1**

Property 22: Timestamped Logging
*For any* completed topic, there should exist a log entry containing the topic ID and a valid ISO 8601 timestamp.
**Validates: Requirements 9.2**

Property 23: Time Estimation
*For any* point during execution with at least 5 processed topics, the remaining time estimate should be calculated as (remaining topics × average time per topic).
**Validates: Requirements 9.5**

Property 24: File Update
*For any* successfully generated topic, the topicDescriptions.js file should contain an entry for that topic ID after the generator completes.
**Validates: Requirements 10.1**

Property 25: Character Escaping
*For any* generated content containing quotes, newlines, or backslashes, these characters should be properly escaped in the saved JavaScript file.
**Validates: Requirements 10.3**

Property 26: Backup Creation
*For any* execution that modifies topicDescriptions.js, a backup file should exist before any modifications are made.
**Validates: Requirements 10.4**

## Error Handling

### Error Categories

1. **File System Errors**
   - File not found: Log error, create file if needed
   - Permission denied: Log error, exit with clear message
   - Disk full: Log error, exit with clear message

2. **API Errors**
   - Rate limit exceeded: Wait and retry with exponential backoff
   - Timeout: Retry up to 3 times
   - Invalid response: Log error, mark topic as failed

3. **Validation Errors**
   - Missing sections: Flag for manual review
   - Invalid format: Attempt to fix, or flag for manual review
   - Word count out of range: Flag for manual review

4. **Parse Errors**
   - Invalid JavaScript syntax: Restore from backup, log error
   - Malformed curriculum: Exit with clear error message

### Error Recovery Strategy

1. **Transient Errors**: Retry with exponential backoff (1s, 2s, 4s)
2. **Permanent Errors**: Log, mark as failed, continue with next topic
3. **Critical Errors**: Save progress, create error report, exit gracefully

### Logging

All errors should be logged with:
- Timestamp (ISO 8601)
- Error type
- Topic ID (if applicable)
- Error message
- Stack trace (for debugging)

## Testing Strategy

### Unit Testing

Unit tests should focus on:
- Individual component functionality (CurriculumReader, ContentValidator, etc.)
- Data transformation functions (formatLinks, assembleDescription)
- Error handling for specific error types
- Edge cases (empty curriculum, malformed data)

### Property-Based Testing

Property-based tests should verify the correctness properties defined above. Each property test should:
- Run minimum 100 iterations
- Generate random but valid test data
- Verify the property holds for all generated inputs
- Tag with format: **Feature: polyglossarium-content-generator, Property N: [property text]**

**Key Property Tests:**

1. **Complete Coverage Test**: Generate random curriculum structures, verify all topics processed
2. **No Duplicates Test**: Run generator, verify processed set has no duplicates
3. **Statistics Test**: Generate random curriculum, verify statistics sum correctly
4. **Structure Test**: Generate random topics, verify all articles have required sections
5. **Link Format Test**: Generate random articles, verify all links match [text](url) format
6. **Language Test**: Generate random articles, verify Russian language content
7. **Format Validity Test**: Generate random descriptions, verify valid JavaScript syntax
8. **Immutability Test**: Run generator, verify curriculum.js unchanged
9. **Progress Persistence Test**: Interrupt and resume, verify no reprocessing
10. **Retry Test**: Inject failures, verify exactly 3 retries per topic

### Integration Testing

Integration tests should verify:
- End-to-end flow from curriculum reading to file writing
- Interaction with external APIs (web search)
- Progress saving and recovery
- Backup creation and restoration

### Manual Testing

Manual review should verify:
- Content quality and coherence
- Appropriateness of selected sources
- Russian language quality
- Educational value of content

## Performance Considerations

### Expected Performance

- Processing time per topic: 30-60 seconds (depends on API latency)
- Total processing time for 280 topics: 2.5-5 hours
- Memory usage: < 500 MB
- Disk space: ~10 MB for generated content

### Optimization Strategies

1. **Parallel Processing**: Process multiple topics concurrently (with rate limiting)
2. **Caching**: Cache web search results to avoid duplicate queries
3. **Batch Saving**: Save progress in batches instead of after each topic
4. **Incremental Updates**: Only update changed topics in topicDescriptions.js

### Rate Limiting

- Web search API: Max 10 requests per minute
- Sequential thinking: Max 20 requests per minute
- Implement exponential backoff for rate limit errors

## Deployment Considerations

### Prerequisites

- Node.js 18+ or Python 3.9+
- Access to exa-search MCP
- Access to sequential thinking API
- Write permissions for data files

### Configuration

Configuration should be externalized in a config file:

```javascript
{
  "curriculumPath": "web/src/data/curriculum.js",
  "descriptionsPath": "web/src/data/topicDescriptions.js",
  "progressPath": ".kiro/specs/polyglossarium-content-generator/progress.json",
  "logPath": ".kiro/specs/polyglossarium-content-generator/generation.log",
  "maxRetries": 3,
  "minWordCount": 500,
  "maxWordCount": 2000,
  "minLinks": 5,
  "maxLinks": 10,
  "parallelism": 3,
  "rateLimit": {
    "webSearch": 10,
    "sequentialThinking": 20
  }
}
```

### Monitoring

The system should provide:
- Real-time progress updates
- Error rate monitoring
- Average processing time per topic
- API usage statistics
- Estimated completion time

### Rollback Strategy

If generation fails catastrophically:
1. Stop the generator
2. Restore topicDescriptions.js from backup
3. Review error logs
4. Fix issues
5. Resume from last saved progress
