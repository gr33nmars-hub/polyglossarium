# Design Document: Polyglossarium Expansion

## Overview

Расширение веб-приложения Polyglossarium для поддержки всех 290 блоков знаний из трёх томов. Система будет автоматически парсить Markdown-файлы, генерировать структурированные данные и отображать их в адаптивном интерфейсе с оптимизированной производительностью.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  GridSystem  │  │    Drawer    │  │  SearchBar   │      │
│  │  Component   │  │  Component   │  │  (Optional)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              curriculum.js (290 blocks)              │   │
│  │  Generated from: Polyglsssarium_tom_1/2/3.md        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Build-Time Parser                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  parse_curriculum.py (Node.js alternative)           │   │
│  │  - Reads 3 Markdown files                            │   │
│  │  - Extracts categories and topics                    │   │
│  │  - Validates data structure                          │   │
│  │  - Generates curriculum.js                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Layout
│   └── Header
├── Hero
├── GridSystem (Main Component)
│   ├── GridCard (x60 categories)
│   └── Drawer (Modal)
│       ├── CategoryHeader
│       ├── TopicList
│       └── TopicDetail
└── Methodology
```

## Components and Interfaces

### 1. Parser Script (parse_curriculum.py)

**Purpose:** Извлечение данных из Markdown-файлов и генерация curriculum.js

**Input:**
- `Polyglsssarium_tom_1.md` (блоки 1-65)
- `Polyglsssarium_tom_2.md` (блоки 66-185)
- `Polyglsssarium_tom_3.md` (блоки 186-290)

**Output:**
- `web/src/data/curriculum.js` (JavaScript module)

**Algorithm:**
```python
def parse_markdown_files():
    categories = []
    current_category = None
    current_category_id = 0
    
    for file in [tom_1, tom_2, tom_3]:
        lines = read_file(file)
        
        for line in lines:
            # Detect category header (## N. Category Name)
            if line.startswith('## '):
                if current_category:
                    categories.append(current_category)
                
                category_match = re.match(r'## (\d+)\. (.+)', line)
                current_category = {
                    'id': current_category_id,
                    'category': category_match.group(2),
                    'description': '',
                    'topics': []
                }
                current_category_id += 1
            
            # Detect topic (N. Topic Name)
            elif re.match(r'^\d+\. ', line):
                topic_match = re.match(r'^(\d+)\. (.+)', line)
                topic_id = topic_match.group(1)
                topic_title = topic_match.group(2)
                
                # Read description (next line with "   - ")
                description = read_next_description_line()
                
                current_category['topics'].append({
                    'id': topic_id,
                    'title': topic_title,
                    'description': description
                })
    
    return categories

def generate_curriculum_js(categories):
    js_content = 'export const curriculum = ' + json.dumps(categories, ensure_ascii=False, indent=2) + ';'
    write_file('web/src/data/curriculum.js', js_content)
```

**Validation Rules:**
- Проверка уникальности ID блоков (1-290)
- Проверка наличия всех обязательных полей
- Проверка корректности Markdown-ссылок
- Проверка последовательности категорий (0-59)

### 2. Data Structure (curriculum.js)

**Interface:**
```typescript
interface Topic {
  id: string;           // "1" to "290"
  title: string;        // Topic name
  description: string;  // Description with Markdown links
}

interface Category {
  id: number;           // 0 to 59
  category: string;     // Category name
  description: string;  // Optional category description
  topics: Topic[];      // Array of topics
}

type Curriculum = Category[];
```

**Example:**
```javascript
export const curriculum = [
  {
    "id": 0,
    "category": "Метанавык",
    "description": "",
    "topics": [
      {
        "id": "1",
        "title": "Критическое мышление и логика",
        "description": "Способность анализировать информацию..."
      },
      {
        "id": "2",
        "title": "Научный метод",
        "description": "Систематический подход к познанию мира..."
      }
    ]
  },
  // ... 59 more categories
];
```

### 3. GridSystem Component

**Purpose:** Отображение всех категорий в прокручиваемой сетке

**Props:** None (uses curriculum from import)

**State:**
```typescript
interface GridSystemState {
  selectedCategory: Category | null;
  selectedTopic: Topic | null;
  constraints: { left: number; right: number };
}
```

**Key Features:**
- Horizontal drag-to-scroll с Framer Motion
- 2-row grid layout (30 categories per row)
- Lazy rendering для оптимизации
- Blur edges для визуального эффекта

**Rendering Logic:**
```javascript
// Calculate grid constraints based on viewport width
const updateConstraints = () => {
  const viewportWidth = containerRef.current.offsetWidth;
  const columns = Math.ceil(curriculum.length / 2); // 2 rows
  const contentWidth = columns * 300; // 300px per card
  const minLeft = Math.min(0, viewportWidth - contentWidth);
  setConstraints({ left: minLeft, right: 0 });
};

