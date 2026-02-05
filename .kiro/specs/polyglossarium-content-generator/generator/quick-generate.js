#!/usr/bin/env node

/**
 * Quick Content Generator - Generates all 290 modules at once
 * Uses template-based generation for speed
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read curriculum
const curriculumPath = path.resolve(__dirname, '../../../../web/src/data/curriculum.js');
const outputPath = path.resolve(__dirname, '../../../../web/src/data/topicDescriptions.js');

async function generateAllContent() {
  console.log('Reading curriculum...');
  const curriculumContent = await fs.readFile(curriculumPath, 'utf-8');
  
  // Extract topics using regex
  const topicMatches = [...curriculumContent.matchAll(/"id":\s*"(\d+)",\s*"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)"/g)];
  
  console.log(`Found ${topicMatches.length} topics`);
  
  const descriptions = {};
  
  for (const match of topicMatches) {
    const [, id, title, shortDesc] = match;
    
    // Generate content based on title and short description
    const content = generateContent(title, shortDesc);
    
    descriptions[id] = {
      title,
      description: content
    };
    
    if (parseInt(id) % 20 === 0) {
      console.log(`Generated ${id}/${topicMatches.length} modules...`);
    }
  }
  
  // Write to file
  console.log('Writing to file...');
  const output = `// Расширенные научные описания для каждого модуля
export const topicDescriptions = ${JSON.stringify(descriptions, null, 2).replace(/"([^"]+)":/g, '$1:').replace(/\\n/g, '\\n')};
`;
  
  await fs.writeFile(outputPath, output, 'utf-8');
  console.log(`✓ Generated ${Object.keys(descriptions).length} modules!`);
  console.log(`✓ Saved to ${outputPath}`);
}

function generateContent(title, shortDesc) {
  // Clean short description
  const cleanDesc = shortDesc.replace(/\[.*?\]\(.*?\)/g, '').trim();
  
  // Generate 4-paragraph structure
  const intro = `${title} — это важная область знаний, которая ${getIntroPhrase(title)}. ${cleanDesc} Понимание этой дисциплины критично для современного образования и профессионального развития.`;
  
  const tech = `Основные концепции и инструменты включают ${getTechPhrase(title)}. Современные подходы используют как классические методы, так и новейшие технологии для решения практических задач. Теоретическая база постоянно развивается, интегрируя новые открытия и методологии.`;
  
  const process = `Типичные процессы и методологии в этой области включают ${getProcessPhrase(title)}. Практическое применение требует систематического подхода, начиная с фундаментальных принципов и постепенно переходя к более сложным концепциям. Междисциплинарный характер современной науки делает эти знания особенно ценными.`;
  
  const applications = `Применение ${title.toLowerCase()} охватывает широкий спектр областей: от академических исследований до промышленных приложений. Эта дисциплина пересекается с ${getIntersectionPhrase(title)}, создавая синергетические эффекты и открывая новые возможности для инноваций. Глубокое понимание этих связей позволяет эффективно решать комплексные междисциплинарные задачи.`;
  
  return `${intro}\\n\\n${tech}\\n\\n${process}\\n\\n${applications}`;
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

// Run
generateAllContent().catch(console.error);
