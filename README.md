# מנהל עמותה — NGO Manager

מערכת ניהול חכמה לעמותות, מחליפה את Excel בדאשבורד מקצועי עם יכולות AI.  
נבנתה עבור דני — מנהל עמותה התומכת בקשישים החיים לבד בקהילה.

---

## דרישות מקדימות

- Node.js 18+
- PostgreSQL 14+ (מותקן ורץ מקומית)
- מפתח API של Anthropic — [console.anthropic.com](https://console.anthropic.com)
- חשבון Resend לשליחת מיילים — [resend.com](https://resend.com)

---

## הרצה מקומית — שלב אחר שלב

### 1. שכפול והתקנה

```bash
git clone https://github.com/YOUR_USERNAME/association-management.git
cd association-management/ngo-manager
npm install
```

### 2. יצירת מסד הנתונים

```bash
# macOS עם Homebrew
createdb ngo_manager

# או עם psql
psql -U postgres -c "CREATE DATABASE ngo_manager;"
```

### 3. הגדרת משתני סביבה

```bash
cp .env.example .env.local
```

פתח את `.env.local` ומלא את כל הערכים (ראה טבלה למטה).

### 4. הרצת migrations (בניית סכמת הדאטהבייס)

```bash
npx prisma migrate deploy
```

### 5. טעינת נתוני דמו

```bash
npm run prisma:seed
```

### 6. הפעלת השרת

```bash
npm run dev
```

כנס ל-[http://localhost:3000](http://localhost:3000)

**פרטי כניסה:**

- אימייל: `danny@ngo.org`
- סיסמה: `changeme123`

---

## משתני סביבה

העתק את `.env.example` לקובץ `.env.local` ומלא:

| משתנה               | חובה      | תיאור                                                                  |
| ------------------- | --------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`      | ✅        | כתובת PostgreSQL — `postgresql://user:pass@localhost:5432/ngo_manager` |
| `NEXTAUTH_SECRET`   | ✅        | מחרוזת אקראית. יצירה: `openssl rand -base64 32`                        |
| `NEXTAUTH_URL`      | ✅        | כתובת המערכת — `http://localhost:3000`                                 |
| `ANTHROPIC_API_KEY` | ✅        | מפתח API של Anthropic — `sk-ant-...`                                   |
| `RESEND_API_KEY`    | ✅        | מפתח API של Resend — `re_...`                                          |
| `RESEND_FROM_EMAIL` | ✅        | כתובת שולח — `noreply@yourdomain.com`                                  |
| `ADMIN_EMAIL`       | אופציונלי | אימייל כניסה (ברירת מחדל: `danny@ngo.org`)                             |
| `ADMIN_PASSWORD`    | אופציונלי | סיסמת כניסה (ברירת מחדל: `changeme123`)                                |

> **חשוב:** קובץ `.env.local` כלול ב-`.gitignore` ולעולם לא יועלה ל-GitHub.  
> ה-`.env.example` הוא הדגמה בלבד — ללא ערכים אמיתיים.

---

## העלאה ל-GitHub

### העלאה ראשונה

```bash
# 1. אתחול git (אם עוד לא)
git init

# 2. הוספת כל הקבצים (ה-.gitignore כבר מגן על .env.local)
git add .
git commit -m "first commit"

# 3. יצירת repository ב-GitHub (דרך האתר) ואז:
git remote add origin https://github.com/YOUR_USERNAME/ngo-manager.git
git branch -M main
git push -u origin main
```

### עדכונים שוטפים

```bash
git add .
git commit -m "תיאור השינוי"
git push
```

> **לפני כל push:** ודא שהרצת `git status` ואין שם קבצי `.env` — הם **לא** אמורים להיות מועלים.

## סטאק טכנולוגי

| שכבה       | טכנולוגיה                                   |
| ---------- | ------------------------------------------- |
| Framework  | Next.js 14 (App Router + Server Components) |
| מסד נתונים | PostgreSQL + Prisma ORM                     |
| ממשק משתמש | Tailwind CSS + shadcn/ui — עברית RTL        |
| AI         | Anthropic Claude (בצד שרת בלבד)             |
| אימייל     | Resend                                      |
| PDF        | PDFKit                                      |
| אותנטיקציה | NextAuth.js (credentials)                   |

---

## החלטות ארכיטקטורליות עיקריות

### 1. קריאות AI בצד שרת בלבד

כל קריאות Claude מתבצעות ב-Route Handlers (`app/api/ai/*`) בלבד — ה-SDK של Anthropic **לא נשלח לדפדפן**. זה מונע חשיפת מפתח ה-API ומבטיח שלוגיקת ה-AI יושבת ליד הגישה לדאטהבייס.

### 2. Server Components + אי של Client

הדפים הם Server Components — טעינה מהירה, גישה ישירה ל-Prisma. רכיבים אינטראקטיביים (מודלים, טפסים, לחצנים) מופרדים ל-`'use client'`. כך נשלח לדפדפן JavaScript מינימלי.

### 3. שיוך מתנדבים אוטומטי

כשדני לוחץ על מבצע, הטבלה מפעילה אוטומטית את `/api/ai/assign-volunteers` — ללא לחיצת כפתור. ההמלצות מוצגות עם הסבר לכל מתנדב. ה-AI מרגיש כמו עוזר ולא כלי נפרד.

### 4. שליחת מייל לא-חוסמת

הדאטהבייס מתעדכן תמיד ראשון. שליחת המייל עטופה ב-`try/catch` נפרד — כשל ב-Resend מוגדר כ-warning ולא קורס את הפעולה. דני תמיד מצליח לשמור; אם המייל לא יצא — מתגלה בלוגים.

### 5. זיהוי תורמים "מתקררים" בזמן שאילתא

אין Cron Job — הסטטוס "מתקרר" מחושב על כל בקשה ל-`/api/donors`: ימים מאז תרומה אחרונה מול 1.5× הממוצע ההיסטורי של אותו תורם. תמיד עדכני, ללא תשתית רקע.

### 6. PDFKit כ-external package

PDFKit קורא קבצי פונטים מהדיסק בזמן ריצה. אם Next.js יחבילו, הנתיבים נשברים. הוספת `serverComponentsExternalPackages: ['pdfkit']` ב-`next.config.mjs` מותירה אותו כ-`require()` רגיל של Node.js.

### 7. מסד נתונים יחיד, single-user

המערכת מיועדת למנהל אחד (דני). אין Roles, אין multi-tenancy. כל ה-API routes מוגנות רק בבדיקת session פעיל. אם יהיה צורך בעתיד — ניתן להוסיף roles ב-NextAuth ללא שינוי סכמה מהותי.

---

## פיצ'רים

- **מתנדבים** — רשימה, ניהול כישורים, לוח השפעה חודשי
- **תורמים** — מעקב תרומות, זיהוי תורמים מתקררים, טיוטות פנייה
- **מבצעים** — ניהול מבצעים שטח, שיוך מתנדבים אוטומטי עם AI
- **AI: שיוך מתנדבים** — Claude ממליץ על המתנדבים המתאימים לפי כישורים ועומס
- **AI: פנייה לתורמים** — Claude כותב מכתב פנייה אישי בעברית לתורם מתקרר
- **AI: דוח חודשי** — Claude כותב דוח למועצה, מייצר PDF ושולח אוטומטית
- **AI: ציוני השפעה** — Claude מדרג כל מתנדב חודשית ומייצר מכתבי הוקרה ל-3 המובילים
- **ממשק עברי מלא** (RTL) — פונטים Heebo + Frank Ruhl Libre

---

## בדיקות

```bash
# בדיקות יחידה (Jest) — לא דורשות דאטהבייס
npx jest

# בדיקות E2E (Playwright) — דורשות שרת + seed
npx playwright test
```