// Render grid with drag
<motion.div
  drag="x"
  dragConstraints={constraints}
  className="grid grid-rows-2 grid-flow-col gap-0"
>
  {curriculum.map((cat, index) => (
    <GridCard key={cat.id} cat={cat} index={index} onClick={handleCardClick} />
  ))}
</motion.div>
```

### 4. GridCard Component

**Purpose:** Отображение одной карточки категории

**Props:**
```typescript
interface GridCardProps {
  cat: Category;
  index: number;
  onClick: (cat: Category) => void;
}
```

**Rendering:**
- Module number (MOD 00-59)
- Category name (uppercase, large font)
- Topic count
- Hover effects (background color, arrow animation)

**Optimization:**
- Wrapped in React.memo для предотвращения лишних ре-рендеров
- Staggered animation (delay based on index)

### 5. Drawer Component

**Purpose:** Боковая панель для отображения блоков категории

**State:**
```typescript
interface DrawerState {
  view: 'list' | 'detail';  // Current view
}
```

**Views:**

**List View:**
- Displays all topics in selected category
- Each topic as clickable button
- Shows topic ID and title
- Smooth scroll

**Detail View:**
- Shows selected topic details
- Title, description, links
- "Back to list" button
- Sources section (extracted from Markdown links)

**Animations:**
- Slide in from right (drawer open/close)
- Slide left/right (view transitions)
- Backdrop blur

### 6. Search Component (Optional)

**Purpose:** Фильтрация категорий и блоков по ключевым словам

**Props:**
```typescript
interface SearchProps {
  onSearch: (query: string) => void;
}
```

**Algorithm:**
```javascript
const filterCurriculum = (query: string) => {
  if (!query) return curriculum;
  
  const lowerQuery = query.toLowerCase();
  
  return curriculum
    .map(category => ({
      ...category,
      topics: category.topics.filter(topic =>
        topic.title.toLowerCase().includes(lowerQuery) ||
        topic.description.toLowerCase().includes(lowerQuery)
      )
    }))
    .filter(category => 
      category.topics.length > 0 ||
      category.category.toLowerCase().includes(lowerQuery)
    );
};
```

## Data Models

### Category Model

```typescript
class Category {
  id: number;
  category: string;
  description: string;
  topics: Topic[];
  
  constructor(data: CategoryData) {
    this.id = data.id;
    this.category = data.category;
    this.description = data.description || '';
    this.topics = data.topics.map(t => new Topic(t));
  }
  
  getTopicCount(): number {
    return this.topics.length;
  }
  
  findTopicById(id: string): Topic | undefined {
    return this.topics.find(t => t.id === id);
  }
}
```

### Topic Model

```typescript
class Topic {
  id: string;
  title: string;
  description: string;
  
