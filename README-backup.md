# PartSphere (PartNexa) — Circular E-Commerce Platform

PartSphere is a high-performance circular e-commerce platform for automotive spare parts and Do-It-For-Me (DIFM) repair services connecting:
1. **Customers / Vehicle Owners** (Customer Portal)
2. **Local Mechanical Shops** (Shop Portal)
3. **Delivery / Gig Partners** (Delivery Portal)
4. **Platform Admins** (Admin Console)

---

## 🛠️ Technology Stack

- **Backend**: Node.js + Express + TypeScript
- **ORM & Database**: Prisma ORM + PostgreSQL (Supabase)
- **Validation**: Zod (Type-safe schema validation)
- **Authentication**: JWT Access (15m) + Refresh Tokens (7d) with token rotation
- **Customer Frontend**: React 19 + Vite + React Router v6 + CSS Design System
- **Payments**: Razorpay Sandbox & Cash on Delivery (COD)

---

## 🚀 Quick Setup & Getting Started

### 1. Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+)
- A Supabase PostgreSQL database project

### 2. Environment Configuration
Make sure `backend/.env` is created and saved:
```bash
# In backend/.env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
JWT_ACCESS_SECRET="your_strong_access_secret_64chars"
JWT_REFRESH_SECRET="your_strong_refresh_secret_64chars"
PORT=5000
```
*(Refer to `backend/.env.example` for the full set of configurable options).*

### 3. Database Schema Push & Seed
From the `backend` folder:
```powershell
cd backend

# 1. Generate Prisma Client
npx prisma generate

# 2. Push Schema to Supabase Database
npm run db:push

# 3. Seed Realistic Demo Automotive Data
npm run db:seed
```

### 4. Running the Complete Application
From the root workspace directory (`c:\Users\mohdr\MR Codes\PartsNexa\Partsphare`):
```powershell
# Run both Backend API and Customer Frontend concurrently
npm run dev
```

- **Backend API**: `http://localhost:5000` (Health check: `http://localhost:5000/health`)
- **Customer Portal**: `http://localhost:5173`

---

## 🔑 Demo User Credentials

| Role | Email | Password |
|---|---|---|
| **Customer** | `demo@partsphere.in` | `Demo@1234` |
| **Admin** | `admin@partsphere.in` | `Admin@1234` |
| **Shop 1 (Bangalore)** | `apex.shop@partsphere.in` | `Shop@1234` |
| **Shop 2 (Mumbai)** | `speedy.shop@partsphere.in` | `Shop@1234` |
| **Shop 3 (Delhi)** | `sai.clinic@partsphere.in` | `Shop@1234` |
| **Delivery Partner** | `rider.rajesh@partsphere.in` | `Rider@1234` |

---

## 📂 Architecture & Modules

```
backend/
├── prisma/
│   ├── schema.prisma        # 20+ models covering all 4 roles
│   └── seed.ts              # Rich automotive demo seed script
├── src/
│   ├── config/              # Typed env config & Prisma singleton
│   ├── middleware/          # JWT auth, Zod validation, Rate limiter, Error handler
│   ├── utils/               # AppError, JWT, Response helpers, Atomic transaction guards
│   ├── modules/
│   │   ├── auth/            # Register, Login, Refresh, Logout, Me
│   │   ├── users/           # Profile & Address book CRUD
│   │   ├── vehicles/        # Vehicle master data & My Garage
│   │   ├── catalog/         # Categories, Brands, Products & Vehicle Compatibility
│   │   ├── shops/           # Shop listings & verification
│   │   ├── delivery/        # Delivery partners & secure KYC object storage references
│   │   ├── subscriptions/   # Tiered maintenance plans & feature entitlements
│   │   ├── usedparts/       # Used parts verification & resale payout
│   │   ├── crm/             # Vehicle service history & maintenance reminders
│   │   └── audit/           # Audit trail logging
│   ├── app.ts               # Express TypeScript app
│   └── server.ts            # Server bootstrap & connection verification
```
