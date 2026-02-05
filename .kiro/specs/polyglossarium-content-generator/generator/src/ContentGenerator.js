/**
 * ContentGenerator - Generates structured educational content for topics
 * 
 * This class handles:
 * - Planning article structure using sequential thinking
 * - Finding authoritative sources via web search
 * - Generating structured content sections (intro, tech stack, processes, applications, intersections)
 * - Formatting links and assembling final descriptions
 * 
 * Implements Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.3, 3.5, 4.1, 6.1, 6.3
 */
class ContentGenerator {
  /**
   * Creates a new ContentGenerator instance
   * @param {WebSearchClient} webSearchClient - Client for web search operations
   * @param {Object} config - Configuration object
   */
  constructor(webSearchClient, config = {}) {
    if (!webSearchClient) {
      throw new Error('WebSearchClient is required');
    }
    
    this.webSearch = webSearchClient;
    this.config = {
      minLinks: config.minLinks || 5,
      maxLinks: config.maxLinks || 10,
      language: config.language || 'ru'
    };
  }

  /**
   * Generates complete description for a topic
   * Main orchestration method that coordinates all generation steps
   * 
   * @param {Topic} topic - Topic object with id, title, and categoryName
   * @returns {Promise<TopicDescription>} Generated description with title and content
   * @throws {Error} If generation fails
   * 
   * Implements Requirements: 2.1-2.6, 3.3, 3.5, 4.1, 6.1, 6.3
   */
  async generateDescription(topic) {
    if (!topic || !topic.title) {
      throw new Error('Topic must have a title');
    }

    try {
      // Step 1: Plan the article structure
      const plan = await this.planArticle(topic);
      
      // Step 2: Find authoritative sources
      const sources = await this.findSources(topic);
      
      // Step 3: Generate each section
      const intro = await this.generateIntro(topic, sources, plan);
      const techStack = await this.generateTechStack(topic, sources, plan);
      const processes = await this.generateProcesses(topic, sources, plan);
      const applications = await this.generateApplications(topic, sources, plan);
      const intersections = await this.generateIntersections(topic, sources, plan);
      
      // Step 4: Format links
      const links = this.formatLinks(sources);
      
      // Step 5: Assemble final description
      const description = this.assembleDescription(
        intro,
        techStack,
        processes,
        applications,
        intersections,
        links
      );
      
      return {
        title: topic.title,
        description
      };
    } catch (error) {
      throw new Error(`Failed to generate description for topic "${topic.title}": ${error.message}`);
    }
  }

  /**
   * Plans article structure using sequential thinking
   * Identifies key aspects to cover in each section
   * 
   * @param {Topic} topic - Topic object
   * @returns {Promise<ArticlePlan>} Structured plan with key points for each section
   * 
   * Implements Requirement 6.1: Use Sequential_Thinking for structured content planning
   */
  async planArticle(topic) {
    // This is a placeholder for sequential thinking integration
    // In production, this would use the sequential thinking API/tool
    
    // For now, we'll create a basic plan structure
    const plan = {
      intro: [
        `Определение и основные концепции ${topic.title}`,
        `Историческое развитие и современное состояние`,
        `Ключевые принципы и подходы`
      ],
      techStack: [
        `Основные инструменты и технологии`,
        `Программное обеспечение и платформы`,
        `Стандарты и спецификации`
      ],
      processes: [
        `Типичные рабочие процессы`,
        `Методологии и практики`,
        `Этапы и циклы работы`
      ],
      applications: [
        `Практические применения`,
        `Реальные примеры использования`,
        `Индустриальные кейсы`
      ],
      intersections: [
        `Связи с другими дисциплинами`,
        `Междисциплинарные аспекты`,
        `Смежные области знаний`
      ]
    };
    
    return plan;
  }

