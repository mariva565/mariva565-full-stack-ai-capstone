-- ============================================================
-- Community Board — Demo Seed Data (150 posts, ~300 comments, ~400 likes)
-- Paste in Neon Console → SQL Editor → Run
-- Uses existing users by email — safe to re-run (ON CONFLICT DO NOTHING)
-- ============================================================

DO $$
DECLARE
  admin_id   INTEGER;
  user_id    INTEGER;
  course1_id INTEGER;
  course2_id INTEGER;
  course3_id INTEGER;
  i          INTEGER;
  post_id    INTEGER;
  post_ids   INTEGER[];
  types      TEXT[] := ARRAY['discussion','question','resource','article'];
  q_statuses TEXT[] := ARRAY['open','open','answered','closed'];
  post_titles TEXT[] := ARRAY[
    'Как да подходим към алгоритмите?',
    'Препоръчвате ли VS Code или WebStorm?',
    'Полезни ресурси за React hooks',
    'SQL vs NoSQL — кога да изберем кое?',
    'Защо async/await е по-добро от callbacks?',
    'Git branching стратегии за екипна работа',
    'Как да се подготвим за технически интервюта?',
    'TypeScript vs JavaScript — мненията ви?',
    'Docker за начинаещи — от къде да започна?',
    'Как работи garbage collection в JS?',
    'REST vs GraphQL — плюсове и минуси',
    'Какви са добрите практики за CSS архитектура?',
    'Защо трябва да учим алгоритми?',
    'Препоръки за книги по Clean Code',
    'Как да тествам React компоненти?',
    'Next.js Server Components — обяснение',
    'Tailwind CSS — струва ли си?',
    'PostgreSQL индекси — как работят?',
    'JWT vs Session cookies — сигурност',
    'Как да оптимизираме SQL заявки?',
    'Микросервиси vs монолит',
    'CI/CD pipeline за малки проекти',
    'Regex — ресурси за учене',
    'WebSockets vs Server-Sent Events',
    'Как да четем чужд код по-бързо?',
    'Design patterns, които всеки трябва да знае',
    'Linux команди за разработчици',
    'Как да управляваме state в React?',
    'API rate limiting — стратегии',
    'Accessibility (a11y) — защо е важно?',
    'Как да пишем добра документация?',
    'Monorepo — плюсове и минуси',
    'Drizzle ORM vs Prisma',
    'Vercel vs Netlify vs Railway',
    'Как работи DNS?',
    'CORS грешки — обяснение и fix',
    'HTTP/2 vs HTTP/3',
    'Caching стратегии за web приложения',
    'Как да защитим API-то си?',
    'Event Loop в Node.js — визуално обяснение',
    'Защо функционалното програмиране е полезно?',
    'React Query vs SWR vs Zustand',
    'Как да изградим добро портфолио?',
    'Open source проекти за начинаещи',
    'Debugging техники, които ми спасиха живота',
    'Как да четем error stack traces?',
    'Naming conventions — унификация в екипа',
    'Code review — как да го правим правилно?',
    'Техническият дълг — как да го управляваме?',
    'Как да балансираме скорост и качество?',
    '10 VS Code extension-а, без които не мога',
    'Как да напишем добър README?',
    'GitHub Actions — основен workflow',
    'Как работи HTTPS зад кулисите?',
    'Web vitals и как да ги подобрим',
    'Lighthouse score — практически tips',
    'Lazy loading в React',
    'Infinite scroll vs пагинация — кога кое?',
    'Как да работим с дати в JS?',
    'Timezone проблеми — как да ги избегнем?',
    'Internationalization (i18n) в Next.js',
    'Dark mode имплементация — best practices',
    'CSS Grid vs Flexbox',
    'Responsive design без media queries?',
    'Container queries — бъдещето на responsive?',
    'Как да анимираме с Framer Motion?',
    'SVG анимации — ресурси',
    'Three.js за начинаещи',
    'WebGL — кога ни трябва?',
    'PWA — прогресивни уеб приложения',
    'Service Workers — как работят?',
    'IndexedDB vs localStorage vs sessionStorage',
    'Как да тестваме E2E с Playwright?',
    'Unit testing — моят workflow',
    'TDD — практически опит',
    'Как да mock-ваме API calls в тестове?',
    'Performance profiling в Chrome DevTools',
    'Memory leaks в React — как да ги намерим?',
    'Re-renders в React — оптимизация',
    'useMemo и useCallback — кога да ги ползваме?',
    'Virtual DOM — как работи?',
    'Reconciliation в React',
    'Server-side rendering vs Static generation',
    'ISR (Incremental Static Regeneration) — обяснение',
    'Edge functions — кога да ги ползваме?',
    'Middleware в Next.js',
    'Route handlers vs Server Actions',
    'Zod за валидация — мненията ви?',
    'Error boundaries в React',
    'Suspense и streaming в Next.js',
    'Паралелни данни в Server Components',
    'ORM или raw SQL — вашето мнение?',
    'Database migrations — best practices',
    'Connection pooling — защо е важно?',
    'Redis за кеширане — основи',
    'Message queues — RabbitMQ vs Kafka',
    'Микро-frontend архитектура',
    'Module Federation в Webpack',
    'Tree shaking — как работи?',
    'Bundle size оптимизация',
    'Code splitting стратегии',
    'Как да изберем технологичен стек?',
    'Soft skills за разработчици',
    'Как да водим технически разговор?',
    'Remote work tips за програмисти',
    'Как да избегнем burnout?',
    'Learning in public — ползи',
    'Как да намерим ментор?',
    'Pair programming — опитът ми',
    'Mob programming — пробвали ли сте?',
    'Agile vs Waterfall в реални проекти',
    'Scrum ceremonies — кои са полезни?',
    'Как да оценяваме задачи (story points)?',
    'Technical roadmap — как да го правим?',
    'Architecture Decision Records (ADR)',
    'Как да правим постмортем анализ?',
    'Observability vs Monitoring',
    'Logging best practices',
    'Distributed tracing — основи',
    'Feature flags — стратегии',
    'A/B тестване за разработчици',
    'Canary deployments',
    'Blue-green deployments',
    'Infrastructure as Code — Terraform основи',
    'Kubernetes за разработчици',
    'Serverless — кога да го ползваме?',
    'Cost optimization в cloud',
    'Security по принципа на least privilege',
    'OWASP Top 10 — практически tips',
    'SQL injection — примери и защита',
    'XSS — как да се предпазим?',
    'CSRF tokens — как работят?',
    'Secrets management в production',
    'Environment variables — best practices',
    'Как да правим code reviews като senior?',
    'Mentoring junior разработчици',
    'System design интервюта — как да се подготвим?',
    'Behavioral интервюта — STAR метод',
    'Negotiating salary — tips',
    'Open source contribution — как да започнем?',
    'Блогване за разработчици — струва ли си?',
    'Конференции и meetup-и — worth it?',
    'Certifications — AWS, Google Cloud, Azure',
    'Freelancing vs full-time employment',
    'Startup vs корпорация — плюсове и минуси',
    'Как да изградим side project?',
    'Product thinking за разработчици',
    'Data-driven development',
    'Как да работим с дизайнери?',
    'Figma за разработчици — основи'
  ];
  post_contents TEXT[] := ARRAY[
    'Имам затруднения с разбирането на рекурсия. Някой може ли да препоръча ресурси или подход за практика?',
    'Използвам VS Code от 2 години, но колегите ми препоръчват WebStorm. Струва ли си смяната? Какъв е вашият опит?',
    'Събрал съм списък с ресурси: официалната документация, Kent C. Dodds блог, и Epic React курса. Какво ползвате вие?',
    'Работя по проект и се чудя дали да избера PostgreSQL или MongoDB. Данните са релационни, но не съм сигурен.',
    'Callbacks водят до callback hell, Promise-ите са по-добри, но async/await прави кода линеен и лесен за четене.',
    'Feature branches, trunk-based development или GitFlow? Кое работи добре при малки екипи от 3-5 души?',
    'Имам интервю следващата седмица. Какви алгоритмични задачи очаквате? Leetcode ли, или нещо друго?',
    'Работил съм само с JavaScript. Трябва ли да науча TypeScript за следващата работа? Колко трудно е преминаването?',
    'Опитвам се да контейнеризирам приложение. Docker Compose или само Docker? От где да почна с документацията?',
    'V8 engine-ът автоматично освобождава памет. Но как работи mark-and-sweep алгоритъмът конкретно?',
    'REST е прост и познат. GraphQL дава flexibility. За малко API REST е fine, за complex data fetching — GraphQL.',
    'BEM, SMACSS, или utility-first с Tailwind? Работил съм с всички. Ще споделя опита си.',
    'Много хора питат това. Отговорът е — не заради интервютата, а заради мисленето което изграждат.',
    'Clean Code на Uncle Bob е задължителна. The Pragmatic Programmer също. Кои сте чели?',
    'React Testing Library е стандартът. Vitest е бърз. Как тествате вие?',
    'Server Components се изпълняват само на сървъра. Нямат state. Могат да четат директно от БД. Game changer.',
    'Използвам го 6 месеца. Utility-first изглежда странно отначало, но след седмица не можеш без него.',
    'B-tree индексите са стандартни. BRIN за времеви данни. GiST за геометрия. Кога да ползваме partial indexes?',
    'JWT е stateless но не може да се инвалидира лесно. Session cookies са stateful. Зависи от use case-а.',
    'EXPLAIN ANALYZE е приятел. N+1 queries убиват производителността. Eager loading спасява.',
    'Монолитът е по-лесен за старт. Микросервисите дават scale. Но добавят operational complexity.',
    'GitHub Actions е безплатно за public repos. Прост YAML, интеграция с marketplace. Препоръчвам.',
    'regex101.com е незаменим инструмент. Regexr.com за визуализация. Книгата Mastering Regular Expressions.',
    'WebSockets са двупосочни — подходящи за chat. SSE са еднопосочни — подходящи за notifications.',
    'Четем от общото към детайлното. README → основни модули → конкретна функция. Naming е ключово.',
    'Singleton, Observer, Factory, Strategy, Decorator. Кои ползвате най-често в реален код?',
    'grep, find, sed, awk, curl, ssh, tmux. Кои 5 команди ползвате ежедневно?',
    'Context API е вграден. Redux е мощен. Zustand е лек. Jotai е atomic. Recoil е от Facebook.',
    'Token bucket и leaky bucket алгоритми. Redis за distributed rate limiting. Важно за production API.',
    'Screen readers, keyboard navigation, ARIA labels. 15% от хората имат увреждания. Не ги изключвайте.',
    'Docstring за всяка публична функция. README с примери. ADR за архитектурни решения.',
    'Spoменавам Turborepo и Nx. Code sharing е лесен. Build times могат да са дълги.',
    'Drizzle е type-safe и близо до SQL. Prisma е по-абстрактен. Двата са добри — зависи от предпочитанията.',
    'Vercel е идеален за Next.js. Netlify е flexible. Railway е добър за fullstack с БД.',
    'DNS resolver → root servers → TLD servers → authoritative servers. Кешираното TTL ускорява.',
    'Access-Control-Allow-Origin хедърът. Preflight OPTIONS заявки. Как да конфигурирате правилно.',
    'HTTP/2 е multiplexing. HTTP/3 е върху QUIC (UDP). Намалява latency при packet loss.',
    'Browser cache, CDN cache, server-side cache (Redis), database query cache. Всеки слой има роля.',
    'Input validation, parameterized queries, HTTPS, auth middleware, rate limiting. Основите.',
    'Call stack, Web APIs, Callback Queue, Event Loop. Визуализацията на Philip Roberts е класика.',
    'Immutability, pure functions, higher-order functions. По-лесно тестване, предсказуемост.',
    'React Query за server state. Zustand или Jotai за client state. Не смесвайте двете.',
    'Pinned repos в GitHub. Readme проекти с описание. Live demo линк. Quantify impact-а.',
    'First Good Issue label в GitHub. Документацията е добро начало. Малки PR-и първо.',
    'console.log стратегически, breakpoints в DevTools, binary search на проблема.',
    'Прочетете съобщението, файла и реда. Google точния error. Stack Overflow → GitHub issues.',
    'camelCase за JS, snake_case за БД, PascalCase за компоненти. Консистентността е ключова.',
    'Specific, kind, actionable feedback. Питайте въпроси вместо да давате заповеди.',
    'Идентифицирайте го, измерете го, рефакторирайте постепенно. Boy Scout Rule.',
    'Ship fast, iterate. Но technical debt се натрупва. Намерете баланс с tech debt budget.',
    'GitLens, Prettier, ESLint, Thunder Client, Todo Tree, Error Lens, GitHub Copilot...',
    'Описание на проекта, как да го стартирате, как да допринесете, лиценз. Кратко и ясно.',
    'Push on main за малки проекти. PR workflow за екипи. Защитени branches за production.',
    'TLS handshake, certificates, symmetric encryption. Без HTTPS данните са plaintext.',
    'LCP, FID, CLS — Core Web Vitals. PageSpeed Insights показва конкретни препоръки.',
    'Минимизирайте render-blocking ресурси. Оптимизирайте images. Lazy load всичко под fold.',
    'React.lazy() + Suspense за компоненти. next/dynamic за Next.js. Code splitting автоматично.',
    'Infinite scroll за content consumption. Пагинация за search results и таблици.',
    'date-fns или dayjs вместо moment.js. Работете в UTC, показвайте в local timezone.',
    'Съхранявайте в UTC, конвертирайте при display. Intl API е вграден в браузъра.',
    'next-intl или next-i18next. Ключове вместо hardcoded strings. Плурализация е сложна.',
    'CSS media query (prefers-color-scheme) + localStorage за persistence. next-themes за Next.js.',
    'Grid за 2D layouts. Flexbox за 1D. Не ги противопоставяйте — ползвайте и двете.',
    'clamp(), min(), max() функциите. Container queries за component-level responsive design.',
    'Container queries (@container) позволяват компонент да реагира на собствения си контейнер.',
    'motion.div, AnimatePresence, layout animations. API-ят е интуитивен и мощен.',
    'GSAP за complex animations. CSS animations за прости. Lottie за After Effects exports.',
    'three.js + React Three Fiber за React. Много примери в документацията.',
    'Само когато наистина се нуждаете от GPU acceleration. За повечето проекти не е нужно.',
    'Offline support, push notifications, installable. Workbox за service worker management.',
    'Intercept network requests, cache responses, background sync. Мощно но сложно.',
    'IndexedDB за структурирани данни. localStorage за прости key-value. sessionStorage за временни.',
    'Playwright е cross-browser. Cypress е популярен. E2E тестовете са бавни — пишете ги за critical paths.',
    'Vitest е бърз. Jest е зрял. RTL за React. Покривайте business logic, не implementation details.',
    'Пишете теста първо, после кода. Ориентира ви да мислите за интерфейса, не имплементацията.',
    'msw (Mock Service Worker) е стандартът. Intercept-ва заявки на мрежово ниво.',
    'Performance tab в Chrome DevTools. Flame charts показват времето по функции.',
    'useEffect cleanup функции. Event listeners. Setintervals. Subscriptions. Винаги cleanupвайте.',
    'React.memo, useMemo, useCallback. Но профилирайте първо — premature optimization е зло.',
    'useMemo за expensive calculations. useCallback за stable function references в deps arrays.',
    'Виртуален DOM е JS обект. Diffing алгоритъмът сравнява стария и новия. Минимални DOM updates.',
    'Fiber архитектурата позволява прекъсване на render работата. Приоритетна queue.',
    'SSR за SEO и first load. SSG за static content. ISR за best of both worlds.',
    'Страниците се rebuild-ват в background след revalidation period. Без full rebuild.',
    'Vercel Edge Network. По-близо до потребителя. По-малко latency. Ограничени Node.js APIs.',
    'Изпълнява се преди всеки request. Auth checks, redirects, A/B testing, i18n.',
    'Route Handlers за API. Server Actions за form submissions и mutations. По-малко boilerplate.',
    'Runtime validation. TypeScript е compile-time само. Зод валидира и на runtime.',
    'Хващат JavaScript грешки в render tree. Показват fallback UI вместо да crash-ват.',
    'Streaming позволява частично изпращане на HTML. Потребителят вижда съдържание по-бързо.',
    'Promise.all() за паралелни заявки. Не ги правете последователни ако не зависят една от друга.',
    'Drizzle е по-close to the metal. Prisma има по-добър DX. Зависи от нуждите ви.',
    'Версионирани migration файлове. Никога не редактирайте стари migrations. Rollback стратегия.',
    'PgBouncer за PostgreSQL. Без connection pooling connection-ите се изчерпват бързо.',
    'Redis Strings за session. Sorted Sets за leaderboards. Lists за queues. Hashes за objects.',
    'RabbitMQ е AMQP, по-лесен. Kafka е за high-throughput event streaming. Различни use cases.',
    'Всеки frontend е отделен deployment. Проблеми с споделено state и consistent UI.',
    'Webpack 5 feature. Споделяне на модули между отделни приложения runtime.',
    'Webpack анализира import/export. Маркира неизползван код. Terser го премахва.',
    'Анализирайте bundle с webpack-bundle-analyzer. Lazy load тежки библиотеки.',
    'Dynamic imports. Route-based splitting. Component-based splitting. Vendor chunks.',
    'Нуждите на проекта, опита на екипа, екосистемата, community support, longevity.',
    'Комуникация, документация, търпение, любопитство. Техническите умения не са достатъчни.',
    'Обяснете проблема ясно. Предложете решения. Слушайте feedback. Задавайте въпроси.',
    'Dedicated workspace, time boxing, over-communication с екипа, async-first mentality.',
    'Поставяйте граници. Правете почивки. Хобита извън кода. Физическа активност.',
    'Tweeting за прогреса, блог постове, GitHub activity. Привлича opportunities.',
    'Twitter/X, LinkedIn, конференции, локални meetup-и. Менторът е хора, не само курсове.',
    'Code review-то е learning opportunity. Задавайте въпроси, не давайте само команди.',
    'Mob programming е цял екип на един компютър. Ротация на driver-а. Sounds weird, works great.',
    'Agile е mindset, Scrum е framework. Waterfall работи за fixed scope проекти.',
    'Daily standup, Sprint planning, Retrospective. Skip demo ако нямате stakeholders.',
    'Fibonacci sequence (1,2,3,5,8). Relative sizing. Planning poker за консенсус.',
    'Какво правим, защо, кога. Quarterly roadmap е добър horizon. Monthly е твърде кратко.',
    'ADR записва архитектурни решения: context, decision, consequences. Markdown файлове в репото.',
    'Blame-less postmortem. Timeline на инцидента. Root cause analysis. Action items.',
    'Observability = logs + metrics + traces. Monitoring е подмножество.',
    'Structured logging (JSON). Log levels (ERROR, WARN, INFO, DEBUG). Correlation IDs.',
    'Jaeger или Zipkin. Trace ID следи заявката през всички сервизи.',
    'Feature flags позволяват deploy без release. Gradual rollout. Kill switch за проблеми.',
    'Различни версии на UI за различни потребители. Статистически значими резултати.',
    'Постепенно пускате новата версия на малък % трафик. Rollback е лесен.',
    'Две идентични среди. Превключвате трафика между тях. Zero-downtime deployments.',
    'Terraform за cloud infrastructure. HCL синтаксис. State management е важен.',
    'Pods, Services, Deployments, Ingress. kubectl е основният инструмент. Steep learning curve.',
    'FaaS: функции без сървъри. AWS Lambda, Vercel Functions. Cold starts са проблем.',
    'Reserved instances вместо on-demand. Spot instances за batch jobs. Right-sizing.',
    'Принципът на least privilege. Никога root в production. IAM roles вместо keys.',
    'Injection, Broken Auth, Sensitive Data, XXE, Broken Access Control — топ заплахи.',
    'Parameterized queries (prepared statements). ORMs помагат. Никога string concatenation.',
    'Content Security Policy headers. sanitize user input. HttpOnly cookies.',
    'SameSite cookie attribute. Double submit cookie pattern. Синхронизационен token.',
    'HashiCorp Vault. AWS Secrets Manager. Никога в git. Environment variables са ok за dev.',
    '.env файлове за dev. CI/CD secrets за pipeline. Secret rotation за production.',
    'Задавайте въпроси вместо да давате команди. Обяснявайте защо, не само какво.',
    'Patience, clear explanations, give space to make mistakes, celebrate small wins.',
    'Разбиране на изисквания, оценка на capacity, избор на технологии, trade-offs.',
    'Situation, Task, Action, Result. Конкретни примери, не generic отговори.',
    'Изследвайте market rate. Имайте number. Практикувайте разговора. Counter-offer е нормален.',
    'Find good first issues. Fork → clone → branch → change → PR. Четете CONTRIBUTING.md.',
    'Изгражда личен бранд. Помага да разберете теми по-добре. Привлича opportunities.',
    'Networking, learning, inspiration. Записвайте се за local meetup на meetup.com.',
    'AWS Solutions Architect е признат. Google Cloud е нарастващ. Зависи от работодателя.',
    'Freelancing дава свобода но нестабилност. Full-time дава стабилност но по-малко контрол.',
    'Стартъпите са бързи, рискови, учите много. Корпорациите са стабилни, по-бавни процеси.',
    'Решете реален проблем. Започнете малко. Ship early. Итерирайте базирано на feedback.',
    'Разбирайте защо потребителите правят нещо, не само какво. Jobs-to-be-done framework.',
    'Metrics-driven decisions. Измервайте преди и след промени. Vanity metrics vs actionable.',
    'Дизайнерите мислят visual, разработчиците мислят technical. Изградете общ речник.',
    'Inspect tool за стилове. Zeplin или Figma Dev Mode за спецификации. Задавайте въпроси рано.'
  ];

