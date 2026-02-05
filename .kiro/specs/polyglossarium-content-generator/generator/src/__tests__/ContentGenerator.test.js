import ContentGenerator from '../ContentGenerator.js';

/**
 * Unit tests for ContentGenerator class
 * Tests core functionality of content generation
 */

describe('ContentGenerator', () => {
  let mockWebSearchClient;
  let generator;

  beforeEach(() => {
    // Create mock WebSearchClient
    mockWebSearchClient = {
      buildQueries: () => [],
      search: async () => [],
      filterByQuality: (results) => results
    };

    generator = new ContentGenerator(mockWebSearchClient);
  });

  describe('constructor', () => {
    test('should create instance with required dependencies', () => {
      expect(generator).toBeInstanceOf(ContentGenerator);
      expect(generator.webSearch).toBe(mockWebSearchClient);
    });

    test('should throw error if WebSearchClient not provided', () => {
      expect(() => new ContentGenerator(null)).toThrow('WebSearchClient is required');
    });

    test('should use default config values', () => {
      expect(generator.config.minLinks).toBe(5);
      expect(generator.config.maxLinks).toBe(10);
      expect(generator.config.language).toBe('ru');
    });

    test('should accept custom config values', () => {
      const customGenerator = new ContentGenerator(mockWebSearchClient, {
        minLinks: 3,
        maxLinks: 8,
        language: 'en'
      });

      expect(customGenerator.config.minLinks).toBe(3);
      expect(customGenerator.config.maxLinks).toBe(8);
      expect(customGenerator.config.language).toBe('en');
    });
  });

  describe('planArticle', () => {
    test('should return structured plan with all sections', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      const plan = await generator.planArticle(topic);

      expect(plan).toHaveProperty('intro');
      expect(plan).toHaveProperty('techStack');
      expect(plan).toHaveProperty('processes');
      expect(plan).toHaveProperty('applications');
      expect(plan).toHaveProperty('intersections');
    });

    test('should include topic title in plan points', async () => {
      const topic = { id: 'test-1', title: 'Machine Learning' };
      const plan = await generator.planArticle(topic);

      const allPoints = [
        ...plan.intro,
        ...plan.techStack,
        ...plan.processes,
        ...plan.applications,
        ...plan.intersections
      ].join(' ');

      expect(allPoints).toContain('Machine Learning');
    });

    test('should return arrays for each section', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      const plan = await generator.planArticle(topic);

      expect(Array.isArray(plan.intro)).toBe(true);
      expect(Array.isArray(plan.techStack)).toBe(true);
      expect(Array.isArray(plan.processes)).toBe(true);
      expect(Array.isArray(plan.applications)).toBe(true);
      expect(Array.isArray(plan.intersections)).toBe(true);
    });
  });

  describe('findSources', () => {
    test('should call webSearch.buildQueries with topic', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      let calledWith = null;
      
      mockWebSearchClient.buildQueries = (t) => {
        calledWith = t;
        return ['query1', 'query2', 'query3'];
      };
      mockWebSearchClient.search = async () => [
        { url: 'http://example.com/1', title: 'Source 1' }
      ];
      mockWebSearchClient.filterByQuality = results => results;

      await generator.findSources(topic);

      expect(calledWith).toBe(topic);
    });

    test('should search with multiple queries', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      let searchCallCount = 0;
      
      mockWebSearchClient.buildQueries = () => ['query1', 'query2', 'query3'];
      mockWebSearchClient.search = async () => {
        searchCallCount++;
        return [{ url: 'http://example.com/1', title: 'Source 1' }];
      };
      mockWebSearchClient.filterByQuality = results => results;

      await generator.findSources(topic);

      // Should search with first 3 queries
      expect(searchCallCount).toBe(3);
    });

    test('should filter results by quality', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      const mockResults = [
        { url: 'http://example.com/1', title: 'Source 1' },
        { url: 'http://example.com/2', title: 'Source 2' }
      ];
      let filterCalled = false;

      mockWebSearchClient.buildQueries = () => ['query1'];
      mockWebSearchClient.search = async () => mockResults;
      mockWebSearchClient.filterByQuality = (results) => {
        filterCalled = true;
        return results;
      };

      await generator.findSources(topic);

      expect(filterCalled).toBe(true);
    });

    test('should deduplicate results by URL', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      const mockResults = [
        { url: 'http://example.com/1', title: 'Source 1' },
        { url: 'http://example.com/1', title: 'Source 1 Duplicate' },
        { url: 'http://example.com/2', title: 'Source 2' }
      ];

      mockWebSearchClient.buildQueries = () => ['query1'];
      mockWebSearchClient.search = async () => mockResults;
      mockWebSearchClient.filterByQuality = results => results;

      const sources = await generator.findSources(topic);

      expect(sources.length).toBe(2);
      expect(sources[0].url).toBe('http://example.com/1');
      expect(sources[1].url).toBe('http://example.com/2');
    });

    test('should limit results to maxLinks', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      const mockResults = Array.from({ length: 20 }, (_, i) => ({
        url: `http://example.com/${i}`,
        title: `Source ${i}`
      }));

      mockWebSearchClient.buildQueries = () => ['query1'];
      mockWebSearchClient.search = async () => mockResults;
      mockWebSearchClient.filterByQuality = results => results;

      const sources = await generator.findSources(topic);

      expect(sources.length).toBeLessThanOrEqual(generator.config.maxLinks);
    });

    test('should throw error if no results found', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      mockWebSearchClient.buildQueries = () => ['query1'];
      mockWebSearchClient.search = async () => [];

      await expect(generator.findSources(topic)).rejects.toThrow('No search results found');
    });

    test('should continue if one query fails', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      let callCount = 0;
      
      mockWebSearchClient.buildQueries = () => ['query1', 'query2', 'query3'];
      
      // First query fails, others succeed
      mockWebSearchClient.search = async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Search failed');
        }
        return [{ url: `http://example.com/${callCount}`, title: `Source ${callCount}` }];
      };
      
      mockWebSearchClient.filterByQuality = results => results;

      const sources = await generator.findSources(topic);

      expect(sources.length).toBeGreaterThan(0);
    });
  });

  describe('generateIntro', () => {
    test('should return string containing topic title', async () => {
      const topic = { id: 'test-1', title: 'Machine Learning' };
      const sources = [];
      const plan = { intro: [] };

      const intro = await generator.generateIntro(topic, sources, plan);

      expect(typeof intro).toBe('string');
      expect(intro).toContain('Machine Learning');
    });

    test('should return non-empty string', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      const sources = [];
      const plan = { intro: [] };

      const intro = await generator.generateIntro(topic, sources, plan);

      expect(intro.length).toBeGreaterThan(0);
    });
  });

  describe('generateTechStack', () => {
    test('should return string with section header', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      const sources = [];
      const plan = { techStack: [] };

      const techStack = await generator.generateTechStack(topic, sources, plan);

      expect(typeof techStack).toBe('string');
      expect(techStack).toContain('Технологии и инструменты');
    });

    test('should contain topic title', async () => {
      const topic = { id: 'test-1', title: 'Data Science' };
      const sources = [];
      const plan = { techStack: [] };

      const techStack = await generator.generateTechStack(topic, sources, plan);

      expect(techStack).toContain('Data Science');
    });
  });

  describe('generateProcesses', () => {
    test('should return string with section header', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      const sources = [];
      const plan = { processes: [] };

      const processes = await generator.generateProcesses(topic, sources, plan);

      expect(typeof processes).toBe('string');
      expect(processes).toContain('Процессы и методологии');
    });

    test('should contain topic title', async () => {
      const topic = { id: 'test-1', title: 'Software Engineering' };
      const sources = [];
      const plan = { processes: [] };

      const processes = await generator.generateProcesses(topic, sources, plan);

      expect(processes).toContain('Software Engineering');
    });
  });

  describe('generateApplications', () => {
    test('should return string with section header', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      const sources = [];
      const plan = { applications: [] };

      const applications = await generator.generateApplications(topic, sources, plan);

      expect(typeof applications).toBe('string');
      expect(applications).toContain('Практические применения');
    });

    test('should contain topic title', async () => {
      const topic = { id: 'test-1', title: 'Artificial Intelligence' };
      const sources = [];
      const plan = { applications: [] };

      const applications = await generator.generateApplications(topic, sources, plan);

      expect(applications).toContain('Artificial Intelligence');
    });
  });

  describe('generateIntersections', () => {
    test('should return string with section header', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      const sources = [];
      const plan = { intersections: [] };

      const intersections = await generator.generateIntersections(topic, sources, plan);

      expect(typeof intersections).toBe('string');
      expect(intersections).toContain('Междисциплинарные связи');
    });

    test('should contain topic title', async () => {
      const topic = { id: 'test-1', title: 'Quantum Computing' };
      const sources = [];
      const plan = { intersections: [] };

      const intersections = await generator.generateIntersections(topic, sources, plan);

      expect(intersections).toContain('Quantum Computing');
    });
  });

  describe('formatLinks', () => {
    test('should format sources as markdown links', () => {
      const sources = [
        { url: 'http://example.com/1', title: 'Source 1' },
        { url: 'http://example.com/2', title: 'Source 2' }
      ];

      const links = generator.formatLinks(sources);

      expect(links).toContain('[Source 1](http://example.com/1)');
      expect(links).toContain('[Source 2](http://example.com/2)');
    });

    test('should include section header', () => {
      const sources = [
        { url: 'http://example.com/1', title: 'Source 1' }
      ];

      const links = generator.formatLinks(sources);

      expect(links).toContain('Источники:');
    });

    test('should number links sequentially', () => {
      const sources = [
        { url: 'http://example.com/1', title: 'Source 1' },
        { url: 'http://example.com/2', title: 'Source 2' },
        { url: 'http://example.com/3', title: 'Source 3' }
      ];

      const links = generator.formatLinks(sources);

      expect(links).toContain('1. [Source 1]');
      expect(links).toContain('2. [Source 2]');
      expect(links).toContain('3. [Source 3]');
    });

    test('should handle empty sources array', () => {
      const links = generator.formatLinks([]);

      expect(links).toContain('Источники:');
      expect(links).toContain('будут добавлены позже');
    });

    test('should handle sources without title', () => {
      const sources = [
        { url: 'http://example.com/1' }
      ];

      const links = generator.formatLinks(sources);

      expect(links).toContain('[Источник 1](http://example.com/1)');
    });

    test('should handle sources without URL', () => {
      const sources = [
        { title: 'Source 1' }
      ];

      const links = generator.formatLinks(sources);

      expect(links).toContain('[Source 1](#)');
    });
  });

  describe('assembleDescription', () => {
    test('should combine all sections in correct order', () => {
      const intro = 'Introduction text';
      const techStack = '\n\nTech stack text';
      const processes = '\n\nProcesses text';
      const applications = '\n\nApplications text';
      const intersections = '\n\nIntersections text';
      const links = '\n\nLinks text';

      const description = generator.assembleDescription(
        intro,
        techStack,
        processes,
        applications,
        intersections,
        links
      );

      // Check order
      const introIndex = description.indexOf('Introduction');
      const techIndex = description.indexOf('Tech stack');
      const processIndex = description.indexOf('Processes');
      const appIndex = description.indexOf('Applications');
      const interIndex = description.indexOf('Intersections');
      const linksIndex = description.indexOf('Links');

      expect(introIndex).toBeLessThan(techIndex);
      expect(techIndex).toBeLessThan(processIndex);
      expect(processIndex).toBeLessThan(appIndex);
      expect(appIndex).toBeLessThan(interIndex);
      expect(interIndex).toBeLessThan(linksIndex);
    });

    test('should trim whitespace', () => {
      const description = generator.assembleDescription(
        '  intro  ',
        '  tech  ',
        '  proc  ',
        '  app  ',
        '  inter  ',
        '  links  '
      );

      expect(description).not.toMatch(/^\s/);
      expect(description).not.toMatch(/\s$/);
    });

    test('should return non-empty string', () => {
      const description = generator.assembleDescription(
        'intro',
        'tech',
        'proc',
        'app',
        'inter',
        'links'
      );

      expect(description.length).toBeGreaterThan(0);
    });
  });

  describe('generateDescription', () => {
    beforeEach(() => {
      // Setup default mocks for full generation
      mockWebSearchClient.buildQueries = () => ['query1'];
      mockWebSearchClient.search = async () => [
        { url: 'http://example.com/1', title: 'Source 1' }
      ];
      mockWebSearchClient.filterByQuality = results => results;
    });

    test('should throw error if topic has no title', async () => {
      const topic = { id: 'test-1' };

      await expect(generator.generateDescription(topic)).rejects.toThrow('Topic must have a title');
    });

    test('should return object with title and description', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };

      const result = await generator.generateDescription(topic);

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result.title).toBe('Test Topic');
    });

    test('should generate description with all sections', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };

      const result = await generator.generateDescription(topic);

      expect(result.description).toContain('Test Topic');
      expect(result.description).toContain('Технологии и инструменты');
      expect(result.description).toContain('Процессы и методологии');
      expect(result.description).toContain('Практические применения');
      expect(result.description).toContain('Междисциплинарные связи');
      expect(result.description).toContain('Источники:');
    });

    test('should call all generation methods', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };

      // Track method calls
      let planCalled = false;
      let sourcesCalled = false;
      let introCalled = false;
      let techCalled = false;
      let procCalled = false;
      let appCalled = false;
      let interCalled = false;
      let linksCalled = false;
      let assembleCalled = false;

      const originalPlan = generator.planArticle.bind(generator);
      const originalSources = generator.findSources.bind(generator);
      const originalIntro = generator.generateIntro.bind(generator);
      const originalTech = generator.generateTechStack.bind(generator);
      const originalProc = generator.generateProcesses.bind(generator);
      const originalApp = generator.generateApplications.bind(generator);
      const originalInter = generator.generateIntersections.bind(generator);
      const originalLinks = generator.formatLinks.bind(generator);
      const originalAssemble = generator.assembleDescription.bind(generator);

      generator.planArticle = async (t) => { planCalled = true; return originalPlan(t); };
      generator.findSources = async (t) => { sourcesCalled = true; return originalSources(t); };
      generator.generateIntro = async (t, s, p) => { introCalled = true; return originalIntro(t, s, p); };
      generator.generateTechStack = async (t, s, p) => { techCalled = true; return originalTech(t, s, p); };
      generator.generateProcesses = async (t, s, p) => { procCalled = true; return originalProc(t, s, p); };
      generator.generateApplications = async (t, s, p) => { appCalled = true; return originalApp(t, s, p); };
      generator.generateIntersections = async (t, s, p) => { interCalled = true; return originalInter(t, s, p); };
      generator.formatLinks = (s) => { linksCalled = true; return originalLinks(s); };
      generator.assembleDescription = (...args) => { assembleCalled = true; return originalAssemble(...args); };

      await generator.generateDescription(topic);

      expect(planCalled).toBe(true);
      expect(sourcesCalled).toBe(true);
      expect(introCalled).toBe(true);
      expect(techCalled).toBe(true);
      expect(procCalled).toBe(true);
      expect(appCalled).toBe(true);
      expect(interCalled).toBe(true);
      expect(linksCalled).toBe(true);
      expect(assembleCalled).toBe(true);
    });

    test('should throw descriptive error if generation fails', async () => {
      const topic = { id: 'test-1', title: 'Test Topic' };
      mockWebSearchClient.search = async () => {
        throw new Error('Network error');
      };

      await expect(generator.generateDescription(topic)).rejects.toThrow(
        'Failed to generate description for topic "Test Topic"'
      );
    });
  });

  describe('deduplicateByUrl', () => {
    test('should remove duplicate URLs', () => {
      const sources = [
        { url: 'http://example.com/1', title: 'Source 1' },
        { url: 'http://example.com/1', title: 'Source 1 Dup' },
        { url: 'http://example.com/2', title: 'Source 2' }
      ];

      const unique = generator.deduplicateByUrl(sources);

      expect(unique.length).toBe(2);
      expect(unique[0].url).toBe('http://example.com/1');
      expect(unique[1].url).toBe('http://example.com/2');
    });

    test('should be case-insensitive', () => {
      const sources = [
        { url: 'http://Example.com/1', title: 'Source 1' },
        { url: 'http://example.com/1', title: 'Source 1 Dup' }
      ];

      const unique = generator.deduplicateByUrl(sources);

      expect(unique.length).toBe(1);
    });

    test('should keep first occurrence', () => {
      const sources = [
        { url: 'http://example.com/1', title: 'First' },
        { url: 'http://example.com/1', title: 'Second' }
      ];

      const unique = generator.deduplicateByUrl(sources);

      expect(unique[0].title).toBe('First');
    });

    test('should handle sources without URL', () => {
      const sources = [
        { title: 'Source 1' },
        { url: 'http://example.com/1', title: 'Source 2' }
      ];

      const unique = generator.deduplicateByUrl(sources);

      expect(unique.length).toBe(1);
      expect(unique[0].url).toBe('http://example.com/1');
    });

    test('should handle empty array', () => {
      const unique = generator.deduplicateByUrl([]);

      expect(unique.length).toBe(0);
    });
  });
});
