# 🛡️ SecureSuite — Insurance Management Portal

A modern, full-stack **insurance management portal** built with role-based access control (RBAC). Designed for insurance brokerages to manage policies, customers, claims, agents, quotations, and commissions — with distinct dashboards and permissions for **Admins**, **Agents**, and **Customers**.

![TanStack Start](https://img.shields.io/badge/TanStack_Start-FF4154?style=for-the-badge&logo=react&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## ✨ Features

### 🔐 Role-Based Access Control (RBAC)

| Feature | Admin | Agent | Customer |
|---------|:-----:|:-----:|:--------:|
| Dashboard (full analytics) | ✅ | — | — |
| Dashboard (own book) | — | ✅ | ✅ |
| View all policies | ✅ | — | — |
| View own policies | ✅ | ✅ | ✅ |
| Create/edit policies | ✅ | ✅ | — |
| View all customers | ✅ | — | — |
| View/manage assigned customers | ✅ | ✅ | — |
| Add customers | ✅ | ✅ | — |
| View agents & performance | ✅ | — | — |
| Claims management | ✅ | ✅ | ✅ (own) |
| Quotations | ✅ | ✅ | — |
| Reports & exports | ✅ | — | — |
| Master data management | ✅ | — | — |
| Brokerage / commissions | ✅ | ✅ (own) | — |
| Global search | ✅ | ✅ (filtered) | ✅ (filtered) |

### 📊 Three Distinct Dashboards

- **Admin Dashboard**: Full portfolio overview with KPIs, charts (premium trends, policy type distribution, monthly revenue), renewal calendar, and system-wide metrics.
- **Agent Dashboard**: Personal book summary — own customers, policies, pending claims, commission tracker, and policy table.
- **Customer Dashboard**: Self-service view — own policies, upcoming renewals, claims status, and assigned agent info.

### 🏗️ Core Modules

- **Policies** — Full lifecycle management (create, view, renew, track status)
- **Customers** — Customer profiles with KYC status and policy mapping
- **Claims** — Claims filing, tracking, and settlement workflow
- **Agents** — Agent performance, book size, and commission tracking
- **Quotations** — Preliminary quote management with convert-to-policy flow
- **Renewals** — Upcoming and overdue renewal tracking
- **Accounts** — Agent brokerage and company brokerage management
- **Reports** — CSV export for policies, customers, agents, claims, renewals
- **Master Data** — Manage companies, policy types, banks, TPAs
- **Global Search** — Role-filtered instant search across all entities

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [TanStack Start](https://tanstack.com/start) (React 19 SSR) |
| **Language** | TypeScript |
| **Database** | MySQL 8.0 |
| **ORM** | Prisma |
| **Styling** | Tailwind CSS + shadcn/ui components |
| **Charts** | Recharts |
| **Auth** | Cookie-based sessions with bcrypt password hashing |
| **State** | TanStack React Query |
| **Routing** | TanStack Router (file-based, with `beforeLoad` guards) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MySQL** 8.0+
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/shahvidhiii/secure-policy-zen.git
cd secure-policy-zen
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/panirgic_with_data"
```

### 4. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to your MySQL database
npx prisma db push
```

### 5. Start the Dev Server

```bash
npm run dev
```

The app will be available at **http://localhost:8080**

---

## 🔑 Default Login Credentials

### Admin
| Field | Value |
|-------|-------|
| Email | `Admin@insuretechs.com` |
| Password | `Admin@123` |

### Agents
| Name | Email | Password |
|------|-------|----------|
| Praneel Shah | `praneel@gmail.com` | `Agent@123` |
| Roronoa Zoro | `zoro@gmail.com` | `Agent@123` |
| Jignesh Shah | `jignesh.198@agent.com` | `Agent@123` |
| ROHIT | `rohit.199@agent.com` | `Agent@123` |
| VANDANA | `vandana.204@agent.com` | `Agent@123` |
| DEEPIKA JAIN | `deepika.211@agent.com` | `Agent@123` |
| KEYUR SHAH | `keyur.215@agent.com` | `Agent@123` |

### Customers
All customers use password: **`Customer@123`**

Example logins:
| Name | Email |
|------|-------|
| Arsh Sakariya | `arshsakaria@gmail.com` |
| Mahesh Machhi | `noemail100@gmail.com` |
| Ashwin Ahuja | `jyotisons@gmail.com` |

---

## 🏛️ Architecture

```
src/
├── components/           # Reusable UI components
│   ├── forms/            # Dialog forms (policy, customer, agent, claim, quotation)
│   ├── ui/               # shadcn/ui primitives (button, dialog, select, etc.)
│   ├── top-nav.tsx       # Role-aware navigation bar
│   ├── global-search.tsx # Role-filtered global search
│   └── ui-bits.tsx       # KPI cards, status badges, accent colors
├── lib/
│   ├── api/              # Server functions (TanStack Start server fns)
│   │   ├── auth.server.ts       # Login/logout/session management
│   │   ├── dashboard.server.ts  # Dashboard KPIs & charts (role-filtered)
│   │   ├── policies.server.ts   # Policy CRUD (role-filtered)
│   │   ├── customers.server.ts  # Customer CRUD (role-filtered)
│   │   ├── claims.server.ts     # Claims management (role-filtered)
│   │   ├── agents.server.ts     # Agent management (admin + self)
│   │   ├── brokerages.server.ts # Commission tracking (role-filtered)
│   │   ├── quotations.server.ts # Quote management (admin/agent)
│   │   ├── search.server.ts     # Global search (role-filtered)
│   │   ├── masters.server.ts    # Master data (admin-only)
│   │   └── payments.server.ts   # Payment records (role-filtered)
│   ├── auth-middleware.ts  # Session parsing, requireSession(), requireRole()
│   ├── role-context.tsx    # React context for role/session state
│   ├── db.ts               # Prisma client instance
│   └── mock-data.ts        # Utility functions (formatINR, etc.)
├── routes/                 # File-based routing (TanStack Router)
│   ├── __root.tsx          # Root layout with auth guard
│   ├── login.tsx           # Login page
│   ├── index.tsx           # Dashboard (renders Admin/Agent/Customer view)
│   ├── policies.tsx        # Policies layout
│   ├── policies.index.tsx  # Policies list page
│   ├── policies.$id.tsx    # Policy detail page
│   ├── customers.tsx       # Customers list (admin/agent guard)
│   ├── customers.$id.tsx   # Customer detail page
│   ├── claims.tsx          # Claims page
│   ├── agents.tsx          # Agents page (admin guard)
│   ├── quotations.tsx      # Quotations (admin/agent guard)
│   ├── renewals.tsx        # Renewals page
│   ├── reports.tsx         # Reports (admin guard)
│   ├── masters.*.tsx       # Master data pages (admin guard)
│   └── accounts.*.tsx      # Brokerage pages (role guard)
└── styles.css              # Global styles & design tokens
```

---

## 🔒 Security Model

### Server-Side Enforcement
Every server function (`createServerFn`) calls `requireSession()` or `requireRole()` before executing. Data queries use Prisma `WHERE` clauses based on the session:

- **Admin** → No filter (`WHERE 1=1`) — sees everything
- **Agent** → Policies: `WHERE refered_by = agentId`, Customers: `WHERE agent_id = agentId`
- **Customer** → Policies: `WHERE customer_id = customerId`, Claims: own claims only

### Frontend Route Guards
Routes use TanStack Router's `beforeLoad` to redirect unauthorized users:
- Admin-only routes: `/agents`, `/reports`, `/masters/*`, `/accounts/company-brokerage`
- Admin + Agent routes: `/customers`, `/quotations`, `/accounts/agent-brokerage`

### Session Management
- Cookie-based sessions (`httpOnly`, `secure` in production)
- Passwords hashed with **bcrypt** (10 salt rounds)
- Session enriched with `agentId`/`customerId` for role filtering

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma db push` | Sync schema to database |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
