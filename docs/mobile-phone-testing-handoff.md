# Mobile Phone Testing Handoff (StudyHub v2)

Last updated: 2026-03-28

## 1) Какво е направено досега

- Mobile стекът е ъпгрейднат до Expo SDK 54 в `apps/mobile`.
- `expo-doctor --verbose` минава успешно: `17/17 checks passed`.
- Добавени са локални mobile scripts:
  - `dev:mobile:tunnel`
  - `dev:mobile:lan`
  - `dev:mobile:usb`
  - `android:usb`
- Добавен е USB reverse helper: `apps/mobile/scripts/usb-reverse.js`.
- Добавен е по-устойчив API base fallback в mobile:
  - `EXPO_PUBLIC_API_URL` override
  - auto-detect host от Expo config
  - fallback за emulator (`10.0.2.2`) и web (`localhost`)
- Потвърдено е, че web app работи локално: `http://localhost:3000/login` връща `200`.

## 2) Какви проблеми срещнахме и защо

### A) `failed to download remote update`
- Първоначално имаше dependency drift и липсващ peer.
- След фиксовете и SDK 54 upgrade проблемът не е от dependency compatibility.

### B) Expo Go SDK mismatch (SDK 54 app vs SDK 53 project)
- Проектът беше на SDK 53, Expo Go на телефона беше за SDK 54.
- Решение: ъпгрейд към SDK 54 (вече е направено).

### C) Red screen `500` по време на mobile runtime
- Реална причина: stale Next.js процес на `3000` + нов `dev:web` на `3001`.
- Mobile app вика API към `3000`, но е удрял грешен backend процес.
- Решение: kill stale Next процеси и стартиране само на `next dev` на `3000`.

### D) Expo Go показва само сиво квадратче "StudyHub v2"
- Това е observed проблем в launcher UX на Expo Go.
- Текущо е open item: web работи, Metro/API работят, но UI поведението в Expo Go е нестабилно.

## 3) Golden Path (следващ път изпълняваме само това)

1. Стартирай backend web:
```bash
npm run dev:web
```
Провери:
```bash
http://localhost:3000/login
```

2. Свържи Android по USB:
- USB mode: `File transfer (MTP)`
- Developer options: `USB debugging = ON`
- При prompt: `Allow` (+ по избор `Always allow`)

3. Проверка за устройство:
```bash
adb devices
```
Очаквано: `<serial>    device`

4. Стартирай mobile Metro (localhost):
```bash
npm --workspace @studyhub/mobile run start -- --localhost -c
```

5. Направи reverse на портовете:
```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3000 tcp:3000
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001
adb reverse tcp:19002 tcp:19002
adb reverse --list
```

6. Отвори app-а в Expo Go:
```bash
exp://127.0.0.1:8081
```

## 4) Бърз recovery checklist

Ако mobile не тръгне:

1. Провери портове:
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :8081
```

2. Ако `dev:web` е на `3001` вместо `3000`:
- има stale процес на `3000`
- спри Next.js процесите и пусни `npm run dev:web` наново

3. Ако `adb devices` е празно:
- смени USB кабел/порт
- потвърди RSA prompt
- `Revoke USB debugging authorizations` и повтори

4. Ако има red screen:
- вземи първия ред на грешката от екрана
- и/или пусни:
```bash
adb logcat -d ReactNativeJS:I Expo:I *:S
```

## 5) Какво да НЕ правим

- Да стартираме едновременно различни web режими (`next start` и `next dev`) и да смесим портовете.
- Да разчитаме на `--tunnel` като единствен път (ngrok често timeout-ва).
- Да дебъгваме mobile преди да потвърдим, че web API е стабилно на `3000`.

## 6) Текущ статус

- Web: работи локално (`/login` е достъпен).
- Mobile compatibility: SDK 54 + `expo-doctor` е чист.
- Mobile phone launcher UX: има нестабилно поведение (сиво квадратче), нужно е следващата сесия да се фиксира конкретно с live screen + свеж log capture.
