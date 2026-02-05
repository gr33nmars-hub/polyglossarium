/**
 * ContentValidator - Validates generated content for quality and structure
 * 
 * Validates that generated topic descriptions meet all requirements:
 * - Contains all required sections
 * - Has appropriate word count (500-2000 words)
 * - Has properly formatted links
 * - Is written in Russian language
 */
class ContentValidator {
  /**
   * Validates a generated topic description
   * @param {Object} description - Topic description object with title and description
   * @returns {Object} Validation result with valid flag, errors, and warnings
   */
  validate(description) {
    if (!description || typeof description !== 'object') {
      return {
        valid: false,
        errors: ['Invalid description object'],
        warnings: []
      };
    }

    if (!description.title || typeof description.title !== 'string') {
      return {
        valid: false,
        errors: ['Missing or invalid title'],
        warnings: []
      };
    }

    if (!description.description || typeof description.description !== 'string') {
      return {
        valid: false,
        errors: ['Missing or invalid description content'],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Check for all required sections
    if (!this.hasAllSections(description.description)) {
      errors.push('Missing required sections');
    }

    // Check word count
    const wordCount = this.countWords(description.description);
    if (wordCount < 500) {
      errors.push(`Content too short: ${wordCount} words (minimum 500)`);
    }
    if (wordCount > 2000) {
      errors.push(`Content too long: ${wordCount} words (maximum 2000)`);
    }

    // Check link format
    if (!this.validateLinks(description.description)) {
      errors.push('Invalid link format');
    }

    // Check language
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
   * Checks if content has all required sections
   * @param {string} content - Content to check
   * @returns {boolean} True if all sections are present
   */
  hasAllSections(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // Required section keywords/patterns
    // Based on design.md, articles should have:
    // 1. Introduction (вводный параграф)
    // 2. Technology stack (технологии, инструменты)
    // 3. Processes (процессы, методологии)
    // 4. Applications (применения, использование)
    // 5. Intersections (пересечения, связи с другими областями)

    const sectionPatterns = [
      // Introduction - should be present at the start
      /^.{100,}/s, // At least 100 characters at the start
      
      // Technology/Tools section
      /(технолог|инструмент|средств|библиотек|фреймворк|платформ)/i,
      
      // Processes/Methodologies section
      /(процесс|методолог|подход|практик|этап|шаг)/i,
      
      // Applications section
      /(применен|использован|использует|применяет|задач|проблем|решен)/i,
      
      // Intersections section
      /(пересечен|связ|взаимодейств|интеграц|комбинир|совмест|област)/i
    ];

    // Check if all patterns are found in the content
    return sectionPatterns.every(pattern => pattern.test(content));
  }

  /**
   * Counts words in the content
   * @param {string} content - Content to count words in
   * @returns {number} Number of words
   */
  countWords(content) {
    if (!content || typeof content !== 'string') {
      return 0;
    }

    // Remove markdown links [text](url) but keep the text
    const withoutLinks = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // Remove extra whitespace and split by whitespace
    const words = withoutLinks
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => word.length > 0);

    return words.length;
  }

  /**
   * Validates that all links are properly formatted
   * @param {string} content - Content to check
   * @returns {boolean} True if all links are valid
   */
  validateLinks(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // Find all markdown links [text](url)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [...content.matchAll(linkPattern)];

    // If no links found, that's invalid (should have 5-10 links per requirement)
    if (links.length === 0) {
      return false;
    }

    // Validate each link
    for (const match of links) {
      const text = match[1];
      const url = match[2];

      // Check that text is not empty
      if (!text || text.trim().length === 0) {
        return false;
      }

      // Check that URL is valid
      if (!url || url.trim().length === 0) {
        return false;
      }

      // Check that URL starts with http:// or https://
      if (!url.match(/^https?:\/\/.+/)) {
        return false;
      }

      // Check for basic URL structure (has domain)
      if (!url.match(/^https?:\/\/[^\/\s]+/)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if content is primarily in Russian
   * @param {string} content - Content to check
   * @returns {boolean} True if content is in Russian
   */
  isRussian(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // Remove markdown links to avoid counting URLs
    const withoutLinks = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // Remove numbers, punctuation, and whitespace
    const textOnly = withoutLinks.replace(/[0-9\s\p{P}]/gu, '');

    if (textOnly.length === 0) {
      return false;
    }

    // Count Cyrillic and Latin characters
    const cyrillicChars = (textOnly.match(/[\u0400-\u04FF]/g) || []).length;
    const latinChars = (textOnly.match(/[a-zA-Z]/g) || []).length;
    const totalAlphabetic = cyrillicChars + latinChars;

    if (totalAlphabetic === 0) {
      return false;
    }

    // Cyrillic should comprise at least 70% of alphabetic characters
    const cyrillicRatio = cyrillicChars / totalAlphabetic;
    return cyrillicRatio >= 0.7;
  }
}

export default ContentValidator;
