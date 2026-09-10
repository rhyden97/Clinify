# MedC - Clinical Management System

A web-based clinical management system designed to streamline patient appointments, medical records, consultations, and doctor schedules across clinical specialties.

---

## Project Status

Current Status: In Development (Building / Work in Progress)

This application is actively being built. The backend RESTful API architecture, database schemas, validation layers, and domain services are largely established. The client-side dashboard views and interactive workflows are currently in progress. APIs and schemas may undergo refinement as development continues.

---

## Overview

MedC is structured as a full-stack platform serving three main user roles:

- Patients: Book appointments, view medical records, track prescriptions, and review laboratory files.
- Doctors: Manage daily consultations, view patient history, define availability schedules, and issue medical treatments.
- Administrators: Oversee system users, manage medical specialties, supervise doctor licensing, and track operational metrics.

---

## Tech Stack

### Backend
- Runtime: Node.js (v20+)
- Framework: Express.js (v5)
- Language: TypeScript (strict mode, ES modules)
- Database: PostgreSQL (v16) with relational schema and UUIDv7 identifiers
- Validation: Zod schemas for request validation (body, query, params)
- Authentication: JSON Web Tokens (JWT) stored in HTTP-only cookies, with bcrypt password hashing
- Security: Helmet, CORS, Cookie-parser
- Database Client: node-postgres (pg) with connection pooling

### Frontend
- Framework: React 19
- Build Tool: Vite / Vite Plus
- Language: TypeScript
- Routing: React Router (v7) with role-based protected routes
- State Management and Data Fetching: TanStack Query (v5)
- Form Handling: React Hook Form with Zod schema resolvers
- Styling: Tailwind CSS (v4)
- Icons and UI Components: Lucide React, clsx

### Infrastructure and Tooling
- Containerization: Docker and Docker Compose (PostgreSQL 16 + Adminer)
- Package Manager: pnpm

---

## Repository Structure

```
MedC/
|-- client/               # Frontend React single-page application
|   |-- public/           # Static web assets
|   |-- src/
|   |   |-- api/          # HTTP client instances and API query hooks
|   |   |-- components/   # Shared UI components and layout wrappers
|   |   |-- context/      # Authentication and global state providers
|   |   |-- hooks/        # Custom React hooks
|   |   |-- pages/        # Route views (auth, patient, doctor, admin)
|   |   |-- routes/       # Protected and public route definitions
|   |   |-- schemas/      # Client-side form validation schemas
|   |   `-- types/        # TypeScript interfaces and shared types
|   |-- package.json
|   `-- vite.config.ts
|
|-- server/               # Backend Express.js REST API
|   |-- src/
|   |   |-- config/       # Environment parsing and app configuration
|   |   |-- controllers/  # Request handlers for each domain
|   |   |-- database/     # PostgreSQL connection pool and DDL schema script
|   |   |-- middlewares/  # Authentication, role authorization, validation, error handling
|   |   |-- routes/       # Express route definitions
|   |   |-- schemas/      # Zod validation schemas
|   |   |-- services/     # Business logic and database operations
|   |   |-- utils/        # Custom error classes and helpers
|   |   `-- index.ts      # Server bootstrap and middleware registration
|   |-- docker-compose.yaml # Local PostgreSQL and Adminer setup
|   |-- package.json
|   `-- tsconfig.json
|
|-- .gitignore            # Root git ignore file
`-- README.md             # Project documentation
```

---

## Key Backend Modules

- Authentication (`/api/v1/auth`): Registration for patients, login, session validation, and secure cookie termination.
- Users (`/api/v1/users`): Profile management, password updates, and user state handling.
- Patients (`/api/v1/patients`): Demographic records, emergency contacts, and personal health metadata.
- Doctors (`/api/v1/doctors`): Medical license management, specialties assignment, and schedule configuration.
- Specialties (`/api/v1/specialties`): Medical specialty catalog management.
- Appointments (`/api/v1/appointments`): Scheduling, rescheduling, and status transitions (scheduled, completed, cancelled, no-show).
- Consultations (`/api/v1/consultations`): Doctor notes, symptoms, physical exams, and diagnostic summaries.
- Treatments (`/api/v1/treatments`): Medical prescriptions, medication dosages, and treatment instructions.
- Medical Files (`/api/v1/medical-files`): Metadata tracking for radiographs, laboratory results, and medical attachments.
- Dashboard (`/api/v1/dashboard`): Operational indicators and summary counts for administrative oversight.

---

## Getting Started

### Prerequisites
- Node.js (version 20 or higher)
- pnpm (version 9 or higher recommended)
- Docker and Docker Compose (for local database execution)

### 1. Database Setup

From the repository root, start PostgreSQL and Adminer using Docker:

```bash
cd server
docker compose up -d
```

- PostgreSQL will be available on `localhost:5432`.
- Adminer (web-based database manager) will be accessible at `http://localhost:8080`.

To initialize the schema, execute the SQL definitions found in `server/src/database/database.sql` inside the database.

### 2. Backend Setup

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Create an environment configuration file:
   ```bash
   cp .env.example .env
   ```
   Adjust the values in `.env` to match your local database credentials and desired secret keys.

3. Install backend dependencies:
   ```bash
   pnpm install
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

The backend server runs by default on `http://localhost:4000`.

### 3. Frontend Setup

1. Navigate to the client folder:
   ```bash
   cd ../client
   ```

2. Install frontend dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

The frontend development server will launch at `http://localhost:5173`.

---

## Environment Variables

The backend requires the following environment variables, configured in `server/.env`:

| Variable | Description | Default |
|---|---|---|
| SERVER_PORT | Port on which the Express server listens | 4000 |
| JWT_SECRET | Secret key for signing JSON Web Tokens (min 16 chars) | - |
| SALT_ROUNDS | Cost factor for bcrypt password hashing | 10 |
| DB_HOST | PostgreSQL host address | localhost |
| DB_PORT | PostgreSQL port number | 5432 |
| DB_USER | Database username | postgres |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | clinic |
| NODE_ENV | Runtime environment (development, production, test) | development |
| CLIENT_URL | Frontend origin URL for CORS policy | http://localhost:5173 |

---

## API Overview

All API endpoints are prefixed with `/api/v1`:

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /auth/register | Register a new patient account | Public |
| POST | /auth/login | Authenticate user and issue JWT cookie | Public |
| POST | /auth/logout | Invalidate session cookie | Authenticated |
| GET | /auth/me | Retrieve authenticated user profile | Authenticated |
| GET | /specialties | List all medical specialties | Public |
| GET | /doctors | List active doctors and specialties | Public |
| GET, POST | /appointments | Query or schedule appointments | Authenticated |
| GET, POST | /consultations | Retrieve or create clinical consultations | Authenticated |
| GET, POST | /treatments | Manage medical treatments and prescriptions | Authenticated |
| GET, POST | /medical-files | Query or register medical files and results | Authenticated |
| GET | /dashboard | Retrieve administrative metrics and statistics | Admin |

---

## Development Roadmap

- Finalize patient appointment booking flow and history views in the client.
- Complete doctor consultation interface and digital prescription creation.
- Implement file upload handling for medical documents and laboratory reports.
- Add administrative control panels for doctor schedules and specialty catalogs.
- Add automated end-to-end and unit testing coverage across endpoints.
