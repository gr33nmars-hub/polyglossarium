# Polyglossarium

Интерактивная платформа для изучения полиматии с визуализацией учебного плана и AI-генерацией контента.

[![Build Check](https://github.com/gr33nmars-hub/polyglossarium/actions/workflows/build-check.yml/badge.svg)](https://github.com/gr33nmars-hub/polyglossarium/actions/workflows/build-check.yml)

## Описание

Polyglossarium - это веб-приложение, которое помогает пользователям изучать различные области знаний через структурированный учебный план. Проект включает:

- 🗺️ Интерактивную визуализацию учебного плана (TreeMap)
- 🤖 AI-чат для взаимодействия с протоколом обучения
- 📚 Автоматическую генерацию описаний тем
- 🎨 Современный UI с React и Tailwind CSS

## Структура проекта

```
Polyglossarium/
├── web/                          # Frontend приложение
│   ├── src/
│   │   ├── components/          # React компоненты
│   │   ├── data/                # Данные учебного плана
│   │   └── lib/                 # Утилиты
│   └── public/                  # Статические файлы
├── .kiro/specs/                 # Спецификации функций
│   └── polyglossarium-content-generator/  # Генератор контента
└── Protocol_polymanth.md        # Протокол обучения

```

## Установка и запуск

### Frontend

```bash
cd web
npm install
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

### Content Generator

```bash
cd .kiro/specs/polyglossarium-content-generator/generator
npm install
cp config.example.json config.json
# Настройте config.json с вашими API ключами
node enhanced-generate.js
```

## Деплой

### Cloudflare Pages (Рекомендуется)

1. Перейдите на https://dash.cloudflare.com/pages
2. Нажмите "Create a project" → "Connect to Git"
3. Выберите репозиторий `gr33nmars-hub/polyglossarium`
4. Настройте билд:
   - **Framework preset**: Vite
   - **Build command**: `cd web && npm install && npm run build`
   - **Build output directory**: `web/dist`
   - **Root directory**: `/` (оставьте пустым)
5. Нажмите "Save and Deploy"

Подробные инструкции по деплою смотрите в [DEPLOY.md](./DEPLOY.md)

### GitHub Actions

Проект настроен для автоматической проверки сборки при каждом push. Для автоматического деплоя на Cloudflare Pages через GitHub Actions:

1. Добавьте секреты в GitHub:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. Каждый push в `main` будет автоматически деплоить проект

## Технологии

- **Frontend**: React 19, Vite 7, Tailwind CSS, Framer Motion, D3.js
- **Content Generation**: Node.js, OpenAI API, Perplexity API
- **Testing**: Vitest, fast-check (Property-Based Testing)
- **Deployment**: Cloudflare Pages

## Разработка

Проект использует спецификации Kiro для структурированной разработки функций. Смотрите `.kiro/specs/` для деталей.

### Проверка сборки

```bash
cd web
npm run build
```

### Линтинг

```bash
cd web
npm run lint
```

## Лицензия

MIT
