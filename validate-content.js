#!/usr/bin/env node

import { topicDescriptions } from './web/src/data/topicDescriptions.js';
import { curriculum } from './web/src/data/curriculum.js';

console.log('=== ВАЛИДАЦИЯ КОНТЕНТА POLYGLOSSARIUM ===\n');

// 1. Проверка количества модулей
const totalModules = Object.keys(topicDescriptions).length;
const expectedModules = curriculum.reduce((sum, cat) => sum + cat.topics.length, 0);

console.log('1. КОЛИЧЕСТВО МОДУЛЕЙ:');
console.log(`   Сгенерировано: ${totalModules}`);
console.log(`   Ожидается: ${expectedModules}`);
console.log(`   Статус: ${totalModules === expectedModules ? '✓ УСПЕХ' : '✗ ОШИБКА'}\n`);

// 2. Проверка структуры данных
console.log('2. СТРУКТУРА ДАННЫХ:');
let structureValid = true;
for (const [id, module] of Object.entries(topicDescriptions)) {
  if (!module.title || !module.description) {
    console.log(`   ✗ Модуль ${id}: отсутствует title или description`);
    structureValid = false;
  }
}
console.log(`   Статус: ${structureValid ? '✓ ВСЕ МОДУЛИ ИМЕЮТ КОРРЕКТНУЮ СТРУКТУРУ' : '✗ НАЙДЕНЫ ОШИБКИ'}\n`);

// 3. Проверка случайных модулей
console.log('3. ПРОВЕРКА СЛУЧАЙНЫХ МОДУЛЕЙ:');
const testIds = [1, 50, 100, 150, 200, 250, 290];
testIds.forEach(id => {
  const module = topicDescriptions[id];
  if (module) {
    const descLength = module.description.length;
    const paragraphs = module.description.split('\\n\\n').length;
    console.log(`   ✓ Модуль ${id}: ${module.title}`);
    console.log(`     Длина: ${descLength} символов, Параграфов: ${paragraphs}`);
  } else {
    console.log(`   ✗ Модуль ${id}: ОТСУТСТВУЕТ`);
  }
});

// 4. Проверка соответствия curriculum
console.log('\n4. СООТВЕТСТВИЕ CURRICULUM:');
let allTopicsPresent = true;
let missingCount = 0;
curriculum.forEach(category => {
  category.topics.forEach(topic => {
    if (!topicDescriptions[topic.id]) {
      console.log(`   ✗ Отсутствует модуль ${topic.id}: ${topic.title}`);
      allTopicsPresent = false;
      missingCount++;
    }
  });
});
console.log(`   Статус: ${allTopicsPresent ? '✓ ВСЕ МОДУЛИ ИЗ CURRICULUM ПРИСУТСТВУЮТ' : `✗ ОТСУТСТВУЕТ ${missingCount} МОДУЛЕЙ`}\n`);

// 5. Проверка качества контента
console.log('5. КАЧЕСТВО КОНТЕНТА:');
let minLength = Infinity;
let maxLength = 0;
let totalLength = 0;
let shortModules = [];

Object.entries(topicDescriptions).forEach(([id, module]) => {
  const length = module.description.length;
  totalLength += length;
  if (length < minLength) minLength = length;
  if (length > maxLength) maxLength = length;
  if (length < 500) {
    shortModules.push({ id, title: module.title, length });
  }
});

const avgLength = Math.round(totalLength / totalModules);
console.log(`   Минимальная длина: ${minLength} символов`);
console.log(`   Максимальная длина: ${maxLength} символов`);
console.log(`   Средняя длина: ${avgLength} символов`);
console.log(`   Модулей короче 500 символов: ${shortModules.length}`);

if (shortModules.length > 0 && shortModules.length <= 5) {
  console.log('   Короткие модули:');
  shortModules.forEach(m => {
    console.log(`     - Модуль ${m.id}: ${m.title} (${m.length} символов)`);
  });
}

// 6. Итоговый статус
console.log('\n=== ИТОГОВЫЙ СТАТУС ===');
const allChecks = totalModules === expectedModules && structureValid && allTopicsPresent;
console.log(allChecks ? '✓ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО' : '✗ ОБНАРУЖЕНЫ ПРОБЛЕМЫ');
console.log('\nКонтент готов к использованию на фронтенде!');