  /**
   * Finds authoritative sources using web search
   * Searches for documentation, tutorials, and academic resources
   * 
   * @param {Topic} topic - Topic object
   * @returns {Promise<Array<Source>>} Array of 5-10 relevant sources
   * @throws {Error} If search fails or insufficient sources found
   * 
   * Implements Requirements: 3.1, 3.2, 3.3, 6.2
   */
  async findSources(topic) {
    try {
      // Build search queries
      const queries = this.webSearch.buildQueries(topic);
      
      // Collect results from multiple queries
      const allResults = [];
      
      // Search with first few queries (limit to avoid rate limits)
      const queriesToUse = queries.slice(0, 3);
      
      for (const query of queriesToUse) {
        try {
          const results = await this.webSearch.search(query, {
            numResults: 5,
            type: 'neural'
          });
          allResults.push(...results);
        } catch (error) {
          // Log error but continue with other queries
          console.warn(`Search failed for query "${query}":`, error.message);
        }
      }
      
      if (allResults.length === 0) {
        throw new Error('No search results found');
      }
      
      // Filter and prioritize by quality
      const filteredResults = this.webSearch.filterByQuality(allResults);
      
      // Remove duplicates by URL
      const uniqueResults = this.deduplicateByUrl(filteredResults);
      
      // Take top results within configured limits
      const topResults = uniqueResults.slice(0, this.config.maxLinks);
      
      // Ensure we have minimum required links
      if (topResults.length < this.config.minLinks) {
        console.warn(`Only found ${topResults.length} sources, less than minimum ${this.config.minLinks}`);
      }
      
      return topResults;
    } catch (error) {
      throw new Error(`Failed to find sources: ${error.message}`);
    }
  }

  /**
   * Generates introductory paragraph
   * Explains what the discipline is and its key concepts
   * 
   * @param {Topic} topic - Topic object
   * @param {Array<Source>} sources - Authoritative sources
   * @param {ArticlePlan} plan - Article plan
   * @returns {Promise<string>} Introductory paragraph in Russian
   * 
   * Implements Requirements: 2.1, 4.1
   */
  async generateIntro(topic, sources, plan) {
    // This is a placeholder for AI-powered content generation
    // In production, this would use an LLM API with context from sources
    
    const intro = `${topic.title} — это важная область знаний, которая играет ключевую роль в современном образовании и практике. Эта дисциплина охватывает фундаментальные концепции и методы, необходимые для понимания и работы в данной области. Изучение ${topic.title} позволяет развить критическое мышление и практические навыки, применимые в различных контекстах.`;
    
    return intro;
  }

  /**
   * Generates technology stack section
   * Describes tools, software, and technologies used in the field
   * 
   * @param {Topic} topic - Topic object
   * @param {Array<Source>} sources - Authoritative sources
   * @param {ArticlePlan} plan - Article plan
   * @returns {Promise<string>} Technology section in Russian
   * 
   * Implements Requirements: 2.2, 4.1
   */
  async generateTechStack(topic, sources, plan) {
    // Placeholder for AI-powered content generation
    
    const techStack = `\n\n**Технологии и инструменты:**\n\nВ области ${topic.title} используется широкий спектр инструментов и технологий. Современные специалисты применяют как классические методы, так и новейшие цифровые решения. Основные инструменты включают специализированное программное обеспечение, платформы для совместной работы, и стандартизированные подходы к решению задач.`;
    
    return techStack;
  }

  /**
   * Generates processes section
   * Describes typical workflows, methodologies, and practices
   * 
   * @param {Topic} topic - Topic object
   * @param {Array<Source>} sources - Authoritative sources
   * @param {ArticlePlan} plan - Article plan
   * @returns {Promise<string>} Processes section in Russian
   * 
   * Implements Requirements: 2.3, 4.1
   */
  async generateProcesses(topic, sources, plan) {
    // Placeholder for AI-powered content generation
    
    const processes = `\n\n**Процессы и методологии:**\n\nРабота в области ${topic.title} следует установленным процессам и методологиям. Типичный рабочий процесс включает этапы планирования, реализации, тестирования и оценки результатов. Специалисты применяют систематические подходы для обеспечения качества и эффективности работы.`;
    
    return processes;
  }

