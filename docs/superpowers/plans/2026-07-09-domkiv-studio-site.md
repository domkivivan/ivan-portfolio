# DOMKIV® studio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline, выбрано из-за экономии токенов) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Одностраничный scroll-narrative сайт-визитка DOMKIV® studio, продающий услуги Ивана через уровень собственного исполнения (спека: `docs/superpowers/specs/2026-07-09-portfolio-design.md`).

**Architecture:** Статичный vanilla-сайт без сборки. Один index.html с секциями, CSS-токены дизайн-системы в одном файле, JS разбит по ответственности (шейдер-хиро, скролл-фильм, виджет, инициализация). Все анимации — GSAP ScrollTrigger поверх Lenis; WebGL только в хиро (Three.js), телефон в кейс-фильме — CSS 3D + реальные скриншоты (легче и надёжнее WebGL-модели). Хостинг GitHub Pages.

**Tech Stack:** HTML/CSS/JS (vanilla), Three.js, GSAP + ScrollTrigger, Lenis — всё через CDN. Скриншоты OASIS с прода. Верификация — Claude Preview (скриншот + консоль + интерактив), не юнит-тесты: правило проекта из `CLAUDE.md`.

---

## Карта файлов (Projects/ivan-portfolio/)

| Файл | Ответственность |
|---|---|
| `index.html` | Вся разметка секций, CDN-подключения, мета/OG |
| `css/main.css` | Дизайн-токены (цвет/шрифт/spacing), layout всех секций, reduced-motion |
| `js/main.js` | Инициализация: Lenis, device detection, диспетчер `initAll()` |
| `js/hero-shader.js` | Three.js шейдер-фон хиро + фолбэк без WebGL |
| `js/case-film.js` | ScrollTrigger-таймлайны кейс-фильма OASIS (телефон, экраны, факты) |
| `js/table-widget.js` | Интерактивная карта столов (standalone, без зависимостей от OASIS-кода) |
| `assets/oasis/*.png` | Реальные скриншоты прода (сняты в Task 1) |
| `.claude/launch.json` | Конфиг preview-сервера (`npx serve` или python http.server) |

Верстка/моушн-решения во время билда сверяются с чек-листом `ui-ux-pro-max` и словарём `animation-vocabulary` (Фаза 4 конвейера).

---

### Task 1: Ассеты и калибровка вкуса (Фазы 1–2 конвейера)

**Files:** Create: `assets/oasis/` (скриншоты), заметки-решения — прямо в этом плане (заполнить секцию Design Tokens ниже).

