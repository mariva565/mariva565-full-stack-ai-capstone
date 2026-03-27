# Security Playbook (BG) - StudyHub

## 1) Защо този документ
Това е вътрешен mini-course за екипа: как да мислим за сигурността, какво прилагаме в StudyHub и как да го поддържаме.

Свързани practically-first материали:
- `docs/security-learning-master-plan.md`
- `docs/security-chat-index.md`
- `docs/security-chat-snapshot.md`
- `docs/lesson-1-guided-security-review.md`
- `docs/lesson-1-task-tracker.md`
- `docs/lesson-2-guided-security-review.md`
- `docs/lesson-2-task-tracker.md`
- `docs/lesson-2-anti-abuse-runbook.md`
- `docs/security-hardening-log-2026-03-18.md`
- `docs/production-security-release-checklist.md`
- `docs/security-env-secrets-inventory.md`
- `docs/lesson-5-live-verification-runbook.md`
- `docs/lesson-6-guided-security-review.md`
- `docs/lesson-6-task-tracker.md`
- `docs/security-observability-baseline.md`
- `docs/security-alerting-runbook.md`
- `docs/dependency-security-audit-cadence.md`
- `docs/dependency-review-checklist.md`
- `docs/admin-2fa-rollout-strategy.md`
- `docs/admin-2fa-validation-checklist.md`
- `docs/definition-of-done.md`
- `docs/next-chat-prompt-templates.md`

## 2) Основни принципи
- Never trust frontend: всяка стойност от браузъра се приема като недоверена.
- Least privilege: всеки потребител/функция получава само минималните нужни права.
- Minimum error information: към клиента връщаме полезни, но не чувствителни грешки.
- Defense in depth: защита на няколко нива - UI, API/Edge Function, DB (RLS/constraints), deploy headers.

## 3) Модул по модул (по темите от курса)

### Модул A: Обезопасяване на ниво апликация
Какво означава:
- защита от злоупотреба с endpoint-и
- контрол на достъпа и правилна auth/authz логика
- безопасни отговори при грешка

Какво е приложено в проекта:
- `supabase/functions/chat-with-ai/index.ts`
- `supabase/functions/create-user/index.ts`
- `supabase/functions/update-user/index.ts`
- `supabase/functions/delete-user/index.ts`

Конкретно:
- задължителна проверка за валидна сесия/JWT
- admin endpoint-ите приемат само admin потребител
- входна валидация (email, password strength, role allowlist, uuid)
- ограничаване на request payload (message/history лимити за AI chat)
- rate limiting/cooldown за auth/chat/admin потоци + предвидим `429`/retry contract
- минимизиране на чувствителна debug информация в отговорите

### Модул B: Обезопасяване на данните
Какво означава:
- защита от XSS/injection чрез правилно escaping/sanitization
- валидиране на данните преди render/съхранение

Какво е приложено в проекта:
- `src/pages/materials/materialsHandlers.js`
- `src/pages/materials/materialsRenderer.js`

Конкретно:
- allowlist sanitizer за rich HTML бележки
- премахване на опасни тагове/атрибути (`on*`, `style`, unsafe URLs)
- безопасни линкове (само `http/https`)
- escape на tags/атрибути при рендериране

### Модул C: Обезопасяване на акаунти
Какво означава:
- силни пароли и последователни правила навсякъде
- по-сигурни auth настройки

Какво е приложено в проекта:
- `src/utils/passwordPolicy.js`
- `src/pages/register/register.js`
- `src/pages/profile/profile.js`
- `src/pages/admin/admin.js`
- `src/register.html`
- `src/profile.html`
- `src/admin.html`
- `supabase/config.toml`

Конкретно:
- единна политика за пароли (минимум 10 символа + upper/lower/number/symbol)
- UI и backend са синхронизирани
- `minimum_password_length = 10`
- `secure_password_change = true`

### Модул D: Deploy / платформа
Какво означава:
- security headers на ниво хостинг

Какво е приложено:
- `netlify.toml`
- `vercel.json`

Конкретно:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` ограничения
- `Strict-Transport-Security`
- `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`

## 4) Как да мислим при нов feature
- Какви входове приема? (валидирай на сървър/DB, не само във frontend)
- Кой има право да го извърши? (auth + role + ownership)
- Какво връща при грешка? (без вътрешни детайли)
- Какво се логва? (достатъчно за разследване, без секрети)
- Къде може да се инжектира HTML/URL? (escape/sanitize)

## 5) Бърз security checklist (преди release)
- Всички форми имат server-side валидация.
- Няма `innerHTML` за потребителски данни без sanitizer.
- Линковете от user content са само `http/https`.
- RLS и роли са проверени за всеки write endpoint.
- Secrets не са в repo; само env vars.
- Frontend runtime env vars са ограничени до одобрените публични `VITE_*` стойности.
- Dependency review е изпълнен според `docs/dependency-security-audit-cadence.md`.
- Build минава успешно.
- Smoke тест на login/register/profile/admin/materials екрани след security промени.
- Попълни `docs/production-security-release-checklist.md` за всеки preview/live release candidate.
- Изпълни `docs/lesson-5-live-verification-runbook.md` при Netlify/Vercel release verification.
- Ползвай `docs/security-env-secrets-inventory.md` като source of truth за env/secrets ownership.

## 6) Какво остава за следващ етап
Тези теми вече са организирани в:
- `docs/lesson-6-guided-security-review.md`
- `docs/lesson-6-task-tracker.md`
- `docs/security-observability-baseline.md` (вече покрива `L6-OBS-01`)
- `docs/security-alerting-runbook.md` (вече покрива `L6-OBS-02`)
- `docs/dependency-security-audit-cadence.md` (вече покрива `L6-DEP-01`)
- `docs/dependency-review-checklist.md` (вече покрива `L6-DEP-02`)
- `docs/admin-2fa-rollout-strategy.md` (вече покрива `L6-2FA-01`)
- `docs/admin-2fa-validation-checklist.md` (проследява rollout/validation частта на `L6-2FA-02`)

- CAPTCHA/anti-bot за публични форми при нужда.
- Завършване на hosted rollout + recovery validation за admin 2FA.
- Operational rollout на централизирания security logging + alerting baseline.
- Изпълнение на периодичния dependency audit и patch cadence в реалните release/maintenance цикли.


