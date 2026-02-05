# Implementation Plan: Polyglossarium Expansion

## Overview

Расширение веб-приложения Polyglossarium с 62 до 290 блоков знаний через автоматический парсинг Markdown-файлов и обновление UI-компонентов. Реализация включает создание парсера, генерацию данных, обновление компонентов и добавление тестов.

## Tasks

- [x] 1. Создать парсер Markdown-файлов
  - Написать Python-скрипт для чтения трёх томов Polyglossarium
  - Реализовать извлечение категорий (заголовки ##)
  - Реализовать извлечение блоков (номер, название, описание)
  - Добавить валидацию данных (обязательные поля, уникальность ID)
  - Реализовать генерацию curriculum.js с корректным экранированием
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.5, 9.1, 9.2, 9.3, 9.4_

- [ ]* 1.1 Написать property test для парсинга Markdown
  - **Property 1: Markdown Parsing Completeness**
  - **Validates: Requirements 1.2, 1.3, 1.4**

- [ ]* 1.2 Написать property test для структуры категорий
  - **Property 2: Category Structure Integrity**
  - **Validates: Requirements 2.2**

- [ ]* 1.3 Написать property test для структуры блоков
  - **Property 3: Topic Structure Integrity**
  - **Validates: Requirements 2.3**

- [ ]* 1.4 Написать property test для уникальности ID
  - **Property 4: ID Uniqueness**
  - **Validates: Requirements 2.5**

- [ ]* 1.5 Написать property test для формата экспорта JavaScript
  - **Property 5: JavaScript Export Format**
  - **Validates: Requirements 3.2, 3.5**

- [ ]* 1.6 Написать property test для сохранения Markdown-ссылок
  - **Property 6: Markdown Link Preservation**
  - **Validates: Requirements 2.4**

- [ ]* 1.7 Написать unit tests для парсера
  - Тест чтения файлов
  - Тест извлечения категорий
  - Тест извлечения блоков
  - Тест обработки ошибок (missing fields, duplicates)
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.3_

- [x] 2. Запустить парсер и сгенерировать curriculum.js
  - Выполнить `python parse_curriculum.py`
  - Проверить, что файл web/src/data/curriculum.js создан
  - Проверить наличие всех 62 категорий (id 0-61)
  - Проверить наличие всех 290 блоков (id "1"-"290")
  - Проверить валидность JavaScript-синтаксиса
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 3. Checkpoint - Проверить сгенерированные данные
  - Убедиться, что все тесты парсера проходят
  - Проверить структуру curriculum.js вручную
  - Спросить пользователя, если возникли вопросы

- [x] 4. Обновить GridSystem для отображения всех категорий
  - Обновить импорт curriculum из data/curriculum.js
  - Убедиться, что все 62 категории рендерятся в сетке
  - Проверить корректность drag-to-scroll constraints для 62 карточек
  - Обновить layout для 2 рядов (31 категорий в ряд)
  - _Requirements: 4.1, 4.2_

- [ ]* 4.1 Написать property test для полноты рендеринга сетки
  - **Property 7: Grid Rendering Completeness**
  - **Validates: Requirements 4.1**

- [ ]* 4.2 Написать property test для содержимого карточек
  - **Property 8: Card Content Completeness**
  - **Validates: Requirements 4.4**

- [ ]* 4.3 Написать unit tests для GridSystem
  - Тест рендеринга всех категорий
  - Тест drag-to-scroll функциональности
  - Тест hover-эффектов
  - Тест открытия drawer при клике
  - _Requirements: 4.1, 4.3, 4.5, 5.1_

- [x] 5. Обновить Drawer для отображения всех блоков
  - Убедиться, что drawer корректно отображает категории с большим количеством блоков
  - Добавить виртуальный скроллинг, если список блоков слишком длинный (опционально)
  - Проверить плавность анимаций переключения между list и detail view
  - _Requirements: 5.2, 5.3_

- [ ]* 5.1 Написать property test для содержимого drawer
  - **Property 9: Drawer Content Completeness**
  - **Validates: Requirements 5.2**

- [ ]* 5.2 Написать property test для отображения деталей блока
  - **Property 10: Topic Detail Display**
  - **Validates: Requirements 5.3**

- [ ]* 5.3 Написать unit tests для Drawer
  - Тест отображения списка блоков
  - Тест переключения на detail view
  - Тест кнопки "Назад к списку"
  - Тест закрытия drawer
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 6. Checkpoint - Проверить базовую функциональность
  - Убедиться, что все категории отображаются
  - Проверить открытие drawer и просмотр блоков
  - Проверить производительность на больших категориях
  - Спросить пользователя, если возникли вопросы

- [ ] 7. Добавить компонент поиска (опционально)
  - Создать компонент SearchBar с input полем
  - Реализовать функцию фильтрации curriculum по запросу
  - Добавить debounce для оптимизации (300ms)
  - Реализовать подсветку совпадений в результатах
  - Добавить счётчик найденных результатов
  - Реализовать кнопку очистки поиска
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 7.1 Написать property test для корректности фильтрации
  - **Property 11: Search Filtering Correctness**
  - **Validates: Requirements 8.1**

- [ ]* 7.2 Написать property test для точности подсчёта результатов
  - **Property 12: Search Result Count Accuracy**
  - **Validates: Requirements 8.3**

- [ ]* 7.3 Написать property test для многоязычного поиска
  - **Property 13: Multilingual Search Support**
  - **Validates: Requirements 8.5**

- [ ]* 7.4 Написать unit tests для поиска
  - Тест фильтрации по названию
  - Тест фильтрации по описанию
  - Тест case-insensitive поиска
  - Тест очистки поиска
  - Тест подсветки совпадений
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 8. Добавить отслеживание прогресса (опционально)
  - Добавить чекбоксы для блоков в drawer
  - Реализовать сохранение статуса в localStorage
  - Реализовать загрузку статуса при монтировании компонента
  - Добавить визуальное отличие для изученных блоков
  - Добавить отображение прогресса в категории (X из Y изучено)
  - Добавить кнопку сброса прогресса
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 8.1 Написать property test для round-trip localStorage
  - **Property 17: LocalStorage Persistence Round-Trip**
  - **Validates: Requirements 10.1, 10.2**

- [ ]* 8.2 Написать property test для визуального отличия
  - **Property 18: Visual Distinction of Completed Topics**
  - **Validates: Requirements 10.3**

- [ ]* 8.3 Написать property test для точности подсчёта прогресса
  - **Property 19: Progress Calculation Accuracy**
  - **Validates: Requirements 10.4**

- [ ]* 8.4 Написать unit tests для отслеживания прогресса
  - Тест сохранения в localStorage
  - Тест загрузки из localStorage
  - Тест обработки QuotaExceededError
  - Тест сброса прогресса
  - _Requirements: 10.1, 10.2, 10.5_

- [ ] 9. Оптимизация производительности
  - Проверить использование React.memo для GridCard
  - Добавить lazy loading для Drawer компонента
  - Оптимизировать re-renders при прокрутке
  - Провести профилирование с React DevTools
  - Убедиться, что FPS остаётся на уровне 60 при прокрутке
  - _Requirements: 6.1, 6.2, 6.5_

- [ ]* 9.1 Написать unit test для использования React.memo
  - Проверить, что GridCard обёрнут в memo
  - _Requirements: 6.5_

- [ ] 10. Адаптивность и responsive design
  - Проверить отображение на мобильных устройствах (320px-768px)
  - Проверить отображение на планшетах (768px-1024px)
  - Проверить отображение на десктопах (1024px-2560px)
  - Убедиться, что drawer занимает всю ширину на мобильных
  - Проверить touch-жесты для drag-to-scroll
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 10.1 Написать property test для responsive font scaling
  - **Property 20: Responsive Font Scaling**
  - **Validates: Requirements 7.4**

- [ ]* 10.2 Написать unit tests для адаптивности
  - Тест размеров карточек на разных экранах
  - Тест ширины drawer на мобильных
  - Тест responsive font sizes
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 11. Accessibility (a11y)
  - Добавить ARIA labels для интерактивных элементов
  - Реализовать keyboard navigation (Tab, Enter, Escape)
  - Проверить цветовой контраст (WCAG AA)
  - Протестировать с screen reader (NVDA или JAWS)
  - Запустить axe DevTools для автоматической проверки

- [ ] 12. Checkpoint - Финальное тестирование
  - Запустить все unit tests (`npm test`)
  - Запустить все property tests
  - Проверить coverage (target: >80%)
  - Провести manual testing всех функций
  - Проверить производительность с Lighthouse
  - Спросить пользователя, если возникли вопросы

- [ ] 13. Документация и деплой
  - Обновить README.md с инструкциями по запуску парсера
  - Добавить комментарии к сложным частям кода
  - Создать CHANGELOG.md с описанием изменений
  - Подготовить production build (`npm run build`)
  - Проверить размер bundle (target: <500KB gzipped)

## Notes

- Задачи, отмеченные `*`, являются опциональными и могут быть пропущены для более быстрого MVP
- Каждая задача ссылается на конкретные требования для трассируемости
- Checkpoints обеспечивают инкрементальную валидацию
- Property tests валидируют универсальные свойства корректности
- Unit tests валидируют конкретные примеры и edge cases
