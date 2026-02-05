#!/usr/bin/env node

/**
 * Enhanced Content Generator - Generates all 290 modules with links and references
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const curriculumPath = path.resolve(__dirname, '../../../../web/src/data/curriculum.js');
const outputPath = path.resolve(__dirname, '../../../../web/src/data/topicDescriptions.js');

// База ссылок на ресурсы по категориям
const resourceLinks = {
  'Метанавык': [
    { text: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/' },
    { text: 'LessWrong: Rationality', url: 'https://www.lesswrong.com/' },
    { text: 'Khan Academy', url: 'https://www.khanacademy.org/' }
  ],
  'Математика': [
    { text: '3Blue1Brown', url: 'https://www.youtube.com/c/3blue1brown' },
    { text: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/' },
    { text: 'Wolfram MathWorld', url: 'https://mathworld.wolfram.com/' },
    { text: 'Khan Academy: Math', url: 'https://www.khanacademy.org/math' }
  ],
  'Физика': [
    { text: 'MIT Physics', url: 'https://ocw.mit.edu/courses/physics/' },
    { text: 'Feynman Lectures', url: 'https://www.feynmanlectures.caltech.edu/' },
    { text: 'PhysicsWorld', url: 'https://physicsworld.com/' }
  ],
  'Химия': [
    { text: 'Khan Academy: Chemistry', url: 'https://www.khanacademy.org/science/chemistry' },
    { text: 'ChemGuide', url: 'https://www.chemguide.co.uk/' },
    { text: 'Royal Society of Chemistry', url: 'https://www.rsc.org/' }
  ],
  'Биология и нейронаука': [
    { text: 'Nature', url: 'https://www.nature.com/' },
    { text: 'NCBI', url: 'https://www.ncbi.nlm.nih.gov/' },
    { text: 'Khan Academy: Biology', url: 'https://www.khanacademy.org/science/biology' }
  ],
  'Философия': [
    { text: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/' },
    { text: 'Internet Encyclopedia of Philosophy', url: 'https://iep.utm.edu/' },
    { text: 'PhilPapers', url: 'https://philpapers.org/' }
  ],
  'Политика, право, международные отношения': [
    { text: 'Council on Foreign Relations', url: 'https://www.cfr.org/' },
    { text: 'LSE', url: 'https://www.lse.ac.uk/' },
    { text: 'Oxford Politics', url: 'https://www.politics.ox.ac.uk/' }
  ],
  'Экономика и финансы': [
    { text: 'Khan Academy: Economics', url: 'https://www.khanacademy.org/economics-finance-domain' },
    { text: 'IMF', url: 'https://www.imf.org/' },
    { text: 'World Bank', url: 'https://www.worldbank.org/' }
  ],
  'География, история, климат': [
    { text: 'National Geographic', url: 'https://www.nationalgeographic.com/' },
    { text: 'NASA Climate', url: 'https://climate.nasa.gov/' },
    { text: 'World History Encyclopedia', url: 'https://www.worldhistory.org/' }
  ],
  'Культура, искусство и религия': [
    { text: 'Metropolitan Museum', url: 'https://www.metmuseum.org/' },
    { text: 'Khan Academy: Art History', url: 'https://www.khanacademy.org/humanities/art-history' },
    { text: 'World Religions', url: 'https://www.bbc.co.uk/religion/religions/' }
  ],
  'Психология и социология': [
    { text: 'APA', url: 'https://www.apa.org/' },
    { text: 'Psychology Today', url: 'https://www.psychologytoday.com/' },
    { text: 'American Sociological Association', url: 'https://www.asanet.org/' }
  ],
  'Цифровая культура, соцсети, TikTok': [
    { text: 'Pew Research: Internet', url: 'https://www.pewresearch.org/internet/' },
    { text: 'MIT Media Lab', url: 'https://www.media.mit.edu/' },
    { text: 'Digital Culture & Society', url: 'https://www.degruyter.com/journal/key/dcs/html' }
  ],
  'default': [
    { text: 'Wikipedia', url: 'https://en.wikipedia.org/' },
    { text: 'Coursera', url: 'https://www.coursera.org/' },
    { text: 'edX', url: 'https://www.edx.org/' }
  ]
};

async function generateAllContent() {
  console.log('Reading curriculum...');
  const curriculumContent = await fs.readFile(curriculumPath, 'utf-8');
  
  // Extract topics
  const topicMatches = [...curriculumContent.matchAll(/"id":\s*"(\d+)",\s*"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)"/g)];
  
  // Extract categories
  const categoryMatches = [...curriculumContent.matchAll(/"category":\s*"([^"]+)"/g)];
  const categories = categoryMatches.map(m => m[1]);
  
  console.log(`Found ${topicMatches.length} topics in ${categories.length} categories`);
  
  const descriptions = {};
  
  for (const match of topicMatches) {
    const [, id, title, shortDesc] = match;
    
    // Найти категорию для этого топика
    const category = findCategoryForTopic(parseInt(id), curriculumContent);
    
    // Generate content with links
    const content = generateContentWithLinks(title, shortDesc, category);
    
    descriptions[id] = {
      title,
      description: content.text,
      links: content.links
    };
    
    if (parseInt(id) % 20 === 0) {
      console.log(`Generated ${id}/${topicMatches.length} modules...`);
    }
  }
  
  // Write to file
  console.log('Writing to file...');
  const output = generateOutputFile(descriptions);
  
  await fs.writeFile(outputPath, output, 'utf-8');
  console.log(`✓ Generated ${Object.keys(descriptions).length} modules with links!`);
  console.log(`✓ Saved to ${outputPath}`);
}

function findCategoryForTopic(topicId, curriculumContent) {
  // Простой поиск категории по ID топика
  const categories = [
    { name: 'Метанавык', range: [1, 2] },
    { name: 'Математика', range: [3, 8] },
    { name: 'Физика', range: [9, 14] },
    { name: 'Химия', range: [15, 18] },
    { name: 'Биология и нейронаука', range: [19, 24] },
    { name: 'Философия', range: [25, 29] },
    { name: 'Политика, право, международные отношения', range: [30, 34] },
    { name: 'Экономика и финансы', range: [35, 39] },
    { name: 'География, история, климат', range: [40, 44] },
    { name: 'Культура, искусство и религия', range: [45, 48] },
    { name: 'Психология и социология', range: [49, 52] },
    { name: 'Цифровая культура, соцсети, TikTok', range: [53, 57] }
  ];
  
  for (const cat of categories) {
    if (topicId >= cat.range[0] && topicId <= cat.range[1]) {
      return cat.name;
    }
  }
  
  return 'default';
}

function generateContentWithLinks(title, shortDesc, category) {
  const cleanDesc = shortDesc.replace(/\[.*?\]\(.*?\)/g, '').trim();
  
  // Получить ссылки для категории
  const categoryLinks = resourceLinks[category] || resourceLinks['default'];
  
  // Выбрать 2-3 случайные ссылки
  const selectedLinks = selectRandomLinks(categoryLinks, 2, 3);
  
  // Generate 4-paragraph structure with embedded links
  const intro = `${title} — это важная область знаний, которая ${getIntroPhrase(title)}. ${cleanDesc} Понимание этой дисциплины критично для современного образования и профессионального развития.`;
  
  const tech = `Основные концепции и инструменты включают ${getTechPhrase(title)}. Современные подходы используют как классические методы, так и новейшие технологии для решения практических задач. Теоретическая база постоянно развивается, интегрируя новые открытия и методологии из различных источников, включая [${selectedLinks[0].text}](${selectedLinks[0].url}).`;
  
  const process = `Типичные процессы и методологии в этой области включают ${getProcessPhrase(title)}. Практическое применение требует систематического подхода, начиная с фундаментальных принципов и постепенно переходя к более сложным концепциям. Междисциплинарный характер современной науки делает эти знания особенно ценными.`;
  
  const applications = `Применение ${title.toLowerCase()} охватывает широкий спектр областей: от академических исследований до промышленных приложений. Эта дисциплина пересекается с ${getIntersectionPhrase(title)}, создавая синергетические эффекты и открывая новые возможности для инноваций. Для углубленного изучения рекомендуется обратиться к ресурсам [${selectedLinks[1].text}](${selectedLinks[1].url})${selectedLinks[2] ? ` и [${selectedLinks[2].text}](${selectedLinks[2].url})` : ''}.`;
  
  const text = `${intro}\\n\\n${tech}\\n\\n${process}\\n\\n${applications}`;
  
  return {
    text,
    links: selectedLinks
  };
}

function selectRandomLinks(links, min, max) {
  const count = Math.min(Math.floor(Math.random() * (max - min + 1)) + min, links.length);
  const shuffled = [...links].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getIntroPhrase(title) {
  const phrases = [
    'изучает фундаментальные принципы и закономерности',
    'объединяет теоретические основы и практические применения',
    'исследует ключевые аспекты и механизмы',
    'анализирует структуру и функционирование систем',
    'рассматривает основные концепции и их взаимосвязи'
  ];
  return phrases[title.length % phrases.length];
}

function getTechPhrase(title) {
  const phrases = [
    'систематический анализ, моделирование процессов и экспериментальную верификацию',
    'математические методы, вычислительные алгоритмы и аналитические инструменты',
    'теоретические модели, практические техники и современные технологии',
    'концептуальные фреймворки, методологические подходы и инструментальные средства',
    'фундаментальные теории, прикладные методы и инновационные решения'
  ];
  return phrases[title.length % phrases.length];
}

function getProcessPhrase(title) {
  const phrases = [
    'последовательное изучение базовых концепций, практическую отработку навыков и критический анализ результатов',
    'формулирование гипотез, проведение исследований и интерпретацию данных',
    'систематизацию знаний, разработку моделей и их валидацию',
    'анализ проблемных ситуаций, синтез решений и оценку эффективности',
    'изучение теоретических основ, освоение практических методов и развитие критического мышления'
  ];
  return phrases[title.length % phrases.length];
}

function getIntersectionPhrase(title) {
  const phrases = [
    'математикой, физикой, информатикой и инженерными науками',
    'естественными науками, технологиями и социальными исследованиями',
    'теоретическими дисциплинами, прикладными областями и междисциплинарными проектами',
    'фундаментальными исследованиями, технологическими разработками и практическими приложениями',
    'различными научными направлениями, создавая целостную картину знаний'
  ];
  return phrases[title.length % phrases.length];
}

function generateOutputFile(descriptions) {
  let output = '// Расширенные научные описания для каждого модуля\nexport const topicDescriptions = {\n';
  
  const entries = Object.entries(descriptions);
  entries.forEach(([id, data], index) => {
    const isLast = index === entries.length - 1;
    output += `  ${id}: {\n`;
    output += `    title: "${data.title}",\n`;
    output += `    description: "${data.description}"\n`;
    output += `  }${isLast ? '' : ','}\n`;
  });
  
  output += '};\n';
  return output;
}

// Run
generateAllContent().catch(console.error);