BEGIN
  -- Get user IDs
  SELECT id INTO admin_id FROM users WHERE email = 'admin@studyhub.dev' LIMIT 1;
  SELECT id INTO user_id  FROM users WHERE email = 'user@studyhub.dev'  LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE NOTICE 'Admin user not found — check email admin@studyhub.dev';
    RETURN;
  END IF;

  -- Get course IDs (first 3 courses available)
  SELECT id INTO course1_id FROM courses ORDER BY id LIMIT 1 OFFSET 0;
  SELECT id INTO course2_id FROM courses ORDER BY id LIMIT 1 OFFSET 1;
  SELECT id INTO course3_id FROM courses ORDER BY id LIMIT 1 OFFSET 2;

  -- ── Insert 150 posts ──────────────────────────────────────
  FOR i IN 1..150 LOOP
    DECLARE
      t          TEXT := types[1 + mod(i - 1, 4)];
      author     INTEGER := CASE WHEN mod(i, 3) = 0 THEN admin_id ELSE COALESCE(user_id, admin_id) END;
      c_id       INTEGER := CASE
                              WHEN mod(i, 5) = 0 THEN course1_id
                              WHEN mod(i, 5) = 1 THEN course2_id
                              WHEN mod(i, 5) = 2 THEN course3_id
                              ELSE NULL
                            END;
      q_status   TEXT    := CASE WHEN t = 'question' THEN q_statuses[1 + mod(i, 4)] ELSE NULL END;
      pinned     BOOLEAN := i <= 3;
      created    TIMESTAMP := NOW() - (i * interval '2 hours');
      title_idx  INTEGER := 1 + mod(i - 1, array_length(post_titles, 1));
      content_idx INTEGER := 1 + mod(i - 1, array_length(post_contents, 1));
    BEGIN
      INSERT INTO posts (author_id, title, content, post_type, status, course_id, is_pinned, question_status, created_at, updated_at)
      VALUES (
        author,
        post_titles[title_idx] || CASE WHEN i > array_length(post_titles, 1) THEN ' #' || i ELSE '' END,
        post_contents[content_idx],
        t,
        'approved',
        c_id,
        pinned,
        q_status,
        created,
        created
      )
      ON CONFLICT DO NOTHING
      RETURNING id INTO post_id;

      IF post_id IS NOT NULL THEN
        post_ids := array_append(post_ids, post_id);
      END IF;
    END;
  END LOOP;

  RAISE NOTICE 'Inserted % posts', array_length(post_ids, 1);

  -- ── Insert comments (~2-3 per post) ──────────────────────
  DECLARE
    comment_texts TEXT[] := ARRAY[
      'Много полезно, благодаря! Точно това търсех.',
      'Имам същия въпрос. Следя за отговори.',
      'Съгласен съм напълно. Използвам точно този подход.',
      'Интересна гледна точка. Не бях мислил така.',
      'Може да добавиш и линк към официалната документация?',
      'Пробвах това и работи перфектно!',
      'Има ли алтернатива за по-стари браузъри?',
      'Благодаря, спести ми часове дебъгване!',
      'Това е gold! Bookmarked.',
      'Малко добавка: не забравяйте за edge cases.',
      'При мен не работи на Safari. Някой имал ли е същия проблем?',
      'Страхотно обяснение! Накрая го разбрах.',
      'Препоръчвам и да прочетете официалния RFC.',
      'Изпробвах 3 различни подхода и този е най-добрият.',
      'Внимавайте с performance-а при голям обем данни.',
      '+1. Прекарах седмица по тази тема и стигнах до същия извод.',
      'Може ли да дадеш пример с код?',
      'Много важна тема. Трябва да се добави в учебния план.',
      'Използвам това от 2 години — потвърждавам, работи!',
      'Има ли разлика при TypeScript проекти?',
      'Точно навреме попаднах на тази публикация!'
    ];
    p_id INTEGER;
    num_comments INTEGER;
    comment_author INTEGER;
  BEGIN
    FOREACH p_id IN ARRAY COALESCE(post_ids, ARRAY[]::INTEGER[]) LOOP
      num_comments := 1 + mod(p_id, 4); -- 1 to 4 comments per post
      FOR j IN 1..num_comments LOOP
        comment_author := CASE WHEN mod(j, 2) = 0 THEN admin_id ELSE COALESCE(user_id, admin_id) END;
        INSERT INTO comments (post_id, author_id, content, created_at)
        VALUES (
          p_id,
          comment_author,
          comment_texts[1 + mod(p_id * j, array_length(comment_texts, 1))],
          NOW() - ((150 - p_id) * interval '1 hour') + (j * interval '15 minutes')
        );
      END LOOP;
    END LOOP;
  END;

  -- ── Insert likes (~40% of posts liked by each user) ──────
  DECLARE
    p_id INTEGER;
  BEGIN
    FOREACH p_id IN ARRAY COALESCE(post_ids, ARRAY[]::INTEGER[]) LOOP
      -- admin likes ~60% of posts
      IF mod(p_id, 5) != 0 THEN
        INSERT INTO post_likes (post_id, user_id, created_at)
        VALUES (p_id, admin_id, NOW() - (mod(p_id, 48) * interval '1 hour'))
        ON CONFLICT DO NOTHING;
      END IF;
      -- user likes ~40% of posts
      IF user_id IS NOT NULL AND mod(p_id, 3) = 0 THEN
        INSERT INTO post_likes (post_id, user_id, created_at)
        VALUES (p_id, user_id, NOW() - (mod(p_id, 36) * interval '1 hour'))
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END;

  -- ── Insert bookmarks (~20% of posts) ─────────────────────
  DECLARE
    p_id INTEGER;
  BEGIN
    FOREACH p_id IN ARRAY COALESCE(post_ids, ARRAY[]::INTEGER[]) LOOP
      IF mod(p_id, 5) = 0 AND user_id IS NOT NULL THEN
        INSERT INTO post_bookmarks (post_id, user_id, created_at)
        VALUES (p_id, user_id, NOW() - (mod(p_id, 24) * interval '1 hour'))
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END;

  RAISE NOTICE 'Seed complete!';
END;
$$;
