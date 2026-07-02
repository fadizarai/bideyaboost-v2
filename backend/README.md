<div align="center">
  <h1>🎓 Bideya - Education & Event Management Platform</h1>
  <p>A robust, production-ready backend ecosystem.</p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

<br />

Welcome to **Bideya**, a complete backend solution for educational institutions, clubs, and expert-student coordination, focusing on rich features, multi-language support, and performance tracking.

---

## 📑 Table of Contents
- [🌟 Key Features](#-key-features)
- [🚀 Getting Started](#-getting-started)
- [🛠️ Technology Stack](#-technology-stack)
- [📂 Project Structure](#-project-structure)
- [🔗 Main API Endpoints](#-main-api-endpoints)
- [🐳 Deployment & Recent Fixes](#-deployment--recent-fixes)

---

## 🌟 Key Features

<details>
<summary><b>🏢 Club & Event Management</b> (Click to expand)</summary>

<br />

- **Detailed Clubs**: Brand management for university clubs including presidents, social media links, and custom branding.
- **Advanced Events**: Multilingual support (Arabic, French, English) for titles and descriptions. Includes capacity limits, registration deadlines, and student registration status auditing.
</details>

<details>
<summary><b>💬 Messaging & Communication</b> (Click to expand)</summary>

<br />

- **Modern Chat**: Real-time conversation management with support for message **attachments**, **replies**, and **read status** markers.
- **Categorized Conversations**: Dedicated types for PRIVATE, GROUP, ADMIN, and EDUCATIONAL channels.
</details>

<details>
<summary><b>🎓 Expert Coordination</b> (Click to expand)</summary>

<br />

- **Detailed Profiles**: Experts can showcase skills, languages, and multi-language bios.
- **Availability Engine**: Complex availability window management stored via JSON.
- **Meetings**: Student-Expert booking system with status auditing (Pending, Confirmed, Completed) and video participant tracking.
</details>

<details>
<summary><b>📈 Student Performance & AI</b> (Click to expand)</summary>

<br />

- **Performance Suite**: Track test results, academic goals, achievements, and study session history.
- **Activity Tracking**: Granular user activity logging for auditing and engagement analytics.
- **Chatbot Persistence**: Full history of AI interactions per student/user for continuous educational context.
</details>

<details>
<summary><b>🛠️ Administrative Excellence</b> (Click to expand)</summary>

<br />

- **Navigation Control**: Dynamic visibility configuration for frontend navigation items.
- **Centralized Notes**: Higher-level administrative notes with priority, status, and color-coding.
- **Modular Design**: Clean Architecture principles ensuring high maintainability and testability.
</details>

---

## 🚀 Getting Started

<details open>
<summary><b>Quick Start with Docker</b></summary>

<br />

1. Clone the repository and navigate into the project.
2. Build and start the services:
   ```bash
   docker-compose up --build
   ```
3. The API will be available at `http://localhost:8000`.
</details>

<details>
<summary><b>Local Development</b></summary>

<br />

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Setup**: Create a `.env` file based on `.env.example`.
3. **Database Initialization**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
</details>

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Language** | TypeScript (v5+) |
| **Runtime** | Node.js (v20+) |
| **Framework** | Express.js |
| **ORM** | Prisma (Multi-database support) |
| **Validation** | Zod (Schema-based runtime validation) |
| **Security** | Helmet, CORS, Rate Limiting, bcrypt, JWT (Access/Refresh tokens) |
| **Infrastructure** | Docker & Docker Compose |

---

## 📂 Project Structure

<details>
<summary><b>View Directory Tree</b></summary>

<br />

```text
src/
├── config/             # Application config and logger setup
├── database/           # Prisma client, migrations, and seeding scripts
├── middleware/         # Auth, Authorization, Validation, Error Handling
├── modules/            # Domain-driven Modular logic
│   ├── activities/     # User Audit Logs
│   ├── clubs/          # University Club Management
│   ├── chatbot/        # AI Interaction History
│   ├── performance/    # Student Goals and Test Scores
│   ├── messaging/      # Enhanced Chat System
│   └── ...             # Other core features
├── shared/             # Shared utilities, Errors, and Types
├── app.ts              # App assembly
└── server.ts           # Entry point
```
</details>

---

## 🔗 Main API Endpoints

| Feature | Endpoint | Method |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth/register` | `POST` |
| **Clubs** | `/api/v1/clubs` | `GET` / `POST` |
| **Performance** | `/api/v1/performance/progress` | `GET` |
| **Chatbot** | `/api/v1/chatbot/history` | `GET` |
| **Messaging** | `/api/v1/messaging/conversations` | `GET` / `POST` |
| **Events** | `/api/v1/events` | `GET` / `POST` |

---

## 🐳 Deployment & Recent Fixes

The project includes a production-ready `Dockerfile` and `docker-compose.yml`.

<details>
<summary><b>View Recent Stability & Build Fixes</b></summary>

<br />

### 1. Database Schema Overhaul
- **Multilingual Support**: Events and Experts now support content in English, French, and Arabic via JSON fields.
- **Detailed Progress Tracking**: Added `StudentProgress` and `TestResult` models for granular performance analytics.
- **Enhanced Messaging**: Support for message attachments, replies, and read status.
- **Expert Availability**: Flexible availability configurations using JSON.

### 2. Build & Stability Improvements
- **TypeScript Strictness**: Resolved structural property mismatches (e.g., `activity` -> `userActivity`, `content` -> `message`) across the repository.
- **Docker Network Resilience**: Implemented exhaustive retry strategies inside the `Dockerfile` to handle `ECONNRESET` issues when running `npm ci --legacy-peer-deps` within container builds.
- **Prisma 7 Compatibility**: The new `PrismaClient` initialization strictly requires Driver Adapters. We migrated the connection architecture to use `pg` + `@prisma/adapter-pg`, removed the deprecated `url` from `schema.prisma`, and successfully connected the containerized application to the PostgreSQL instance.
</details>

```bash
docker-compose up -d --build
```
