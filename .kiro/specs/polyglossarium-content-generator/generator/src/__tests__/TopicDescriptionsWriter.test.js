import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import TopicDescriptionsWriter from '../TopicDescriptionsWriter.js';

describe('TopicDescriptionsWriter', () => {
  const testDir = path.join(process.cwd(), '.test-temp');
  const testFilePath = path.join(testDir, 'topicDescriptions.js');
  let writer;

  beforeEach(async () => {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true });
    writer = new TopicDescriptionsWriter(testFilePath);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('createBackup', () => {
    it('should create a backup of existing file', async () => {
      // Create a test file
      const testContent = 'export const topicDescriptions = {};';
      await fs.writeFile(testFilePath, testContent, 'utf-8');

      // Create backup
      await writer.createBackup();

      // Verify backup exists and has same content
      const backupContent = await fs.readFile(testFilePath + '.backup', 'utf-8');
      expect(backupContent).toBe(testContent);
    });

    it('should not throw error if file does not exist', async () => {
      // Should not throw
      await expect(writer.createBackup()).resolves.not.toThrow();
    });

    it('should overwrite existing backup', async () => {
      // Create original file
      await fs.writeFile(testFilePath, 'version 1', 'utf-8');
      await writer.createBackup();

      // Update file and create new backup
      await fs.writeFile(testFilePath, 'version 2', 'utf-8');
      await writer.createBackup();

      // Verify backup has new content
      const backupContent = await fs.readFile(testFilePath + '.backup', 'utf-8');
      expect(backupContent).toBe('version 2');
    });
  });

  describe('readExisting', () => {
    it('should read and parse existing topicDescriptions.js', async () => {
      const testContent = `// Comment
export const topicDescriptions = {
  "1": {
    title: "Test Topic",
    description: "Test description"
  }
};`;
      await fs.writeFile(testFilePath, testContent, 'utf-8');

      const descriptions = await writer.readExisting();

      expect(descriptions).toEqual({
        "1": {
          title: "Test Topic",
          description: "Test description"
        }
      });
    });

    it('should return empty object if file does not exist', async () => {
      const descriptions = await writer.readExisting();
      expect(descriptions).toEqual({});
    });

    it('should handle multiple topics', async () => {
      const testContent = `export const topicDescriptions = {
  "1": { title: "Topic 1", description: "Desc 1" },
  "2": { title: "Topic 2", description: "Desc 2" },
  "3": { title: "Topic 3", description: "Desc 3" }
};`;
      await fs.writeFile(testFilePath, testContent, 'utf-8');

      const descriptions = await writer.readExisting();

      expect(Object.keys(descriptions)).toHaveLength(3);
      expect(descriptions["1"].title).toBe("Topic 1");
      expect(descriptions["2"].title).toBe("Topic 2");
      expect(descriptions["3"].title).toBe("Topic 3");
    });

    it('should handle descriptions with special characters', async () => {
      const testContent = `export const topicDescriptions = {
  "1": {
    title: "Test \\"Quotes\\"",
    description: "Line 1\\nLine 2\\tTabbed"
  }
};`;
      await fs.writeFile(testFilePath, testContent, 'utf-8');

      const descriptions = await writer.readExisting();

      expect(descriptions["1"].title).toBe('Test "Quotes"');
      expect(descriptions["1"].description).toBe('Line 1\nLine 2\tTabbed');
    });

    it('should throw error for invalid format', async () => {
      const testContent = 'invalid javascript code';
      await fs.writeFile(testFilePath, testContent, 'utf-8');

      await expect(writer.readExisting()).rejects.toThrow();
    });
  });

  describe('updateTopic', () => {
    it('should add new topic to empty file', async () => {
      const description = {
        title: "New Topic",
        description: "New description"
      };

      await writer.updateTopic("1", description);

      const content = await fs.readFile(testFilePath, 'utf-8');
      expect(content).toContain('"1"');
      expect(content).toContain('New Topic');
      expect(content).toContain('New description');
    });

    it('should update existing topic', async () => {
      // Create initial file
      const initial = `export const topicDescriptions = {
  "1": { title: "Old Title", description: "Old description" }
};`;
      await fs.writeFile(testFilePath, initial, 'utf-8');

      // Update topic
      await writer.updateTopic("1", {
        title: "New Title",
        description: "New description"
      });

      // Verify update
      const descriptions = await writer.readExisting();
      expect(descriptions["1"].title).toBe("New Title");
      expect(descriptions["1"].description).toBe("New description");
    });

    it('should preserve other topics when updating one', async () => {
      // Create initial file with multiple topics
      const initial = `export const topicDescriptions = {
  "1": { title: "Topic 1", description: "Desc 1" },
  "2": { title: "Topic 2", description: "Desc 2" }
};`;
      await fs.writeFile(testFilePath, initial, 'utf-8');

      // Update only topic 1
      await writer.updateTopic("1", {
        title: "Updated Topic 1",
        description: "Updated Desc 1"
      });

      // Verify both topics
      const descriptions = await writer.readExisting();
      expect(descriptions["1"].title).toBe("Updated Topic 1");
      expect(descriptions["2"].title).toBe("Topic 2");
    });
  });

  describe('saveAll', () => {
    it('should save descriptions in correct format', async () => {
      const descriptions = {
        "1": {
          title: "Test Topic",
          description: "Test description"
        }
      };

      await writer.saveAll(descriptions);

      const content = await fs.readFile(testFilePath, 'utf-8');
      expect(content).toContain('export const topicDescriptions = {');
      expect(content).toContain('"1": {');
      expect(content).toContain('title: "Test Topic"');
      expect(content).toContain('description: "Test description"');
      expect(content).toContain('};');
    });

    it('should sort topics numerically', async () => {
      const descriptions = {
        "10": { title: "Topic 10", description: "Desc 10" },
        "2": { title: "Topic 2", description: "Desc 2" },
        "1": { title: "Topic 1", description: "Desc 1" }
      };

      await writer.saveAll(descriptions);

      const content = await fs.readFile(testFilePath, 'utf-8');
      const lines = content.split('\n');
      
      // Find the line indices for each topic
      const topic1Line = lines.findIndex(line => line.includes('"1"'));
      const topic2Line = lines.findIndex(line => line.includes('"2"'));
      const topic10Line = lines.findIndex(line => line.includes('"10"'));

      expect(topic1Line).toBeLessThan(topic2Line);
      expect(topic2Line).toBeLessThan(topic10Line);
    });

    it('should properly escape special characters', async () => {
      const descriptions = {
        "1": {
          title: 'Title with "quotes"',
          description: 'Line 1\nLine 2\tTabbed\rCarriage\\Backslash'
        }
      };

      await writer.saveAll(descriptions);

      // Read back and verify
      const readDescriptions = await writer.readExisting();
      expect(readDescriptions["1"].title).toBe('Title with "quotes"');
      expect(readDescriptions["1"].description).toBe('Line 1\nLine 2\tTabbed\rCarriage\\Backslash');
    });

    it('should create backup before saving', async () => {
      // Create initial file
      const initial = `export const topicDescriptions = {
  "1": { title: "Original", description: "Original" }
};`;
      await fs.writeFile(testFilePath, initial, 'utf-8');

      // Save new content
      await writer.saveAll({
        "1": { title: "Updated", description: "Updated" }
      });

      // Verify backup exists with original content
      const backupContent = await fs.readFile(testFilePath + '.backup', 'utf-8');
      expect(backupContent).toBe(initial);
    });

    it('should handle empty descriptions object', async () => {
      await writer.saveAll({});

      const content = await fs.readFile(testFilePath, 'utf-8');
      expect(content).toContain('export const topicDescriptions = {');
      expect(content).toContain('};');
    });

    it('should add comma between topics but not after last', async () => {
      const descriptions = {
        "1": { title: "Topic 1", description: "Desc 1" },
        "2": { title: "Topic 2", description: "Desc 2" }
      };

      await writer.saveAll(descriptions);

      const content = await fs.readFile(testFilePath, 'utf-8');
      const lines = content.split('\n');
      
      // Find closing braces for each topic
      let topic1ClosingLine = -1;
      let topic2ClosingLine = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('"1"')) {
          // Find the closing brace for this topic
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim().startsWith('}')) {
              topic1ClosingLine = j;
              break;
            }
          }
        }
        if (lines[i].includes('"2"')) {
          // Find the closing brace for this topic
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim().startsWith('}')) {
              topic2ClosingLine = j;
              break;
            }
          }
        }
      }

      // First topic should have comma
      expect(lines[topic1ClosingLine].trim()).toBe('},');
      // Last topic should not have comma
      expect(lines[topic2ClosingLine].trim()).toBe('}');
    });
  });

  describe('validateSyntax', () => {
    it('should validate correct JavaScript syntax', () => {
      const validCode = `export const topicDescriptions = {
  "1": { title: "Test", description: "Test" }
};`;
      expect(writer.validateSyntax(validCode)).toBe(true);
    });

    it('should reject invalid JavaScript syntax', () => {
      const invalidCode = 'export const topicDescriptions = { invalid }';
      expect(writer.validateSyntax(invalidCode)).toBe(false);
    });

    it('should reject code without export statement', () => {
      const invalidCode = 'const topicDescriptions = {};';
      expect(writer.validateSyntax(invalidCode)).toBe(false);
    });

    it('should validate complex nested structures', () => {
      const validCode = `export const topicDescriptions = {
  "1": {
    title: "Complex",
    description: "Multi\\nLine\\nWith \\"Quotes\\""
  }
};`;
      expect(writer.validateSyntax(validCode)).toBe(true);
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore file from backup', async () => {
      // Create original and backup
      await fs.writeFile(testFilePath, 'modified content', 'utf-8');
      await fs.writeFile(testFilePath + '.backup', 'original content', 'utf-8');

      // Restore
      await writer.restoreFromBackup();

      // Verify restoration
      const content = await fs.readFile(testFilePath, 'utf-8');
      expect(content).toBe('original content');
    });

    it('should throw error if backup does not exist', async () => {
      await expect(writer.restoreFromBackup()).rejects.toThrow();
    });
  });

  describe('deleteBackup', () => {
    it('should delete backup file', async () => {
      // Create backup
      await fs.writeFile(testFilePath + '.backup', 'backup content', 'utf-8');

      // Delete
      await writer.deleteBackup();

      // Verify deletion
      await expect(fs.access(testFilePath + '.backup')).rejects.toThrow();
    });

    it('should not throw error if backup does not exist', async () => {
      await expect(writer.deleteBackup()).resolves.not.toThrow();
    });
  });

  describe('integration tests', () => {
    it('should handle complete workflow: create, update, restore', async () => {
      // Create initial file
      await writer.saveAll({
        "1": { title: "Original", description: "Original description" }
      });

      // Update topic
      await writer.updateTopic("1", {
        title: "Updated",
        description: "Updated description"
      });

      // Verify update
      let descriptions = await writer.readExisting();
      expect(descriptions["1"].title).toBe("Updated");

      // Restore from backup
      await writer.restoreFromBackup();

      // Verify restoration
      descriptions = await writer.readExisting();
      expect(descriptions["1"].title).toBe("Original");
    });

    it('should handle multiple updates without data loss', async () => {
      // Create initial file with multiple topics
      await writer.saveAll({
        "1": { title: "Topic 1", description: "Desc 1" },
        "2": { title: "Topic 2", description: "Desc 2" }
      });

      // Update topic 1
      await writer.updateTopic("1", {
        title: "Updated Topic 1",
        description: "Updated Desc 1"
      });

      // Add topic 3
      await writer.updateTopic("3", {
        title: "Topic 3",
        description: "Desc 3"
      });

      // Update topic 2
      await writer.updateTopic("2", {
        title: "Updated Topic 2",
        description: "Updated Desc 2"
      });

      // Verify all topics
      const descriptions = await writer.readExisting();
      expect(Object.keys(descriptions)).toHaveLength(3);
      expect(descriptions["1"].title).toBe("Updated Topic 1");
      expect(descriptions["2"].title).toBe("Updated Topic 2");
      expect(descriptions["3"].title).toBe("Topic 3");
    });

    it('should handle Russian text correctly', async () => {
      const russianDescription = {
        title: "Критическое мышление и логика",
        description: "Критическое мышление — это дисциплинированный процесс активного и умелого концептуализирования, применения, анализа, синтеза и оценки информации."
      };

      await writer.saveAll({
        "1": russianDescription
      });

      const descriptions = await writer.readExisting();
      expect(descriptions["1"].title).toBe(russianDescription.title);
      expect(descriptions["1"].description).toBe(russianDescription.description);
    });
  });
});
