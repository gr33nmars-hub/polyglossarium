import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import CurriculumReader from '../CurriculumReader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CurriculumReader', () => {
  const testDataDir = path.join(__dirname, 'test-data');
  const validCurriculumPath = path.join(testDataDir, 'valid-curriculum.js');
  const emptyCurriculumPath = path.join(testDataDir, 'empty-curriculum.js');
  const malformedCurriculumPath = path.join(testDataDir, 'malformed-curriculum.js');
  const nonExistentPath = path.join(testDataDir, 'non-existent.js');

  beforeEach(async () => {
    // Create test data directory
    await fs.mkdir(testDataDir, { recursive: true });

    // Create valid curriculum file
    const validCurriculum = `export const curriculum = [
  {
    "id": 0,
    "category": "Test Category 1",
    "description": "Test description",
    "topics": [
      {
        "id": "1",
        "title": "Test Topic 1",
        "description": "Test topic description"
      },
      {
        "id": "2",
        "title": "Test Topic 2",
        "description": "Test topic description"
      }
    ]
  },
  {
    "id": 1,
    "category": "Test Category 2",
    "description": "Test description",
    "topics": [
      {
        "id": "3",
        "title": "Test Topic 3",
        "description": "Test topic description"
      }
    ]
  }
];`;
    await fs.writeFile(validCurriculumPath, validCurriculum, 'utf-8');

    // Create empty curriculum file
    const emptyCurriculum = `export const curriculum = [];`;
    await fs.writeFile(emptyCurriculumPath, emptyCurriculum, 'utf-8');

    // Create malformed curriculum file
    const malformedCurriculum = `export const curriculum = [
  {
    "id": 0,
    "category": "Test Category",
    "topics": "not an array"
  }
];`;
    await fs.writeFile(malformedCurriculumPath, malformedCurriculum, 'utf-8');
  });

  afterEach(async () => {
    // Clean up test data directory
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  describe('readCurriculum', () => {
    test('should read and parse valid curriculum file', async () => {
      const reader = new CurriculumReader(validCurriculumPath);
      const topics = await reader.readCurriculum();

      expect(topics).toHaveLength(3);
      expect(topics[0]).toEqual({
        id: '1',
        title: 'Test Topic 1',
        categoryName: 'Test Category 1',
        categoryId: 0
      });
      expect(topics[1]).toEqual({
        id: '2',
        title: 'Test Topic 2',
        categoryName: 'Test Category 1',
        categoryId: 0
      });
      expect(topics[2]).toEqual({
        id: '3',
        title: 'Test Topic 3',
        categoryName: 'Test Category 2',
        categoryId: 1
      });
    });

    test('should return empty array for empty curriculum', async () => {
      const reader = new CurriculumReader(emptyCurriculumPath);
      const topics = await reader.readCurriculum();

      expect(topics).toHaveLength(0);
      expect(topics).toEqual([]);
    });

    test('should throw error for non-existent file', async () => {
      const reader = new CurriculumReader(nonExistentPath);

      await expect(reader.readCurriculum()).rejects.toThrow(
        `Curriculum file not found: ${nonExistentPath}`
      );
    });

    test('should throw error for malformed curriculum', async () => {
      const reader = new CurriculumReader(malformedCurriculumPath);

      await expect(reader.readCurriculum()).rejects.toThrow();
    });

    test('should throw error for invalid JSON syntax', async () => {
      const invalidJsonPath = path.join(testDataDir, 'invalid-json.js');
      await fs.writeFile(invalidJsonPath, 'export const curriculum = [invalid json];', 'utf-8');

      const reader = new CurriculumReader(invalidJsonPath);

      await expect(reader.readCurriculum()).rejects.toThrow('Failed to parse curriculum file');
    });

    test('should throw error for missing curriculum export', async () => {
      const noExportPath = path.join(testDataDir, 'no-export.js');
      await fs.writeFile(noExportPath, 'const data = [];', 'utf-8');

      const reader = new CurriculumReader(noExportPath);

      await expect(reader.readCurriculum()).rejects.toThrow('Could not find curriculum array in file');
    });
  });

  describe('extractTopics', () => {
    let reader;

    beforeEach(() => {
      reader = new CurriculumReader(validCurriculumPath);
    });

    test('should extract topics from valid category', () => {
      const category = {
        id: 5,
        category: 'Mathematics',
        topics: [
          { id: '10', title: 'Algebra' },
          { id: '11', title: 'Calculus' }
        ]
      };

      const topics = reader.extractTopics(category);

      expect(topics).toHaveLength(2);
      expect(topics[0]).toEqual({
        id: '10',
        title: 'Algebra',
        categoryName: 'Mathematics',
        categoryId: 5
      });
      expect(topics[1]).toEqual({
        id: '11',
        title: 'Calculus',
        categoryName: 'Mathematics',
        categoryId: 5
      });
    });

    test('should handle category with no topics', () => {
      const category = {
        id: 5,
        category: 'Empty Category',
        topics: []
      };

      const topics = reader.extractTopics(category);

      expect(topics).toHaveLength(0);
      expect(topics).toEqual([]);
    });

    test('should throw error for null category', () => {
      expect(() => reader.extractTopics(null)).toThrow('Invalid category object');
    });

    test('should throw error for undefined category', () => {
      expect(() => reader.extractTopics(undefined)).toThrow('Invalid category object');
    });

    test('should throw error for category without topics array', () => {
      const category = {
        id: 5,
        category: 'Invalid Category'
      };

      expect(() => reader.extractTopics(category)).toThrow(
        'Category "Invalid Category" has no topics array'
      );
    });

    test('should throw error for category with non-array topics', () => {
      const category = {
        id: 5,
        category: 'Invalid Category',
        topics: 'not an array'
      };

      expect(() => reader.extractTopics(category)).toThrow(
        'Category "Invalid Category" has no topics array'
      );
    });

    test('should handle category without name', () => {
      const category = {
        id: 5,
        topics: [
          { id: '10', title: 'Topic' }
        ]
      };

      const topics = reader.extractTopics(category);

      expect(topics).toHaveLength(1);
      expect(topics[0].categoryName).toBe('Unknown Category');
    });
  });

  describe('integration with real curriculum', () => {
    test('should read actual curriculum.js file', async () => {
      // Path to the actual curriculum file
      const actualCurriculumPath = path.join(__dirname, '../../../../../../web/src/data/curriculum.js');
      
      // Check if file exists before running test
      try {
        await fs.access(actualCurriculumPath);
      } catch {
        // Skip test if file doesn't exist
        console.log('Skipping integration test: curriculum.js not found');
        return;
      }

      const reader = new CurriculumReader(actualCurriculumPath);
      const topics = await reader.readCurriculum();

      // Verify we got topics
      expect(topics.length).toBeGreaterThan(0);
      
      // Verify structure of first topic
      expect(topics[0]).toHaveProperty('id');
      expect(topics[0]).toHaveProperty('title');
      expect(topics[0]).toHaveProperty('categoryName');
      expect(topics[0]).toHaveProperty('categoryId');
      
      // Verify all topics have required fields
      topics.forEach(topic => {
        expect(topic.id).toBeDefined();
        expect(topic.title).toBeDefined();
        expect(topic.categoryName).toBeDefined();
        expect(typeof topic.categoryId).toBe('number');
      });
    });
  });
});
