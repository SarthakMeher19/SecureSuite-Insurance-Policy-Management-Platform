<p align="center">
  <img src="https://img.shields.io/badge/🛡️-SecureSuite-000000?style=for-the-badge&labelColor=FF6B35&color=000000" alt="SecureSuite" height="40"/>
</p>

<h1 align="center">SecureSuite — Insurance Policy Management Platform</h1>

<p align="center">
  <em>A modern, enterprise-grade insurance management portal with role-based access control, built for brokerages to manage policies, customers, claims, agents, and commissions.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/TanStack_Start-FF4154?style=flat-square&logo=react&logoColor=white" alt="TanStack Start"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/MySQL_8-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Recharts-FF6384?style=flat-square&logo=chartdotjs&logoColor=white" alt="Recharts"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-role-based-access-control">RBAC</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-security">Security</a>
</p>

---

## 🎯 Overview

**SecureSuite** is a full-stack insurance policy management platform designed for insurance brokerages. It provides **three distinct portals** — Admin, Agent, and Customer — each with tailored dashboards, data access, and functionality. The platform enforces strict **role-based access control (RBAC)** at both the API and UI levels, ensuring every user sees only the data they're authorized to access.

### Why SecureSuite?

- 🔐 **Enterprise-grade RBAC** — Server-side enforcement on every API call, not just UI hiding
- 📊 **Role-aware dashboards** — Three distinct dashboard experiences with real-time KPIs  
- 🏗️ **Full-stack type safety** — TypeScript from database to UI with Prisma + TanStack
- ⚡ **Server-side rendering** — Fast initial loads with TanStack Start SSR
- 🎨 **Modern UI** — Dark theme, glassmorphism, micro-animations with shadcn/ui

---

## ✨ Features

### 📊 Three Distinct Dashboards

| Admin Dashboard | Agent Dashboard | Customer Dashboard |
|:---:|:---:|:---:|
| Full portfolio overview | Personal book summary | Self-service portal |
| KPIs, charts, revenue trends | Own customers & policies | Own policies & renewals |
| System-wide metrics | Commission tracker | Claims status |
| Renewal calendar | Policy performance table | Agent contact info |

### 🏗️ Core Modules

| Module | Description | Admin | Agent | Customer |
|--------|-------------|:-----:|:-----:|:--------:|
| **Policies** | Full lifecycle — create, view, renew, endorse, track | ✅ Full | ✅ Own book | 👁️ View own |
| **Customers** | Profiles, KYC status, policy mapping | ✅ Full | ✅ Assigned | ❌ |
| **Claims** | Filing, tracking, settlement workflow | ✅ Full | ✅ Own policies | 👁️ Own claims |
| **Agents** | Performance metrics, book size, commissions | ✅ Full | 👁️ Self only | ❌ |
| **Quotations** | Quote management, convert-to-policy | ✅ Full | ✅ Own | ❌ |
| **Renewals** | Upcoming & overdue renewal tracking | ✅ Full | ✅ Own book | 👁️ Own |
| **Commissions** | Agent & company brokerage management | ✅ Full | 👁️ Own | ❌ |
| **Reports** | CSV export across all modules | ✅ Full | ❌ | ❌ |
| **Master Data** | Companies, policy types, banks, TPAs | ✅ Full | ❌ | ❌ |
| **Global Search** | Instant search across all entities | ✅ All | 🔍 Filtered | 🔍 Filtered |

---

## 🔐 Role-Based Access Control

