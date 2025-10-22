# Web Store - Supabase Integration Guide

## ✅ Что уже настроено

### 1. Frontend подключен к Supabase
- `src/lib/supabaseClient.ts` настроен с вашими credentials
- URL: `https://fszhfeqijasvplmdihyj.supabase.co`
- Все компоненты используют Supabase для загрузки данных

### 2. Database Schema готова
- Файл: `supabase/schema.sql` содержит все таблицы:
  - `users` - пользователи
  - `apps` - приложения
  - `translations` - мультиязычность
  - `favorites` - избранное
  - `likes` - лайки
  - `comments` - комментарии
  - `dev_accounts` - аккаунты разработчиков
  - `analytics` - аналитика (просмотры, установки)

### 3. Helper Functions
- Файл: `supabase/functions.sql` содержит:
  - `increment_views(app_id)` - увеличение просмотров
  - `increment_installs(app_id)` - увеличение установок

### 4. Analytics интегрирована
- `src/hooks/useAnalytics.ts` - хук для логирования событий
- Компоненты логируют:
  - **Просмотры** - при открытии AppDetails
  - **Установки** - при клике "Скачать" в любом компоненте

### 5. Developer Dashboard
- Загружает приложения из Supabase
- Может добавлять новые приложения
- Показывает статистику (установки, рейтинг)

## 🚀 Что нужно сделать в Supabase Dashboard

### Шаг 1: Выполнить SQL миграции

Зайдите в Supabase Dashboard → SQL Editor и выполните:

1. **Создать таблицы**:
```sql
-- Скопируйте и выполните содержимое supabase/schema.sql
```

2. **Создать функции**:
```sql
-- Скопируйте и выполните содержимое supabase/functions.sql
```

### Шаг 2: Настроить RLS (Row Level Security)

Добавьте базовые политики для тестирования:

```sql
-- Разрешить всем читать приложения
CREATE POLICY "Allow public read access to apps"
ON public.apps FOR SELECT
USING (true);

-- Разрешить всем читать пользователей
CREATE POLICY "Allow public read access to users"
ON public.users FOR SELECT
USING (true);

-- Разрешить всем добавлять аналитику
CREATE POLICY "Allow public insert to analytics"
ON public.analytics FOR INSERT
WITH CHECK (true);
```

### Шаг 3: Добавить тестовые данные (опционально)

```sql
-- Добавить тестового пользователя
INSERT INTO public.users (email, display_name, avatar)
VALUES ('test@example.com', 'Test Developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test');

-- Добавить тестовое приложение
INSERT INTO public.apps (
  slug,
  developer_id,
  icon_url,
  screenshots,
  categories,
  rating,
  install_url,
  manifest_url,
  verified,
  views,
  installs
)
VALUES (
  'crypto-wallet-pro',
  (SELECT id FROM public.users LIMIT 1),
  'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=200&h=200&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1920&h=1080&fit=crop'],
  ARRAY['Crypto', 'Finance'],
  4.8,
  'https://example.com/install',
  'https://example.com/manifest.json',
  true,
  15420,
  8500
);
```

## 📊 Как проверить работу

1. **Главная страница** (`/`)
   - Должна показывать приложения из Supabase
   - Если таблица пустая - показывает mock данные
   - Debug панель показывает статус подключения

2. **Кабинет разработчика** (`/developer`)
   - Показывает все приложения из Supabase
   - Можно добавить новое приложение
   - Показывает статистику

3. **Детали приложения** (`/app/:id`)
   - Загружает данные из Supabase
   - Логирует просмотр в analytics
   - При клике "Установить" - логирует установку
## 📝 TODO (будущее)

- [ ] Добавить аутентификацию (auth.uid())
- [ ] Фильтровать приложения по developer_id в Dashboard
- [ ] Загрузка иконок и скриншотов в Storage
- [ ] Добавить переводы через таблицу translations
- [ ] Система комментариев и лайков
- [ ] Заявки на аккаунт разработчика

## 🛠️ Технические детали

### Структура проекта
```
src/
├── lib/
│   └── supabaseClient.ts      # Supabase клиент
├── hooks/
│   └── useAnalytics.ts        # Хук для аналитики
├── pages/
│   ├── Index.tsx              # Главная (загружает из Supabase)
│   ├── DeveloperDashboard.tsx # Кабинет разработчика
│   └── AppDetails.tsx         # Детали приложения
└── components/
    ├── AppCard.tsx            # Карточка приложения
    ├── AppListItem.tsx        # Элемент списка
    └── FeaturedCard.tsx       # Большая карточка

supabase/
├── schema.sql                 # Database schema
└── functions.sql              # Helper functions
```

### PWA Manifest
- Все иконки исправлены (192x192, 512x512)
- manifest.json обновлен
- Lighthouse PWA audit должен пройти без ошибок
