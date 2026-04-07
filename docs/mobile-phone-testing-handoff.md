# Mobile Phone Testing Handoff (StudyHub v2)

Last updated: 2026-04-07

## 1) Golden Path — LAN (без кабел, препоръчан)

### Еднократна настройка
- WiFi мрежата на компютъра трябва да е **Private** (не Public)
  - Windows: Settings → Network → Wi-Fi → Properties → Private
- При prompt от Windows Firewall за Node.js → **Allow**
- Телефонът и компютърът трябва да са на **същата WiFi мрежа**

### Стъпки за стартиране

**Терминал 1 — Web backend:**
```bash
npm run dev:web
```
Изчакай `✓ Ready` и провери че е на порт **3000** (не 3001).
Ако е на 3001 → има стар процес на 3000. Виж Recovery секцията.

**Терминал 2 — Mobile Metro:**
```bash
npm --workspace @studyhub/mobile run dev:mobile:lan
```

**На телефона:**
1. Отвори **Expo Go**
2. Сканирай **QR кода** от Metro терминала
3. Приложението се зарежда

### API URL
- Файл: `apps/mobile/.env`
- Стойност: `EXPO_PUBLIC_API_URL=http://192.168.1.9:3000`
- Ако си сменила мрежа, провери IP-то с `ipconfig` и обнови `.env`

---

## 2) Алтернатива — USB (с кабел)

1. Свържи Android по USB (File transfer mode, USB debugging ON)
2. Провери: `adb devices` → трябва да покаже устройството
3. Стартирай:
```bash
npm run dev:mobile:usb
```
4. В Expo Go въведи: `exp://127.0.0.1:8081`

---

## 3) Recovery checklist

### Порт 3000 е зает
```bash
netstat -ano | findstr :3000
```
Намери PID-а и го спри:
```bash
taskkill /PID <номер> /F
```
После пусни `npm run dev:web` наново.

### "Failed to download remote update"
- Провери че телефонът и компютърът са на **същата WiFi мрежа**
- Затвори Expo Go напълно (swipe away) и отвори наново
- Провери WiFi профил — трябва да е **Private**

### Metro порт 8081 зает
Спри стария Metro процес или ползвай:
```bash
cmd.exe /c "taskkill /IM node.exe /F"
```
И стартирай наново.

### Стар bundle (не виждам промените)
- Натисни `r` в Metro терминала за reload
- Или shake телефона → Reload от менюто

---

## 4) Какво да НЕ правим

- Да не разчитаме на `--tunnel` (ngrok е нестабилен, timeout-ва често)
- Да не смесваме `next start` и `next dev` — ползваме само `dev:web`
- Да не дебъгваме mobile преди да потвърдим, че web API е на порт **3000**
- Да не пускаме Metro от Claude CLI — да се ползват реални терминали

---

## 5) Текущ статус (2026-04-07)

- **4 екрана** работят на физическо устройство:
  1. Login — gradient фон, анимирана карта
  2. Courses List — gradient header със статистика, card accents
  3. Course Details — gradient hero, модули с expand/collapse, материали натискаеми
  4. Material View — пълен текст, тип badge, тагове, линк бутон
- LAN mode е стабилен при правилна мрежова конфигурация
- Expo SDK 54, React Native 0.81.5