  constructor(data: TopicData) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
  }
  
  extractLinks(): Array<{ text: string; url: string }> {
    const links = [];
    const regex = /\[(.*?)\]\((.*?)\)/g;
    let match;
    
    while ((match = regex.exec(this.description)) !== null) {
      links.push({ text: match[1], url: match[2] });
    }
    
    return links;
  }
  
  getCleanDescription(): string {
    return this.description.replace(/\[(.*?)\]\((.*?)\)/g, '').trim();
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Markdown Parsing Completeness
*For any* valid Markdown file containing category headers and topic blocks, parsing should extract all blocks with complete fields (id, title, description).
**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: Category Structure Integrity
*For any* generated category object, it must contain all required fields: id (number), category (string), description (string), topics (array).
**Validates: Requirements 2.2**

### Property 3: Topic Structure Integrity
*For any* generated topic object, it must contain all required fields: id (string), title (string), description (string).
**Validates: Requirements 2.3**

### Property 4: ID Uniqueness
*For any* valid curriculum array, all topic IDs must be unique across all categories.
**Validates: Requirements 2.5**

### Property 5: JavaScript Export Format
*For any* generated curriculum.js file, it must start with `export const curriculum = ` and contain valid JavaScript syntax.
**Validates: Requirements 3.2, 3.5**

### Property 6: Markdown Link Preservation
*For any* topic with Markdown links in description, the links must be preserved in the format `[text](url)`.
**Validates: Requirements 2.4**

### Property 7: Grid Rendering Completeness
*For any* curriculum array loaded into GridSystem, the number of rendered category cards must equal the length of the curriculum array.
**Validates: Requirements 4.1**

### Property 8: Card Content Completeness
*For any* rendered category card, it must display module number, category name, and topic count.
**Validates: Requirements 4.4**

### Property 9: Drawer Content Completeness
*For any* opened category drawer, it must display category name, module number, and all topics from that category.
**Validates: Requirements 5.2**

### Property 10: Topic Detail Display
*For any* selected topic in drawer, the detail view must display title, description, and extracted links.
**Validates: Requirements 5.3**

### Property 11: Search Filtering Correctness
*For any* search query, filtered results must only include categories/topics where title or description contains the query (case-insensitive).
**Validates: Requirements 8.1**

### Property 12: Search Result Count Accuracy
*For any* search query, the displayed result count must equal the actual number of matching categories and topics.
**Validates: Requirements 8.3**

### Property 13: Multilingual Search Support
*For any* search query in Russian or English, the search function must correctly match characters and return relevant results.
**Validates: Requirements 8.5**

### Property 14: Validation Error Detection
*For any* input data with missing required fields (id, title, description), the parser must detect and report the error.
**Validates: Requirements 9.1**

### Property 15: Duplicate ID Detection
*For any* input data containing duplicate topic IDs, the parser must detect the duplication and halt parsing.
**Validates: Requirements 9.3**

### Property 16: Empty Category Warning
*For any* category with zero topics, the parser must emit a warning message.
**Validates: Requirements 9.4**

### Property 17: LocalStorage Persistence Round-Trip
*For any* topic marked as completed, saving to localStorage then loading from localStorage must preserve the completion status.
**Validates: Requirements 10.1, 10.2**

### Property 18: Visual Distinction of Completed Topics
*For any* topic marked as completed, its rendered element must have a distinct CSS class or style compared to incomplete topics.
**Validates: Requirements 10.3**

### Property 19: Progress Calculation Accuracy
*For any* category with N topics and M completed topics, the displayed progress must be "M из N блоков изучено".
**Validates: Requirements 10.4**

### Property 20: Responsive Font Scaling
*For any* viewport width between 320px and 2560px, text elements must use responsive units (rem, em, %) and remain readable.
**Validates: Requirements 7.4**

## Error Handling

### Parser Errors

**File Not Found:**
```python
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
except FileNotFoundError:
    print(f"ERROR: File not found: {file_path}")
    sys.exit(1)
```

**Invalid Markdown Structure:**
```python
if not re.match(r'## \d+\. .+', line):
    print(f"WARNING: Line {line_num}: Invalid category header format")
    continue
```

**Missing Required Fields:**
```python
if not topic_id or not topic_title or not topic_description:
    print(f"ERROR: Line {line_num}: Missing required fields for topic")
    errors.append(f"Line {line_num}: Incomplete topic data")
```

**Duplicate IDs:**
```python
seen_ids = set()
for topic in all_topics:
    if topic['id'] in seen_ids:
        print(f"ERROR: Duplicate topic ID: {topic['id']}")
        sys.exit(1)
    seen_ids.add(topic['id'])
```

### UI Error Handling

**Failed Data Load:**
```javascript
try {
  const { curriculum } = await import('./data/curriculum.js');
  setCurriculum(curriculum);
} catch (error) {
  console.error('Failed to load curriculum:', error);
  setError('Не удалось загрузить данные. Пожалуйста, обновите страницу.');
}
```

**Invalid Topic ID:**
```javascript
const topic = category.findTopicById(topicId);
if (!topic) {
  console.warn(`Topic not found: ${topicId}`);
  return null;
}
```

**LocalStorage Quota Exceeded:**
```javascript
try {
  localStorage.setItem('progress', JSON.stringify(progress));
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    alert('Хранилище браузера заполнено. Очистите данные или используйте другой браузер.');
  }
}
```

## Testing Strategy

### Dual Testing Approach

This project will use both **unit tests** and **property-based tests** to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing Configuration

**Library:** We will use **fast-check** for JavaScript/TypeScript property-based testing.

**Configuration:**
- Minimum 100 iterations per property test
- Each property test must reference its design document property
- Tag format: `// Feature: polyglossarium-expansion, Property N: [property text]`

**Example Property Test:**
```javascript
import fc from 'fast-check';

// Feature: polyglossarium-expansion, Property 4: ID Uniqueness
test('all topic IDs must be unique across categories', () => {
  fc.assert(
    fc.property(
      fc.array(categoryArbitrary, { minLength: 1, maxLength: 60 }),
      (categories) => {
        const allIds = categories.flatMap(cat => cat.topics.map(t => t.id));
        const uniqueIds = new Set(allIds);
        return allIds.length === uniqueIds.size;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

**Framework:** Vitest (already configured in project)

**Test Coverage:**
- Parser functions (file reading, regex matching, data extraction)
- Data validation functions
- Component rendering (React Testing Library)
- User interactions (clicks, scrolls, search)
- LocalStorage operations

**Example Unit Test:**
```javascript
import { describe, it, expect } from 'vitest';
import { parseMarkdownFile } from './parser';

describe('Parser', () => {
  it('should extract category from header', () => {
    const markdown = '## 0. Метанавык\n\n1. Topic\n   - Description';
    const result = parseMarkdownFile(markdown);
    
    expect(result[0].category).toBe('Метанавык');
    expect(result[0].id).toBe(0);
  });
  
  it('should handle missing description gracefully', () => {
    const markdown = '## 0. Category\n\n1. Topic';
    const result = parseMarkdownFile(markdown);
    
    expect(result[0].topics[0].description).toBe('');
  });
});
```

### Integration Testing

**Scenarios:**
1. Full parsing pipeline: Markdown files → curriculum.js → UI rendering
2. User flow: Open page → Click category → View topic → Close drawer
3. Search flow: Enter query → View results → Clear search
4. Progress tracking: Mark topic complete → Reload page → Verify persistence

### Performance Testing

**Metrics:**
- Initial page load time (target: < 2s)
- Time to first contentful paint (target: < 1s)
- Drawer open animation duration (target: < 300ms)
- Search response time (target: < 100ms)

**Tools:**
- Lighthouse for performance audits
- React DevTools Profiler for component rendering analysis
- Chrome DevTools Performance tab for FPS monitoring

### Accessibility Testing

**Requirements:**
- Keyboard navigation support (Tab, Enter, Escape)
- ARIA labels for interactive elements
- Sufficient color contrast (WCAG AA)
- Screen reader compatibility

**Tools:**
- axe DevTools for automated accessibility checks
- Manual testing with screen readers (NVDA, JAWS)

## Implementation Notes

### Build Process

1. **Development:**
   ```bash
   # Run parser to generate curriculum.js
   python parse_curriculum.py
   
   # Start dev server
   cd web
   npm run dev
   ```

2. **Production:**
   ```bash
   # Generate curriculum.js
   python parse_curriculum.py
   
   # Build optimized bundle
   cd web
   npm run build
   ```

### File Structure

```
project/
├── Polyglsssarium_tom_1.md
├── Polyglsssarium_tom_2.md
├── Polyglsssarium_tom_3.md
├── parse_curriculum.py
└── web/
    ├── src/
    │   ├── data/
    │   │   └── curriculum.js (generated)
    │   ├── components/
    │   │   ├── GridSystem.jsx
    │   │   ├── Drawer.jsx
    │   │   └── SearchBar.jsx (optional)
    │   └── lib/
    │       └── utils.js
    └── package.json
```

### Dependencies

**Parser:**
- Python 3.8+
- Standard library only (re, json, sys)

**Web App:**
- React 18+
- Framer Motion (animations)
- Tailwind CSS (styling)
- Lucide React (icons)
- Lenis (smooth scroll)
- fast-check (property testing)
- Vitest (unit testing)
- React Testing Library (component testing)

### Performance Optimizations

1. **React.memo** for GridCard components
2. **Lazy loading** for Drawer component
3. **Virtual scrolling** for large topic lists (if needed)
4. **Debounced search** to reduce re-renders
5. **Code splitting** for optional features (search, progress tracking)

### Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

### Future Enhancements

1. **Export/Import Progress:** Allow users to backup/restore their progress
2. **Study Mode:** Spaced repetition algorithm for optimal learning
3. **Notes:** Allow users to add personal notes to topics
4. **Bookmarks:** Mark favorite topics for quick access
5. **Dark Mode:** Toggle between light and dark themes
6. **Offline Support:** Service worker for offline access
7. **Multi-language UI:** Support for English interface
8. **Analytics:** Track which topics are most viewed
