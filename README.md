<div align="center">

<img src="https://img.shields.io/badge/TaskFlow-Project%20Management%20SaaS-6366f1?style=for-the-badge&logo=trello&logoColor=white" />

<h1>TaskFlow — Project Management SaaS</h1>

<p>A production-ready, full-stack SaaS application for teams to manage projects and tasks with a beautiful Kanban board experience.</p>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-e0234e?style=flat-square&logo=nestjs)](https://nestjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

</div>

---

## Overview

**TaskFlow** is a multi-tenant SaaS project management tool — similar to Trello or Linear — built from scratch with a clean, modern stack. It demonstrates real-world patterns including JWT authentication with refresh tokens, role-based access control, drag-and-drop Kanban boards, and a production-ready REST API.

## Screenshots

> Dashboard → Projects → Kanban Board → Task Detail

| Dashboard | Projects | Kanban Board |
|-----------|----------|--------------|
| Stats overview + recent projects | Create & manage projects | Drag & drop tasks across columns |

## Features

- **Authentication** — Register, Login, access/refresh JWT tokens, auto-refresh on expiry
- **Multi-tenant Workspaces** — Each user gets a workspace; invite team members with roles (Owner / Admin / Member)
- **Projects** — Create projects with custom colors, descriptions, and instant stats
- **Kanban Board** — Drag & drop tasks between **To Do → In Progress → In Review → Done**
- **Tasks** — Priority levels (Low/Medium/High/Urgent), due dates, tags, assignees
- **Dashboard** — Real-time stats, recent projects, greeting by time of day
- **Settings** — Profile management, workspace overview, team members

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **NestJS + TypeScript** | Modular REST API with decorators, guards, interceptors |
| **MongoDB + Mongoose** | Document database with typed schemas |
| **JWT (Access + Refresh)** | Stateless auth with 15-min access tokens & 7-day refresh |
| **Passport.js** | JWT strategy & refresh strategy |
| **class-validator** | DTO validation with decorators |
| **bcryptjs** | Password hashing |

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 14 (App Router)** | File-based routing with Server & Client components |
| **TypeScript** | End-to-end type safety |
| **Tailwind CSS** | Utility-first styling |
| **@dnd-kit** | Accessible drag & drop for Kanban |
| **Zustand** | Lightweight client state management with persistence |
| **Axios** | HTTP client with request/response interceptors |
| **react-hot-toast** | Beautiful toast notifications |

## Architecture

```
taskflow/
├── backend/                    # NestJS API — Port 3001
│   └── src/
│       ├── auth/               # JWT auth, strategies, guards
│       ├── users/              # User schema & profile
│       ├── workspaces/         # Multi-tenant workspace management
│       ├── projects/           # Project CRUD & stats
│       ├── tasks/              # Task CRUD, Kanban grouping
│       └── common/             # Decorators, filters, interceptors
│
└── frontend/                   # Next.js 14 App — Port 3000
    └── app/
        ├── (auth)/             # Login & Register pages
        └── (dashboard)/
            ├── dashboard/      # Stats overview
            ├── projects/       # Projects list & creation
            │   └── [id]/       # Kanban board per project
            └── settings/       # Profile & workspace settings
```

## API Reference

### Auth
```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login & get tokens
POST   /api/auth/refresh       Refresh access token
POST   /api/auth/logout        Invalidate refresh token
GET    /api/auth/me            Get current user
```

### Workspaces
```
GET    /api/workspaces         List user's workspaces
POST   /api/workspaces         Create workspace
GET    /api/workspaces/:id     Get workspace with members
PATCH  /api/workspaces/:id     Update workspace
DELETE /api/workspaces/:id     Delete workspace
POST   /api/workspaces/:id/members    Add member
DELETE /api/workspaces/:id/members/:uid  Remove member
```

### Projects
```
GET    /api/projects?workspaceId=   List projects
POST   /api/projects                Create project
GET    /api/projects/:id            Get project
PATCH  /api/projects/:id            Update project
DELETE /api/projects/:id            Delete project
GET    /api/projects/stats          Project statistics
```

### Tasks
```
GET    /api/tasks?projectId=   Get tasks grouped by status (Kanban)
POST   /api/tasks              Create task
PATCH  /api/tasks/:id          Update task (status, priority, assignee…)
DELETE /api/tasks/:id          Delete task
GET    /api/tasks/stats        Task counts per status
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow

# 2. Install backend dependencies
cd backend && npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# 4. Install frontend dependencies
cd ../frontend && npm install
```

### Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow
JWT_ACCESS_SECRET=your-strong-access-secret
JWT_REFRESH_SECRET=your-strong-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Run

```bash
# Terminal 1 — Start API
cd backend && npm run start:dev

# Terminal 2 — Start Frontend
cd frontend && npm run dev
```

Visit **http://localhost:3000** → Register an account → Start building!

## Security Highlights

- Passwords hashed with **bcrypt** (10 rounds)
- Refresh tokens hashed before storage — raw token never saved in DB
- JWT access tokens expire in **15 minutes**
- All protected routes require valid JWT via `JwtAuthGuard`
- Workspace access verified on every project/task operation
- Input validation via `class-validator` on all DTOs

---

<div align="center">
  <p>Built with ❤️ by <strong>Mina Eisa</strong></p>
  <p>
    <a href="https://www.upwork.com">Upwork Profile</a> •
    <a href="mailto:123menaesss@gmail.com">Contact</a>
  </p>
</div>
