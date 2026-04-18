# Navbar & Social Navigation Reorganization Plan

> **Създаден:** 2026-04-18 (Opus)
> **Изпълнител:** Sonnet
> **Файл:** `apps/web/components/navbar-client.tsx` (232 реда)
> **Commit message:** `refactor: reorganize navbar with grouped navigation and profile dropdown`

---

## Проблем

Навбарът показва плосък списък от 7–10 линка, добавяни хронологично.
Няма визуална йерархия — core LMS pages, social features и admin tools са на едно ниво.

**Сега (user):**
```
Home | Dashboard | Community | Progress | Calendar | Profile | Messages
```

**Сега (admin):**
```
Home | Dashboard | Community | Progress | Calendar | Profile | Messages | Inbox | Moderation | Admin
```

---

## Целева структура

### Ред 1: Brand + User pill (без промяна)
```
[Logo StudyHub]                    [Enable Alerts] [Theme] [Avatar Name Role | Logout]
```

### Ред 2: Навигация — разделена на две групи с визуален разделител

**User:**
```
Home | Dashboard | Progress | Calendar    ·    Community | Messages [badge]
```

**Mentor:**
```
Home | Dashboard | Progress | Calendar    ·    Community | Messages [badge] | Mentor Inbox | Moderation
```

**Admin:**
```
Home | Dashboard | Progress | Calendar    ·    Community | Messages [badge] | Mentor Inbox | Moderation | Admin
```

### Какво се променя:
1. **Profile** линкът се МАХА от навбара — вече е достъпен от аватар pill-а горе
2. Линковете се разделят на две групи с точков разделител (`·`)
   - **Лява група:** core LMS навигация (Home, Dashboard, Progress, Calendar)
   - **Дясна група:** social & role-specific (Community, Messages, Inbox, Moderation, Admin)
3. Подреждането следва логическа йерархия:
   - Core first (учебно съдържание)
   - Social second (общуване)
   - Admin last (управление)

---

## Имплементация

### Стъпка 1: Промени масива `links` (ред 114–130)

Замени текущия код:

```typescript
// СТАРО (ред 114-130):
const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/community", label: "Community" },
  { href: "/progress", label: "Progress" },
  { href: "/calendar", label: "Calendar" },
  { href: "/profile", label: "Profile" },
];
links.push({ href: "/messages", label: "Messages" });
if (user?.role === "mentor" || user?.role === "admin") {
  links.push({ href: "/mentor-inbox", label: "Inbox" });
  links.push({ href: "/moderation", label: "Moderation" });
}
if (user?.role === "admin") {
  links.push({ href: "/admin", label: "Admin" });
}
```

С:

```typescript
// НОВО:
const coreLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/progress", label: "Progress" },
  { href: "/calendar", label: "Calendar" },
];

const socialLinks: { href: string; label: string }[] = [
  { href: "/community", label: "Community" },
  { href: "/messages", label: "Messages" },
];
if (user?.role === "mentor" || user?.role === "admin") {
  socialLinks.push({ href: "/mentor-inbox", label: "Mentor Inbox" });
  socialLinks.push({ href: "/moderation", label: "Moderation" });
}
if (user?.role === "admin") {
  socialLinks.push({ href: "/admin", label: "Admin" });
}
```

**Забележки:**
- `Profile` е махнат — аватар pill-ът (ред 166-190) вече е линк към `/profile`
- `Inbox` е преименуван на `Mentor Inbox` за яснота (досега "Inbox" не говори нищо)
- Core links са подредени: Home → Dashboard → Progress → Calendar (учебен поток)

### Стъпка 2: Промени рендерирането на линковете (ред 204–222)

Замени текущия `div` с линковете:

```typescript
// СТАРО (ред 204-222):
<div className="flex flex-wrap items-center gap-2 lg:justify-end">
  {links.map((link) => (
    <Link ...>{link.label}</Link>
  ))}
</div>
```

С:

```typescript
// НОВО:
<div className="flex flex-wrap items-center gap-2 lg:justify-end">
  {coreLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition ${
        isActive(link.href)
          ? "bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] text-white shadow-[0_12px_30px_rgba(99,102,241,0.22)]"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-white"
      }`}
    >
      {link.label}
    </Link>
  ))}

  {/* Visual separator */}
  <span className="hidden text-slate-300 dark:text-slate-600 sm:inline" aria-hidden="true">·</span>

  {socialLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition ${
        isActive(link.href)
          ? "bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] text-white shadow-[0_12px_30px_rgba(99,102,241,0.22)]"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-white"
      }`}
    >
      {link.label}
      {link.href === "/messages" && messagesUnreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full border border-white bg-rose-500 px-1.5 text-center text-[10px] font-bold leading-4 text-white dark:border-slate-950">
          {messagesUnreadCount > 99 ? "99+" : messagesUnreadCount}
        </span>
      ) : null}
    </Link>
  ))}
</div>
```

**Забележки:**
- DRY проблем: link className се повтаря — Sonnet може да извлече `navLinkClass(isActive: boolean)` helper
- Разделителят е `·` (middle dot), скрит на мобилен (линковете се wrap-ват така или иначе)
- Messages badge логиката остава непроменена

### Стъпка 3: Update `isActive()` функцията (ред 104–112)

Добави pattern за `mentor-inbox`:

```typescript
// Добави в isActive():
if (href === "/mentor-inbox") {
  return pathname === "/mentor-inbox";
}
```

Останалите patterns вече работят коректно.

---

## Какво НЕ се променя

- Brand mark + logo (ред 36–53)
- Avatar pill с Profile линк (ред 165–200) — остава горе вдясно
- Logout бутон (ред 192–199)
- ThemeToggle (ред 163)
- Enable Alerts бутон (ред 150–161)
- Toast нотификация (ред 226–228)
- Messages unread badge логика
- Mobile breakpoint поведение (flex-wrap)

---

## Verification

- [ ] User вижда: `Home | Dashboard | Progress | Calendar · Community | Messages`
- [ ] Mentor вижда: `+ Mentor Inbox | Moderation`
- [ ] Admin вижда: `+ Admin`
- [ ] Profile е достъпен само от аватар pill-а (горе вдясно)
- [ ] Messages badge работи
- [ ] Active state работи за всички линкове
- [ ] Dark mode работи
- [ ] Mobile wrap изглежда добре (линковете се пренасят)
- [ ] `tsc --noEmit` минава чисто
- [ ] Файлът остава < 300 реда
- [ ] Обнови `docs/dev-log.md`
