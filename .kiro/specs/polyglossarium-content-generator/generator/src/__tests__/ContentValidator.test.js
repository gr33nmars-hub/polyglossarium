import { describe, test, expect } from '@jest/globals';
import ContentValidator from '../ContentValidator.js';

describe('ContentValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new ContentValidator();
  });

  describe('validate', () => {
    test('should validate a complete valid description', () => {
      // Create content with enough words (500+)
      const baseContent = `Это вводный параграф о тестовой теме, который объясняет основные концепции и идеи данной дисциплины. 
      Он должен быть достаточно длинным и информативным, чтобы пройти проверку на минимальное количество слов и дать читателю
      полное представление о предмете изучения. Данная область знаний охватывает множество аспектов и требует глубокого понимания
      фундаментальных принципов и практических навыков для успешного применения в реальных проектах и задачах. Современная наука
      и практика показывают важность систематического подхода к изучению данной темы и необходимость постоянного обновления знаний.
      Каждый специалист в этой области должен постоянно развиваться и следить за новыми тенденциями и достижениями в своей сфере.
      Это требует значительных усилий и времени, но результаты оправдывают все затраченные ресурсы и энергию на обучение и развитие.
      
      Технологии и инструменты включают различные библиотеки, фреймворки и платформы, которые активно используются в этой области.
      Среди них можно выделить основные средства разработки, системы управления версиями, инструменты для тестирования и отладки,
      а также специализированные решения для автоматизации рабочих процессов. Современные технологии постоянно развиваются и
      предоставляют разработчикам все более мощные возможности для создания качественных продуктов. Выбор правильных инструментов
      критически важен для успеха проекта и требует тщательного анализа требований и ограничений конкретной задачи. Необходимо
      учитывать множество факторов при выборе технологического стека, включая производительность, масштабируемость, поддержку
      сообщества и долгосрочную перспективу развития выбранных решений. Правильный выбор инструментов может значительно ускорить
      разработку и повысить качество конечного продукта, в то время как неудачный выбор может привести к серьезным проблемам.
      
      Процессы и методологии описывают типичные подходы к работе в данной области. Это включает различные этапы разработки,
      планирования и реализации проектов, а также конкретные шаги, которые необходимо выполнить для достижения поставленных целей.
      Практики в этой области хорошо отработаны и проверены временем, что позволяет командам эффективно организовывать свою работу
      и достигать высоких результатов. Методологии постоянно совершенствуются с учетом накопленного опыта и новых требований рынка.
      Важно понимать, что успешное применение методологий требует адаптации к специфике конкретного проекта и команды. Каждая
      организация должна найти свой баланс между строгим следованием установленным процессам и гибкостью в принятии решений.
      Эффективное управление процессами позволяет минимизировать риски и повысить предсказуемость результатов работы команды.
      
      Применение этой технологии решает множество практических задач и проблем в различных сферах деятельности. Она активно используется
      в коммерческих проектах, научных исследованиях и образовательных программах, помогая специалистам эффективно справляться с
      поставленными целями и создавать инновационные решения. Реальные примеры использования демонстрируют высокую эффективность
      и универсальность данного подхода в самых разных контекстах и условиях работы. Практическое применение требует глубокого
      понимания как теоретических основ, так и специфики конкретной предметной области, в которой решается задача. Успешные кейсы
      показывают, что правильное применение технологии может привести к значительному улучшению бизнес-показателей и повышению
      удовлетворенности пользователей. Важно также учитывать ограничения и потенциальные риски при внедрении новых решений.
      
      Пересечения с другими областями знаний показывают глубокие связи и активное взаимодействие между различными дисциплинами и
      направлениями развития. Интеграция с другими технологиями и методами позволяет создавать комплексные междисциплинарные решения,
      которые объединяют лучшие практики из разных сфер. Такой синтез знаний открывает новые возможности для инноваций и развития
      как теоретических основ, так и практических применений в современном мире. Междисциплинарный подход становится все более важным
      в условиях растущей сложности современных систем и задач, требующих комплексного взгляда на проблему. Сотрудничество между
      специалистами из разных областей позволяет находить нестандартные решения и создавать прорывные инновации, которые были бы
      невозможны в рамках одной дисциплины. Это требует открытости к новым идеям и готовности учиться у представителей других областей.
      
      Ссылки для дополнительного изучения: [Официальная документация](https://example.com/docs) [Подробное руководство](https://example.com/guide) 
      [Интерактивный учебник](https://example.com/tutorial) [Практические примеры](https://example.com/examples)
      [Научная статья](https://example.com/article) [Видеокурс](https://example.com/video)`;
      
      const description = {
        title: 'Тестовая тема',
        description: baseContent
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return error for null description', () => {
      const result = validator.validate(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid description object');
    });

    test('should return error for undefined description', () => {
      const result = validator.validate(undefined);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid description object');
    });

    test('should return error for missing title', () => {
      const description = {
        description: 'Some content'
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing or invalid title');
    });

    test('should return error for missing description content', () => {
      const description = {
        title: 'Test Title'
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing or invalid description content');
    });

    test('should return error for content too short', () => {
      const description = {
        title: 'Тест',
        description: 'Короткий текст на русском языке с технологиями, процессами, применением, пересечениями и [ссылкой](https://example.com)'
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('too short'))).toBe(true);
    });

    test('should return error for content too long', () => {
      // Create content with more than 2000 words
      const words = [];
      for (let i = 0; i < 2100; i++) {
        words.push('слово');
      }
      const longContent = words.join(' ') +
        ' технологии инструменты процессы методологии применение решает задачи ' +
        'пересечения области [Ссылка](https://example.com)';
      
      const description = {
        title: 'Тест',
        description: longContent
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('too long'))).toBe(true);
    });

    test('should return error for missing sections', () => {
      const description = {
        title: 'Тест',
        description: 'Просто текст на русском языке без нужных разделов. '.repeat(50) +
          '[Ссылка](https://example.com)'
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required sections');
    });

    test('should return error for invalid link format', () => {
      const description = {
        title: 'Тест',
        description: `Вводный текст на русском языке о теме.
        Технологии и инструменты используются здесь.
        Процессы и методологии описаны.
        Применение решает задачи.
        Пересечения с другими областями.
        `.repeat(10) + 'Ссылка без формата: example.com'
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid link format');
    });

    test('should return error for non-Russian content', () => {
      const description = {
        title: 'Test',
        description: `This is an introduction about the test topic in English.
        Technologies and tools include various libraries and frameworks.
        Processes and methodologies describe typical approaches.
        Applications solve many problems and tasks.
        Intersections with other areas show connections.
        `.repeat(10) + '[Link](https://example.com)'
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content not in Russian');
    });
  });

  describe('hasAllSections', () => {
    test('should return true for content with all sections', () => {
      const content = `Это вводный параграф о теме, который достаточно длинный.
      
      Технологии и инструменты включают различные библиотеки и фреймворки.
      
      Процессы и методологии описывают типичные подходы к работе.
      
      Применение этой технологии решает множество задач.
      
      Пересечения с другими областями показывают связи между дисциплинами.`;

      expect(validator.hasAllSections(content)).toBe(true);
    });

    test('should return false for content missing technology section', () => {
      const content = `Это вводный параграф о теме.
      
      Процессы и методологии описывают подходы.
      Применение решает задачи.
      Пересечения с другими областями.`;

      expect(validator.hasAllSections(content)).toBe(false);
    });

    test('should return false for content missing processes section', () => {
      const content = `Это вводный параграф о теме.
      
      Технологии и инструменты включают библиотеки.
      Применение решает задачи.
      Пересечения с другими областями.`;

      expect(validator.hasAllSections(content)).toBe(false);
    });

    test('should return false for content missing applications section', () => {
      const content = `Это вводный параграф о теме.
      
      Технологии и инструменты включают библиотеки.
      Процессы и методологии описывают подходы.
      Пересечения с другими областями.`;

      expect(validator.hasAllSections(content)).toBe(false);
    });

    test('should return false for content missing intersections section', () => {
      const content = `Это вводный параграф о теме.
      
      Технологии и инструменты включают библиотеки.
      Процессы и методологии описывают подходы.
      Применение решает задачи.`;

      expect(validator.hasAllSections(content)).toBe(false);
    });

    test('should return false for too short content', () => {
      const content = 'Короткий текст';

      expect(validator.hasAllSections(content)).toBe(false);
    });

    test('should return false for null content', () => {
      expect(validator.hasAllSections(null)).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(validator.hasAllSections('')).toBe(false);
    });
  });

  describe('countWords', () => {
    test('should count words correctly', () => {
      const content = 'Это тест для подсчета слов в тексте';

      expect(validator.countWords(content)).toBe(7);
    });

    test('should handle multiple spaces', () => {
      const content = 'Слово    с    множеством    пробелов';

      expect(validator.countWords(content)).toBe(4);
    });

    test('should handle newlines', () => {
      const content = 'Первая строка\nВторая строка\nТретья строка';

      expect(validator.countWords(content)).toBe(6);
    });

    test('should exclude markdown links but count link text', () => {
      const content = 'Текст с [ссылкой](https://example.com) внутри';

      expect(validator.countWords(content)).toBe(4); // "Текст с ссылкой внутри"
    });

    test('should handle multiple links', () => {
      const content = '[Первая](https://example.com) и [вторая](https://example.org) ссылки';

      expect(validator.countWords(content)).toBe(4); // "Первая и вторая ссылки"
    });

    test('should return 0 for empty string', () => {
      expect(validator.countWords('')).toBe(0);
    });

    test('should return 0 for null', () => {
      expect(validator.countWords(null)).toBe(0);
    });

    test('should return 0 for whitespace only', () => {
      expect(validator.countWords('   \n  \t  ')).toBe(0);
    });

    test('should handle Russian text', () => {
      const content = 'Это текст на русском языке для проверки';

      expect(validator.countWords(content)).toBe(7);
    });
  });

  describe('validateLinks', () => {
    test('should return true for valid markdown links', () => {
      const content = 'Текст с [ссылкой](https://example.com) и [другой](https://example.org)';

      expect(validator.validateLinks(content)).toBe(true);
    });

    test('should return true for http links', () => {
      const content = 'Текст с [ссылкой](http://example.com)';

      expect(validator.validateLinks(content)).toBe(true);
    });

    test('should return false for links without protocol', () => {
      const content = 'Текст с [ссылкой](example.com)';

      expect(validator.validateLinks(content)).toBe(false);
    });

    test('should return false for links with empty URL', () => {
      const content = 'Текст с [ссылкой]()';

      expect(validator.validateLinks(content)).toBe(false);
    });

    test('should return false for links with empty text', () => {
      const content = 'Текст с [](https://example.com)';

      expect(validator.validateLinks(content)).toBe(false);
    });

    test('should return false for malformed URLs', () => {
      const content = 'Текст с [ссылкой](https://)';

      expect(validator.validateLinks(content)).toBe(false);
    });

    test('should return false for content without links', () => {
      const content = 'Текст без ссылок';

      expect(validator.validateLinks(content)).toBe(false);
    });

    test('should return false for null content', () => {
      expect(validator.validateLinks(null)).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(validator.validateLinks('')).toBe(false);
    });

    test('should validate links with paths and query parameters', () => {
      const content = '[Документация](https://example.com/docs/api?version=2.0)';

      expect(validator.validateLinks(content)).toBe(true);
    });

    test('should validate links with fragments', () => {
      const content = '[Раздел](https://example.com/page#section)';

      expect(validator.validateLinks(content)).toBe(true);
    });

    test('should handle multiple valid links', () => {
      const content = `
        [Первая](https://example.com)
        [Вторая](https://example.org/path)
        [Третья](http://example.net/page?id=1)
      `;

      expect(validator.validateLinks(content)).toBe(true);
    });

    test('should return false if any link is invalid', () => {
      const content = `
        [Валидная](https://example.com)
        [Невалидная](example.org)
      `;

      expect(validator.validateLinks(content)).toBe(false);
    });
  });

  describe('isRussian', () => {
    test('should return true for Russian text', () => {
      const content = 'Это текст на русском языке для проверки';

      expect(validator.isRussian(content)).toBe(true);
    });

    test('should return true for Russian text with some English words', () => {
      const content = 'Это текст на русском языке с некоторыми English словами';

      expect(validator.isRussian(content)).toBe(true);
    });

    test('should return false for English text', () => {
      const content = 'This is text in English language for testing';

      expect(validator.isRussian(content)).toBe(false);
    });

    test('should return false for text with too much English', () => {
      const content = 'Немного русского but mostly English text here';

      expect(validator.isRussian(content)).toBe(false);
    });

    test('should ignore numbers and punctuation', () => {
      const content = 'Текст 123 с числами, знаками! И пунктуацией?';

      expect(validator.isRussian(content)).toBe(true);
    });

    test('should ignore markdown links', () => {
      const content = 'Русский текст с [ссылкой](https://example.com/english-url)';

      expect(validator.isRussian(content)).toBe(true);
    });

    test('should return false for null content', () => {
      expect(validator.isRussian(null)).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(validator.isRussian('')).toBe(false);
    });

    test('should return false for content with only numbers and punctuation', () => {
      expect(validator.isRussian('123, 456! 789?')).toBe(false);
    });

    test('should handle mixed Cyrillic and Latin with 70% threshold', () => {
      // 70 Cyrillic characters, 30 Latin characters
      const cyrillicPart = 'а'.repeat(70);
      const latinPart = 'a'.repeat(30);
      const content = cyrillicPart + ' ' + latinPart;

      expect(validator.isRussian(content)).toBe(true);
    });

    test('should fail with less than 70% Cyrillic', () => {
      // 69 Cyrillic characters, 31 Latin characters
      const cyrillicPart = 'а'.repeat(69);
      const latinPart = 'a'.repeat(31);
      const content = cyrillicPart + ' ' + latinPart;

      expect(validator.isRussian(content)).toBe(false);
    });

    test('should handle real Russian content with technical terms', () => {
      const content = `
        JavaScript является популярным языком программирования.
        Он используется для создания веб-приложений и серверных решений.
        Framework React помогает разрабатывать интерфейсы.
      `;

      expect(validator.isRussian(content)).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle description with only title', () => {
      const description = {
        title: 'Только заголовок'
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing or invalid description content');
    });

    test('should handle description with non-string title', () => {
      const description = {
        title: 123,
        description: 'Content'
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing or invalid title');
    });

    test('should handle description with non-string content', () => {
      const description = {
        title: 'Title',
        description: 123
      };

      const result = validator.validate(description);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing or invalid description content');
    });

    test('should handle content at exactly 500 words', () => {
      const words = [];
      for (let i = 0; i < 500; i++) {
        words.push('слово');
      }
      const content = words.join(' ') + 
        ' технологии процессы применение пересечения [ссылка](https://example.com)';

      const description = {
        title: 'Тест',
        description: content
      };

      const result = validator.validate(description);

      expect(result.errors.some(e => e.includes('too short'))).toBe(false);
    });

    test('should handle content at exactly 2000 words', () => {
      const words = [];
      for (let i = 0; i < 1994; i++) {  // 1994 + 6 more words = 2000
        words.push('слово');
      }
      const content = words.join(' ') + 
        ' технологии процессы применение пересечения области [ссылка](https://example.com)';

      const description = {
        title: 'Тест',
        description: content
      };

      const result = validator.validate(description);

      // At exactly 2000 words, should not have "too long" error
      expect(result.errors.some(e => e.includes('too long'))).toBe(false);
    });
  });
});