SecureSuite implements **defense-in-depth** RBAC — access is enforced at three layers:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Frontend Route Guards (TanStack Router)       │
│  → Redirects unauthorized users before page renders     │
├─────────────────────────────────────────────────────────┤
│  Layer 2: UI Component Guards (React Context)           │
│  → Hides buttons, menus, and actions per role           │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Server-Side API Enforcement (Prisma WHERE)    │
│  → Every query filtered by session — the real security  │
└─────────────────────────────────────────────────────────┘
```

### How Data Filtering Works

| Role | Policies Filter | Customers Filter | Claims Filter |
|------|----------------|------------------|---------------|
| **Admin** | `WHERE 1=1` (all) | `WHERE 1=1` (all) | `WHERE 1=1` (all) |
| **Agent** | `WHERE refered_by = agentId` | `WHERE agent_id = agentId` | `WHERE policy.agent = agentId` |
| **Customer** | `WHERE customer_id = customerId` | ❌ Forbidden | `WHERE customer_id = customerId` |

### Route Protection Matrix

| Route | Public | Customer | Agent | Admin |
|-------|:------:|:--------:|:-----:|:-----:|
| `/login` | ✅ | ✅ | ✅ | ✅ |
| `/` (Dashboard) | ❌ | ✅ | ✅ | ✅ |
| `/policies` | ❌ | ✅ | ✅ | ✅ |
| `/customers` | ❌ | ❌ | ✅ | ✅ |
| `/claims` | ❌ | ✅ | ✅ | ✅ |
| `/agents` | ❌ | ❌ | ❌ | ✅ |
| `/quotations` | ❌ | ❌ | ✅ | ✅ |
| `/renewals` | ❌ | ✅ | ✅ | ✅ |
| `/reports` | ❌ | ❌ | ❌ | ✅ |
| `/masters/*` | ❌ | ❌ | ❌ | ✅ |
| `/accounts/agent-brokerage` | ❌ | ❌ | ✅ | ✅ |
| `/accounts/company-brokerage` | ❌ | ❌ | ❌ | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [TanStack Start](https://tanstack.com/start) | React 19 SSR with file-based routing |
| **Language** | TypeScript | End-to-end type safety |
| **Database** | MySQL 8.0 | Relational data storage |
| **ORM** | [Prisma](https://prisma.io) | Type-safe database queries |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) | Accessible, customizable components |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Charts** | [Recharts](https://recharts.org) | Dashboard visualizations |
| **State Management** | TanStack React Query | Server state with caching |
| **Routing** | TanStack Router | Type-safe file-based routing |
| **Auth** | Cookie sessions + bcrypt | Secure password hashing |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.x |
| MySQL | ≥ 8.0 |
| npm | ≥ 9.x |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/SarthakMeher19/SecureSuite-Insurance-Policy-Management-Platform.git
cd SecureSuite-Insurance-Policy-Management-Platform
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up the Database

Import the included SQL dump to set up the schema and seed data:

```bash
mysql -u root -p < panurgic_with_data.sql
```

### 4️⃣ Configure Environment

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/panirgic_with_data"
```

### 5️⃣ Generate Prisma Client

```bash
npx prisma generate
```

### 6️⃣ Start the Dev Server

```bash
npm run dev
```

The app will be available at **http://localhost:8080** 🎉

---

## 🔑 Default Login Credentials

### 👑 Admin
```
Email:    Admin@insuretechs.com
Password: Admin@123
```

### 🧑‍💼 Agents

| Agent | Email | Password |
|-------|-------|----------|
| Praneel Shah | `praneel@gmail.com` | `Agent@123` |
| Roronoa Zoro | `zoro@gmail.com` | `Agent@123` |
| Jignesh Shah | `jignesh.198@agent.com` | `Agent@123` |
| ROHIT | `rohit.199@agent.com` | `Agent@123` |
| VANDANA | `vandana.204@agent.com` | `Agent@123` |
| DEEPIKA JAIN | `deepika.211@agent.com` | `Agent@123` |
| KEYUR SHAH | `keyur.215@agent.com` | `Agent@123` |

### 👤 Customers
All customers use password: **`Customer@123`**

| Customer | Email |
|----------|-------|
| Arsh Sakariya | `arshsakaria@gmail.com` |
| Mahesh Machhi | `noemail100@gmail.com` |
| Ashwin Ahuja | `jyotisons@gmail.com` |

---

## 🏛️ Architecture

### Project Structure

```
SecureSuite/
├── prisma/
│   └── schema.prisma              # Database schema definition
├── src/
│   ├── components/
│   │   ├── forms/                  # Dialog forms (policy, customer, agent, claim, quotation)
│   │   ├── ui/                     # shadcn/ui primitives (button, dialog, select, etc.)
│   │   ├── top-nav.tsx             # Role-aware navigation bar
│   │   ├── global-search.tsx       # Role-filtered instant search
│   │   ├── page-header.tsx         # Reusable page header with actions
│   │   └── ui-bits.tsx             # KPI cards, status badges, accent colors
│   ├── lib/
│   │   ├── api/                    # Server functions (TanStack Start createServerFn)
│   │   │   ├── auth.server.ts      # Login / logout / session management
│   │   │   ├── dashboard.server.ts # Dashboard KPIs & charts (role-filtered)
│   │   │   ├── policies.server.ts  # Policy CRUD with role-based WHERE clauses
│   │   │   ├── customers.server.ts # Customer CRUD (agent sees own, admin sees all)
│   │   │   ├── agents.server.ts    # Agent management (admin + self-view)
│   │   │   ├── claims.server.ts    # Claims workflow (role-filtered)
│   │   │   ├── brokerages.server.ts# Commission tracking (role-filtered)
│   │   │   ├── quotations.server.ts# Quote management (admin/agent only)
│   │   │   ├── search.server.ts    # Global search (role-filtered results)
│   │   │   ├── masters.server.ts   # Master data CRUD (admin-only)
│   │   │   └── payments.server.ts  # Payment records (role-filtered)
│   │   ├── auth-middleware.ts      # requireSession(), requireRole() helpers
│   │   ├── role-context.tsx        # React context for role & session state
│   │   ├── db.ts                   # Prisma client singleton
│   │   └── utils.ts                # Utility functions (CSV export, formatting)
│   ├── routes/                     # File-based routing (TanStack Router)
│   │   ├── __root.tsx              # Root layout with auth guard & navigation
│   │   ├── login.tsx               # Login page (email + password)
│   │   ├── index.tsx               # Dashboard (Admin / Agent / Customer views)
│   │   ├── policies.index.tsx      # Policies list with search & filters
│   │   ├── policies.$id.tsx        # Policy detail with endorsements & payments
│   │   ├── customers.tsx           # Customers list (admin/agent guard)
│   │   ├── customers.$id.tsx       # Customer detail with policies & claims
│   │   ├── claims.tsx              # Claims management page
│   │   ├── agents.tsx              # Agents page (admin-only guard)
│   │   ├── quotations.tsx          # Quotations (admin/agent guard)
│   │   ├── renewals.tsx            # Renewal tracking page
│   │   ├── reports.tsx             # Reports & exports (admin-only)
│   │   ├── masters.*.tsx           # Master data pages (admin-only)
│   │   └── accounts.*.tsx          # Brokerage pages (role-guarded)
│   ├── styles.css                  # Global styles & design tokens
│   └── start.ts                    # TanStack Start entry point
├── panurgic_with_data.sql          # Database dump with seed data
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite build configuration
```

### Request Flow

```
Browser Request
       │
       ▼
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  TanStack    │────▶│  beforeLoad()    │────▶│  Route Component │
│  Router      │     │  Route Guard     │     │  (React)         │
└──────────────┘     │  Check role →    │     │                  │
                     │  redirect if     │     │  useQuery() →    │
                     │  unauthorized    │     │  calls serverFn  │
                     └──────────────────┘     └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  createServerFn  │
                                              │                  │
                                              │  1. requireSession()
                                              │  2. requireRole()│
                                              │  3. Build WHERE  │
                                              │     clause from  │
                                              │     session      │
                                              │  4. Prisma query │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │    MySQL 8.0     │
                                              │   (Prisma ORM)   │
                                              └─────────────────┘
```

---

## 📡 API Reference

All APIs are implemented as TanStack Start **server functions** (`createServerFn`). They run server-side and are automatically called via RPC from the client.

### Authentication

| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `loginUser` | POST | Public | Authenticate with email & password |
| `logoutUser` | POST | Any | Clear session cookie |
| `getSession` | GET | Any | Get current session data |

### Policies

| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `getPolicies` | GET | Any *(filtered)* | List policies for current user's role |
| `getPolicyById` | GET | Any *(ownership check)* | Get policy detail with payments & claims |
| `createPolicy` | POST | Admin, Agent | Create a new policy |
| `updatePolicy` | POST | Admin, Agent *(own)* | Update policy details |
| `deletePolicy` | POST | Admin | Delete a policy |

### Customers

| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `getCustomers` | GET | Admin, Agent *(filtered)* | List customers |
| `getCustomerById` | GET | Any *(ownership check)* | Customer detail with policies |
| `createCustomer` | POST | Admin, Agent | Add new customer |
| `updateCustomer` | POST | Admin, Agent *(own)* | Update customer profile |
| `deleteCustomer` | POST | Admin | Delete a customer |

### Dashboard

| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `getDashboardStats` | GET | Any *(filtered)* | KPI metrics for dashboard |
| `getDashboardCharts` | GET | Any *(filtered)* | Chart data (premium trends, policy mix) |
| `getUpcomingRenewals` | GET | Any *(filtered)* | Policies expiring within 60 days |

---

## 🔒 Security

### Authentication Flow

```
1. User submits email + password
2. Server looks up user in MySQL
3. bcrypt.compare(password, hashedPassword)
4. On success → setCookie("secure_suite_session", {
     id, name, role, username,
     agentId?,     // set if role === "agent"
     customerId?   // set if role === "customer"
   })
5. All subsequent requests read this cookie server-side
6. requireSession() / requireRole() enforce access on every API call
```

### Security Measures

| Measure | Implementation |
|---------|---------------|
| **Password Hashing** | bcrypt with 10 salt rounds |
| **Session Storage** | HTTP-only cookies (server-side only) |
| **Server-Side Enforcement** | Every `createServerFn` calls `requireSession()` |
| **SQL Injection Prevention** | Prisma parameterized queries |
| **Role Verification** | `requireRole()` throws 403 for unauthorized roles |
| **Data Isolation** | Prisma `WHERE` clauses filter by session identity |
| **Route Guards** | `beforeLoad()` redirects before component renders |
| **Environment Secrets** | `.env` excluded via `.gitignore` |

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 8080 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma studio` | Open Prisma Studio (visual DB editor) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using React, TypeScript, Prisma & TanStack
</p>