- [ ] **Step 1: Снять реальные скриншоты OASIS с прода.** Playwright MCP: открыть `https://oasislounge.org/promo.html` и гостевое приложение (`oasis-lounge-app.html` — открывается и вне Telegram, проверить), viewport 390×844, снять: главная, бронирование (карта столов), лояльность, чат, панель персонала (`/staff`, экран логина достаточно). Сохранить в `assets/oasis/`. Если какой-то экран требует Telegram-авторизации — снять то, что доступно, недостающее вырезать из скоупа фильма.
- [ ] **Step 2: Калибровка вкуса.** Прочитать скиллы `taste-design` и `high-end-visual-design` (тёмный премиум). Зафиксировать в секции Design Tokens: акцентный цвет (один, электрический — НЕ #c8a96e), пару шрифтов (display + гротеск, Google Fonts), масштаб типографики.
- [ ] **Step 3: 21st.dev — физический вызов до хендкода** (правило Фазы 2). ToolSearch `select:mcp__15fa54f4...search` → поиск "dark portfolio hero webgl", "pricing cards dark", "process timeline". Найденное — как референс паттернов; код адаптируется под vanilla (не React).
- [ ] **Step 4: Commit** — `git add assets/ docs/ && git commit -m "assets: real OASIS production screenshots + design tokens"`

**Design Tokens (зафиксировано 2026-07-09, Step 2):**
```
Vibe: Ethereal Glass (OLED-чёрный, glass-карты, hairline-бордеры white/10)
--bg: #050505            (OLED black, не #000)
--surface: #0d0d0f       (карты)
--text: #f4f4f2          (near-white)
--text-muted: #8a8a8e
--accent: #B4E645        (Volt Lime — один акцент, sat <80%)
--hairline: rgba(255,255,255,0.10)
Fonts: Clash Display (display, Fontshare) + Satoshi (body, Fontshare)
       + JetBrains Mono (метаданные/цифры, Google Fonts)
Радиусы: 2rem внешний / concentric внутренний (double-bezel)
Easing: cubic-bezier(0.32,0.72,0,1), длительности 0.6–1.2s
Запреты: Inter/Roboto, чистый чёрный, неон-глоу, 3 равные колонки,
  центрированный generic-hero, "Scroll to explore", эмодзи, AI-клише в копи
```

### Task 2: Скелет проекта

**Files:** Create: `index.html`, `css/main.css`, `js/main.js`, `.claude/launch.json`

- [ ] **Step 1: `index.html`** — семантические секции по спеке: `#entry`, `#hero`, `#manifesto`, `#case-oasis`, `#live-widget`, `#services`, `#process`, `#contact`; плавающая Telegram-кнопка `<a href="https://t.me/ivan_webdeveloper">`; CDN в конце body:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.14/dist/lenis.min.js"></script>
```
Полный EN-контент секций пишется сразу (хук, факты кейса из case-oasis-lounge.md, цены из спеки) — без lorem ipsum.
- [ ] **Step 2: `css/main.css`** — токены из Task 1, reset, layout секций, `@media (prefers-reduced-motion: reduce)` глушит все анимации.
- [ ] **Step 3: `js/main.js`**:
```js
const isMobile = matchMedia('(max-width: 768px)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasWebGL = (() => { try { const c = document.createElement('canvas');
  return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
// Lenis + GSAP ticker glue, затем initHero(), initCaseFilm(), initWidget()
```
- [ ] **Step 4: `.claude/launch.json`** — `npx serve -l 4173 .`; preview_start → preview_console_logs: ноль ошибок; preview_snapshot: все секции на месте.
- [ ] **Step 5: Commit** — `feat: site skeleton with full EN copy`

### Task 3: Hero — шейдер + кинетическая типографика + вход

**Files:** Create: `js/hero-shader.js`; Modify: `css/main.css`, `index.html`

- [ ] **Step 1:** Three.js fullscreen-quad с кастомным fragment-шейдером (мягкий движущийся градиент-туман с зерном в тоне акцента; за основу — паттерн из Radiant/примеров, код свой). Драйвится `requestAnimationFrame`, на `!hasWebGL || reducedMotion` — статичный CSS-градиент, DOM тот же.
- [ ] **Step 2:** Заставка `#entry`: логотип DOMKIV® → маска-раскрытие в хиро за ~1 с (GSAP timeline, играет один раз).
- [ ] **Step 3:** Кинетический заголовок-хук: пословное появление + лёгкий скролл-параллакс.
- [ ] **Step 4:** Проверка: preview_screenshot (десктоп) + консоль чистая + FPS визуально плавный. **Step 5: Commit** `feat: shader hero with entry sequence`

### Task 4: Манифест + кейс-фильм OASIS

**Files:** Create: `js/case-film.js`; Modify: `index.html`, `css/main.css`

- [ ] **Step 1:** `#manifesto`: «This site is the portfolio.» — построчный reveal по скроллу (ScrollTrigger scrub).
- [ ] **Step 2:** Телефон: CSS 3D device-frame (`perspective` + `rotateY/X` по скроллу), внутри `<img>`-стек скриншотов из Task 1; pinned-секция, экраны сменяются кроссфейдом по прогрессу скролла.
- [ ] **Step 3:** Факты кейса (50+ API endpoints, realtime Socket.IO, 5-tier loyalty, staff panel, production) появляются синхронно с соответствующими экранами; счётчики — GSAP.
- [ ] **Step 4:** Финал фильма: ссылка «Open the live product → oasislounge.org» + скрытый (`hidden`) блок цитаты владельца с комментарием `<!-- unhide after owner approves quote -->`.
- [ ] **Step 5:** Проверка pinned-скролла в preview (прокрутить eval'ом, скриншоты в 3 точках прогресса). **Step 6: Commit** `feat: OASIS case film with scroll-driven phone`

### Task 5: Живой виджет карты столов

**Files:** Create: `js/table-widget.js`; Modify: `index.html`, `css/main.css`

- [ ] **Step 1:** Standalone-виджет: SVG/див-сетка ~10 столов (Main/VIP/Bar зоны как в OASIS), статусы free/busy/selected, клик по свободному → selected + мини-подтверждение «Table T3 · Friday 21:00» (фейковые данные, локальный state, без сети). Подпись: «A working slice of the real booking UI».
- [ ] **Step 2:** preview_click по столу → snapshot подтверждает смену состояния. **Step 3: Commit** `feat: interactive table-map widget`

### Task 6: Услуги, процесс, финальный оффер

**Files:** Modify: `index.html`, `css/main.css`, `js/case-film.js` (общие reveal-хелперы)

- [ ] **Step 1:** `#services`: 4 карточки (Landing from €600 · 2–5 days / Multi-page from €1,200 · 1–2 wks / Telegram Mini App from €950 · 1–2 wks / Web app from €2,400 · 3+ wks), hover-моушн (tilt/glow), стагер-появление.
- [ ] **Step 2:** `#process`: 3 шага (Niche research → Concept → Turnkey production) — горизонтальная линия-прогресс по скроллу.
- [ ] **Step 3:** `#contact`: оффер «Tell me about your business — within 24h I'll reply with a concrete idea. Free.» + Telegram CTA + `mailto:domkivivan@gmail.com`.
- [ ] **Step 4:** Проверка скриншотами. **Step 5: Commit** `feat: services, process, final offer`

### Task 7: Мобайл и фолбэки

**Files:** Modify: все js/css

- [ ] **Step 1:** `isMobile`: шейдер — упрощённый (меньше октав/разрешение рендера 0.5×) или статичный градиент; pinned-фильм — вертикальная версия без pin, экраны как обычный стек с fade.
- [ ] **Step 2:** preview_resize mobile (375×812) → скриншот + snapshot: контент полный, ничего не обрезано, консоль чистая. Тач: Telegram-кнопка ≥44px.
- [ ] **Step 3:** `reducedMotion`: всё статично, контент доступен. Проверить preview_resize + emulation. **Step 4: Commit** `feat: mobile scenes and motion/webgl fallbacks`

### Task 8: Фаза 6 — adversarial-проверка и полировка

- [ ] **Step 1:** Открыть живьём 2–3 текущих Awwwards SOTD (`awwwards.com/websites/portfolio/`) через WebFetch/Playwright, честно сравнить: черновик или почти-финал? Найденные слабости — исправить до показа.
- [ ] **Step 2:** Скилл `impeccable` — код-ревью; `animation-vocabulary` — консистентность моушна (единые easing/длительности).
- [ ] **Step 3:** Вес страницы: суммарно изображения ≤ 1.5 МБ (сжать до WebP), первый рендер без блокировки CDN-скриптами (`defer`).
- [ ] **Step 4:** Финальные скриншоты (десктоп+мобайл) — показать Ивану. **Step 5: Commit** `polish: phase-6 pass`

### Task 9: Деплой

- [ ] **Step 1:** Проверить доступность `domkiv.studio` / `domkiv.dev` (RDAP/whois через WebFetch) — сообщить Ивану цену и где купить, сам не покупаю.
- [ ] **Step 2:** `git push origin main`; включить GitHub Pages (gh CLI: `gh api repos/{owner}/{repo}/pages -X POST -f source[branch]=main -f source[path]=/` или сказать Ивану включить в Settings, если нет прав).
- [ ] **Step 3:** Открыть опубликованный URL, финальная проверка живьём. Обновить вольт: HOME.md (ссылка на живой сайт), DECISIONS. **Step 4: Commit + готово.**

---

## Self-review
- Покрытие спеки: секции 1–8 → Tasks 3–6; мобайл/фолбэки → Task 7; проверка Фазы 6 → Task 8; хостинг/домен → Task 9; ассеты/токены/21st.dev → Task 1. Цитата владельца — скрытый слот (Task 4 Step 4). Пробелов нет.
- Плейсхолдеры: токены в Task 1 помечены как заполняемые в Step 2 самим исполнителем — это решение задачи, не дыра. Хук-текст пишется в Task 2 Step 1 (без lorem).
- Консистентность: `initHero/initCaseFilm/initWidget` объявлены в main.js и реализуются в соответствующих файлах Tasks 3–5.
