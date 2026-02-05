import fs from 'fs/promises';
import path from 'path';

/**
 * TopicDescriptionsWriter - Manages reading and writing topicDescriptions.js
 * 
 * Handles:
 * - Creating backups before modifications
 * - Reading and parsing existing topicDescriptions.js
 * - Updating individual topics
 * - Writing complete file with proper formatting
 * - Validating JavaScript syntax
 * - Proper escaping of quotes and special characters
 */
class TopicDescriptionsWriter {
  /**
   * Creates a new TopicDescriptionsWriter
   * @param {string} filePath - Path to topicDescriptions.js file
   */
  constructor(filePath) {
    this.filePath = filePath;
    this.backupPath = filePath + '.backup';
  }

  /**
   * Creates a backup of the original file
   * @returns {Promise<void>}
   */
  async createBackup() {
    try {
      // Check if the file exists
      await fs.access(this.filePath);
      
      // Copy the file to backup location
      await fs.copyFile(this.filePath, this.backupPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, no backup needed
        return;
      }
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Reads and parses existing topicDescriptions.js
   * @returns {Promise<Object>} Object with topic descriptions
   */
  async readExisting() {
    try {
      // Read the file
      const content = await fs.readFile(this.filePath, 'utf-8');
      
      // Extract the object from the export statement
      // The file format is: export const topicDescriptions = { ... };
      const match = content.match(/export\s+const\s+topicDescriptions\s*=\s*(\{[\s\S]*\});/);
      
      if (!match) {
        throw new Error('Could not parse topicDescriptions.js: invalid format');
      }

      // Parse the JavaScript object
      // We need to evaluate it safely
      const objectString = match[1];
      
      // Use Function constructor to safely evaluate the object
      // This is safer than eval() but still requires trust in the source
      const descriptions = new Function(`return ${objectString}`)();
      
      return descriptions;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty object
        return {};
      }
      throw new Error(`Failed to read existing descriptions: ${error.message}`);
    }
  }

  /**
   * Updates or adds a single topic description
   * @param {string} topicId - ID of the topic
   * @param {Object} description - Description object with title and description
   * @returns {Promise<void>}
   */
  async updateTopic(topicId, description) {
    // Read existing descriptions
    const descriptions = await this.readExisting();
    
    // Update or add the topic
    descriptions[topicId] = {
      title: description.title,
      description: description.description
    };
    
    // Save all descriptions
    await this.saveAll(descriptions);
  }

  /**
   * Saves all descriptions to the file
   * @param {Object} descriptions - Object with all topic descriptions
   * @returns {Promise<void>}
   */
  async saveAll(descriptions) {
    // Format the descriptions object as JavaScript code
    const code = this._formatAsJavaScript(descriptions);
    
    // Validate syntax before saving
    if (!this.validateSyntax(code)) {
      throw new Error('Generated code has invalid JavaScript syntax');
    }
    
    // Create backup before writing
    await this.createBackup();
    
    // Write to file
    await fs.writeFile(this.filePath, code, 'utf-8');
  }

  /**
   * Formats descriptions object as JavaScript code
   * @param {Object} descriptions - Descriptions object
   * @returns {string} Formatted JavaScript code
   * @private
   */
  _formatAsJavaScript(descriptions) {
    const lines = [];
    
    // Add header comment
    lines.push('// Расширенные научные описания для каждого модуля');
    lines.push('export const topicDescriptions = {');
    
    // Sort keys numerically for consistent output
    const sortedKeys = Object.keys(descriptions).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
    
    // Add each topic
    sortedKeys.forEach((key, index) => {
      const topic = descriptions[key];
      const isLast = index === sortedKeys.length - 1;
      
      lines.push(`  "${this._escapeString(key)}": {`);
      lines.push(`    title: "${this._escapeString(topic.title)}",`);
      lines.push(`    description: "${this._escapeString(topic.description)}"`);
      lines.push(`  }${isLast ? '' : ','}`);
    });
    
    lines.push('};');
    lines.push(''); // Empty line at end
    
    return lines.join('\n');
  }

  /**
   * Escapes special characters in strings for JavaScript
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   * @private
   */
  _escapeString(str) {
    if (typeof str !== 'string') {
      return String(str);
    }
    
    return str
      .replace(/\\/g, '\\\\')   // Backslash must be first
      .replace(/"/g, '\\"')      // Double quotes
      .replace(/\n/g, '\\n')     // Newlines
      .replace(/\r/g, '\\r')     // Carriage returns
      .replace(/\t/g, '\\t')     // Tabs
      .replace(/\f/g, '\\f')     // Form feeds
      .replace(/\v/g, '\\v');    // Vertical tabs
  }

  /**
   * Validates JavaScript syntax
   * @param {string} code - JavaScript code to validate
   * @returns {boolean} True if syntax is valid
   */
  validateSyntax(code) {
    try {
      // Try to parse the code as a module
      // We extract the object part and try to evaluate it
      const match = code.match(/export\s+const\s+topicDescriptions\s*=\s*(\{[\s\S]*\});/);
      
      if (!match) {
        return false;
      }

      const objectString = match[1];
      
      // Try to parse it using Function constructor
      new Function(`return ${objectString}`);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Restores from backup file
   * @returns {Promise<void>}
   */
  async restoreFromBackup() {
    try {
      await fs.access(this.backupPath);
      await fs.copyFile(this.backupPath, this.filePath);
    } catch (error) {
      throw new Error(`Failed to restore from backup: ${error.message}`);
    }
  }

  /**
   * Deletes the backup file
   * @returns {Promise<void>}
   */
  async deleteBackup() {
    try {
      await fs.unlink(this.backupPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw new Error(`Failed to delete backup: ${error.message}`);
      }
    }
  }
}

export default TopicDescriptionsWriter;
