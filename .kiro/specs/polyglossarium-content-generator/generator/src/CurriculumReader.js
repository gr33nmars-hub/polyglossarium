import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CurriculumReader - Reads and parses curriculum.js to extract all topics
 * 
 * This class is responsible for reading the curriculum file and extracting
 * all topics from the nested category structure into a flat list.
 */
class CurriculumReader {
  /**
   * Creates a new CurriculumReader instance
   * @param {string} curriculumPath - Path to curriculum.js file (relative to project root)
   */
  constructor(curriculumPath) {
    this.curriculumPath = curriculumPath;
  }

  /**
   * Reads curriculum.js and extracts all topics
   * @returns {Promise<Array<Topic>>} Array of topic objects with metadata
   * @throws {Error} If file not found or parse error occurs
   * 
   * Topic structure:
   * {
   *   id: string,           // Unique topic ID
   *   title: string,        // Topic title
   *   categoryName: string, // Name of the category
   *   categoryId: number    // ID of the category
   * }
   */
  async readCurriculum() {
    try {
      // Read the curriculum file
      const fileContent = await fs.readFile(this.curriculumPath, 'utf-8');
      
      // Parse the curriculum data
      // The file exports a curriculum array, so we need to extract it
      const curriculum = this._parseCurriculumFile(fileContent);
      
      // Extract all topics from all categories
      const allTopics = [];
      for (const category of curriculum) {
        const topics = this.extractTopics(category);
        allTopics.push(...topics);
      }
      
      return allTopics;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Curriculum file not found: ${this.curriculumPath}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse curriculum file: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Parses the curriculum file content to extract the curriculum array
   * @param {string} fileContent - Raw file content
   * @returns {Array} Parsed curriculum array
   * @throws {SyntaxError} If parsing fails
   * @private
   */
  _parseCurriculumFile(fileContent) {
    try {
      // Remove the export statement and extract the array
      // The file has: export const curriculum = [...]
      const match = fileContent.match(/export\s+const\s+curriculum\s*=\s*(\[[\s\S]*\]);?\s*$/);
      
      if (!match) {
        throw new SyntaxError('Could not find curriculum array in file');
      }
      
      // Parse the JSON array
      const curriculumJson = match[1];
      const curriculum = JSON.parse(curriculumJson);
      
      if (!Array.isArray(curriculum)) {
        throw new SyntaxError('Curriculum is not an array');
      }
      
      return curriculum;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw error;
      }
      throw new SyntaxError(`Failed to parse curriculum: ${error.message}`);
    }
  }

  /**
   * Extracts topics from a category
   * @param {Object} category - Category object from curriculum
   * @returns {Array<Topic>} Array of topics with category metadata
   * 
   * Adds categoryName and categoryId to each topic for traceability
   */
  extractTopics(category) {
    if (!category || typeof category !== 'object') {
      throw new Error('Invalid category object');
    }
    
    if (!category.topics || !Array.isArray(category.topics)) {
      throw new Error(`Category "${category.category || 'unknown'}" has no topics array`);
    }
    
    const categoryName = category.category || 'Unknown Category';
    const categoryId = category.id;
    
    // Map each topic to include category metadata
    return category.topics.map(topic => ({
      id: topic.id,
      title: topic.title,
      categoryName: categoryName,
      categoryId: categoryId
    }));
  }
}

export default CurriculumReader;