  /**
   * Generates applications section
   * Describes real-world applications and use cases
   * 
   * @param {Topic} topic - Topic object
   * @param {Array<Source>} sources - Authoritative sources
   * @param {ArticlePlan} plan - Article plan
   * @returns {Promise<string>} Applications section in Russian
   * 
   * Implements Requirements: 2.4, 4.1
   */
  async generateApplications(topic, sources, plan) {
    // Placeholder for AI-powered content generation
    
    const applications = `\n\n**Практические применения:**\n\n${topic.title} находит широкое применение в различных областях практической деятельности. От академических исследований до промышленных решений, эта дисциплина предоставляет инструменты и методы для решения реальных задач. Специалисты используют знания из ${topic.title} для создания инновационных решений и улучшения существующих процессов.`;
    
    return applications;
  }

  /**
   * Generates intersections section
   * Describes connections with other disciplines and interdisciplinary aspects
   * 
   * @param {Topic} topic - Topic object
   * @param {Array<Source>} sources - Authoritative sources
   * @param {ArticlePlan} plan - Article plan
   * @returns {Promise<string>} Intersections section in Russian
   * 
   * Implements Requirements: 2.5, 4.1
   */
  async generateIntersections(topic, sources, plan) {
    // Placeholder for AI-powered content generation
    
    const intersections = `\n\n**Междисциплинарные связи:**\n\n${topic.title} тесно связана с другими областями знаний, образуя богатую сеть междисциплинарных взаимодействий. Понимание этих связей позволяет применять знания более эффективно и находить инновационные решения на стыке дисциплин. Интеграция подходов из разных областей обогащает практику и открывает новые возможности для исследований.`;
    
    return intersections;
  }

  /**
   * Formats sources as markdown links
   * Creates compact [text](url) format for each source
   * 
   * @param {Array<Source>} sources - Array of sources
   * @returns {string} Formatted links section
   * 
   * Implements Requirements: 3.5, 5.3
   */
  formatLinks(sources) {
    if (!Array.isArray(sources) || sources.length === 0) {
      return '\n\n**Источники:**\n\nИсточники будут добавлены позже.';
    }
    
    let linksSection = '\n\n**Источники:**\n\n';
    
    sources.forEach((source, index) => {
      const title = source.title || `Источник ${index + 1}`;
      const url = source.url || '#';
      
      // Create markdown link in format [text](url)
      linksSection += `${index + 1}. [${title}](${url})\n`;
    });
    
    return linksSection;
  }

  /**
   * Assembles final description from all sections
   * Combines sections with proper formatting and structure
   * 
   * @param {string} intro - Introduction paragraph
   * @param {string} techStack - Technology section
   * @param {string} processes - Processes section
   * @param {string} applications - Applications section
   * @param {string} intersections - Intersections section
   * @param {string} links - Formatted links
   * @returns {string} Complete assembled description
   * 
   * Implements Requirement 2.6: Maintain consistent section ordering
   */
  assembleDescription(intro, techStack, processes, applications, intersections, links) {
    // Combine all sections in the required order
    const description = intro + techStack + processes + applications + intersections + links;
    
    return description.trim();
  }

  /**
   * Removes duplicate sources by URL
   * Keeps the first occurrence of each unique URL
   * 
   * @param {Array<Source>} sources - Array of sources
   * @returns {Array<Source>} Deduplicated array
   * @private
   */
  deduplicateByUrl(sources) {
    const seen = new Set();
    const unique = [];
    
    for (const source of sources) {
      const url = source.url?.toLowerCase() || '';
      
      if (url && !seen.has(url)) {
        seen.add(url);
        unique.push(source);
      }
    }
    
    return unique;
  }
}

export default ContentGenerator;
