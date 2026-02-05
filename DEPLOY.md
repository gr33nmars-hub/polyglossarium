# Деплой на Cloudflare Pages

## Автоматический деплой через GitHub Actions

### Настройка секретов в GitHub

1. Перейдите в настройки репозитория: `Settings` → `Secrets and variables` → `Actions`

2. Добавьте следующие секреты:

   **CLOUDFLARE_API_TOKEN**
   - Перейдите в [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Нажмите "Create Token"
   - Используйте шаблон "Edit Cloudflare Workers"
   - Или создайте кастомный токен с правами:
     - Account - Cloudflare Pages - Edit
   - Скопируйте токен и добавьте в GitHub Secrets

   **CLOUDFLARE_ACCOUNT_ID**
   - Откройте [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Выберите ваш аккаунт
   - Account ID находится в правой колонке на главной странице
   - Скопируйте и добавьте в GitHub Secrets

3. После добавления секретов, каждый push в ветку `main` будет автоматически деплоить проект

## Ручной деплой через Cloudflare Dashboard

1. Перейдите в [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Нажмите "Create a project"
3. Подключите ваш GitHub репозиторий
4. Настройте билд:
   - **Build command**: `cd web && npm install && npm run build`
   - **Build output directory**: `web/dist`
   - **Root directory**: `/`
5. Нажмите "Save and Deploy"

## Ручной деплой через Wrangler CLI

```bash
# Установите Wrangler
npm install -g wrangler

# Авторизуйтесь
wrangler login

# Соберите проект
cd web
npm install
npm run build

# Деплой
wrangler pages deploy dist --project-name=polyglossarium
```

## Проверка деплоя

После успешного деплоя ваш сайт будет доступен по адресу:
`https://polyglossarium.pages.dev`

Вы также можете настроить кастомный домен в настройках Cloudflare Pages.
