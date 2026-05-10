# VocabVerse — Team Split Plan (3 Members)

> Splitting is done by **feature/role ownership**, not by random file count. Each member gets full ownership of a vertical slice (backend + frontend) so work is independent and merge conflicts are minimized.

---

## 🧩 Split Strategy

| Role | Theme | Owns |
|---|---|---|
| **Member 1** | Auth, Admin & Project Setup | Backend infra + Auth + Admin modules + Auth/Admin frontend |
| **Member 2** | Instructor & Lessons | Instructor module + Lesson module + Instructor frontend pages |
| **Member 3** | Student, AI & SRS | Student module + AI module + SRS module + Student frontend pages |

---

## 👤 Member 1 — Auth, Admin & Project Setup

> **Focus**: Foundation of the app — authentication, admin panel, shared config, middleware, and all project scaffolding.

### Backend
```
backend/
├── server.js                          ← Entry point
├── package.json / package-lock.json
├── .env.example
├── src/
│   ├── routes.js                      ← Central router
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── dns-fix.js
│   │   ├── constants.js
│   │   └── permissions.matrix.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── permission.middleware.js
│   │   ├── error.middleware.js
│   │   ├── audit.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── modules/
│   │   ├── identity/                  ← Auth module
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.service.js
│   │   │   └── models/
│   │   └── admin/
│   │       ├── admin.controller.js
│   │       ├── admin.routes.js
│   │       ├── admin.service.js
│   │       └── models/
│   ├── scripts/                       ← Any seed/migration scripts
│   └── utils/                         ← Shared utilities
```

### Frontend
```
frontend/
├── index.html
├── vite.config.js
├── package.json / package-lock.json
├── eslint.config.js
├── public/
├── src/
│   ├── main.jsx                       ← App entry
│   ├── App.jsx                        ← Routing root
│   ├── index.css                      ← Global styles
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── guards/                        ← Route guards
│   ├── components/
│   │   └── layout/                    ← Shared layout (Navbar, Sidebar etc.)
│   ├── api/                           ← Shared API config/base
│   ├── utils/                         ← Shared utils
│   ├── assets/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── onboarding/
│   │   │   └── OnboardingPage.jsx
│   │   └── admin/
│   │       └── AdminDashboard.jsx
```

### Root Files
```
README.md
.gitignore
models.txt                             ← DB schema reference
postman.json                           ← Shared API collection
```

---

## 👤 Member 2 — Instructor & Lessons

> **Focus**: Everything instructors do — creating lessons, managing vocabulary content, and the lesson builder UI.

### Backend
```
backend/src/modules/
├── instructor/
│   ├── instructor.controller.js
│   ├── instructor.routes.js
│   ├── instructor.service.js
│   └── models/
└── lessons/
    ├── lesson.controller.js
    ├── lesson.routes.js
    ├── lesson.service.js
    └── models/
```

### Frontend
```
frontend/src/pages/
└── instructor/
    ├── InstructorDashboard.jsx
    └── LessonBuilder.jsx
```

---

## 👤 Member 3 — Student, AI & SRS

> **Focus**: Everything students interact with — learning, spaced repetition review, AI chat, grammar check, leaderboard, and profile.

### Backend
```
backend/src/modules/
├── student/
│   ├── student.controller.js
│   ├── student.routes.js
│   ├── student.service.js
│   └── models/
├── ai/
│   ├── ai.controller.js
│   ├── ai.routes.js
│   ├── ai.service.js
│   └── models/
└── srs/
    ├── srs.controller.js
    ├── srs.routes.js
    ├── srs.service.js
    └── models/
```

### Frontend
```
frontend/src/pages/
└── student/
    ├── DashboardPage.jsx
    ├── LessonsPage.jsx
    ├── LessonPlayPage.jsx
    ├── SRSReviewPage.jsx
    ├── AIChatPage.jsx
    ├── GrammarCheckPage.jsx
    ├── LeaderboardPage.jsx
    └── ProfilePage.jsx
```

---

## 🔀 Git Workflow (Steps to Push)

### Step 1 — One person forks/creates the repo on GitHub (Member 1)
```bash
# Already in the local repo directory
git remote add origin https://github.com/<org>/VocabVerse.git
git branch -M main
git push -u origin main
```

### Step 2 — Each member creates their own feature branch

**Member 1:**
```bash
git checkout -b feature/auth-admin-setup
```

**Member 2:**
```bash
git clone https://github.com/<org>/VocabVerse.git
cd VocabVerse
git checkout -b feature/instructor-lessons
```

**Member 3:**
```bash
git clone https://github.com/<org>/VocabVerse.git
cd VocabVerse
git checkout -b feature/student-ai-srs
```

### Step 3 — Each member works only on their assigned files
- Member 2 & 3: Do **not** touch `App.jsx`, `routes.js`, `server.js` until coordinating with Member 1.
- Use `git add <specific-file>` instead of `git add .` to avoid pushing others' work.

### Step 4 — Push your branch
```bash
git add .
git commit -m "feat: <your feature description>"
git push origin feature/<your-branch-name>
```

### Step 5 — Open a Pull Request on GitHub
- Each member opens a PR from their branch → `main`
- Member 1 reviews and merges in order: **1 → 2 → 3** (since 2 & 3 depend on Member 1's auth/routes)

---

## ⚠️ Important Notes

- **Shared files** (`App.jsx`, `routes.js`, `server.js`, `index.css`) are owned by **Member 1** but will need updates as M2 & M3 add routes — coordinate on a shared doc or Discord.
- **Test files** (`test-ai.js`, `test-gemini.js`, etc.) — assign to **Member 3** since they relate to the AI module.
- **`postman.json`** — belongs to Member 1 (shared), all members update it as they add APIs.
- Never commit `node_modules/`, `.env`, `eslint-results.json` (already in `.gitignore`).
