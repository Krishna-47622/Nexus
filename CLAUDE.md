# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Campus Utility App repository.

## Project Overview

**Name**: Campus Utility App — Multi-Tenant Institutional Platform

A comprehensive multi-tenant SaaS application for college students to manage canteen orders, sports equipment borrowing, print jobs, and hostel leave/outpasses. The platform supports role-scoped access for students, staff, college admins, and platform admins.

## Tech Stack

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3
- **Security**: Spring Security with Stateless JWT Authentication
- **Database**: PostgreSQL (via Supabase or H2 for local development)
- **Dependencies**: Spring Web, Data JPA, Security, Validation, H2/PostgreSQL, JJWT (JSON Web Tokens), OpenCSV
- **Build Tool**: Maven (Spring Boot Maven Wrapper)

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context (AuthContext)
- **API Client**: Axios

## Quick Start

### Backend
```bash
cd backend
# Using Maven wrapper or local Maven
mvn clean spring-boot:run
```
- Backend API runs on `http://localhost:8080`
- Seeded Platform Admin: `admin` / `1234`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Frontend app runs on `http://localhost:3000`

## Project Structure

### Backend (`backend/`)
- `pom.xml` – Maven configuration (Spring Boot 3, Java 17, JJWT 0.12.5)
- `src/main/java/com/campus/utility/` – Core application packages
  - `com.campus.utility.security` – Security configuration, JWT token provider
  - `com.campus.utility.controller` – REST API controllers (AuthController, etc.)
  - `com.campus.utility.service` – Business logic services
  - `com.campus.utility.repository` – JPA repositories
  - `com.campus.utility.entity` – Domain entities (User, College, etc.)
- `src/main/resources` – Configuration files (application.properties)

### Frontend (`frontend/`)
- `src/pages/` – Page components organized by role
  - `auth/` – Login and platform admin authentication pages
  - `student/` – Student-facing pages (canteen, sports, print jobs, leave requests)
  - `staff/` – Staff-facing pages (canteen staff, sports staff, warden records)
  - `admin/` – Administrative pages (college admin, catalog, analytics)
- `src/context/` – React Context providers (AuthContext for auth state)
- `src/api/client.ts` – Axios instance for API calls
- `src/components/` – Reusable UI components
- `src/App.tsx` – Main application entry point

## Architecture

### Authentication Flow
1. **Login** – User submits credentials via `AuthController` → receives JWT token
2. **Token Validation** – `JwtAuthenticationFilter` validates JWT on each request
3. **Authorization** – Spring Security filters (`@PreAuthorize`) enforce role-based access control
4. **Multi-tenancy** – Every query is scoped by `college_id` from the JWT payload
5. **Session Management** – Stateless JWT tokens (no server-side sessions)

### Key Components
- **`JwtTokenProvider`** – Generates and validates JWT tokens (Spring Security)
- **`JwtAuthenticationFilter`** – Servlet filter that intercepts requests and validates tokens
- **`AuthContext`** – React Context managing authentication state (user, college, permissions)
- **`AuthController`** – Handles login, platform login, password reset, and token creation
- **`TenantContext`** – Manages tenant (college) context for multi-tenant isolation

## Development Commands

### Backend
- `mvn clean spring-boot:run` – Build and start the Spring Boot application
- `mvn test` – Run unit tests
- `mvn compile` – Compile the project

### Frontend
- `npm run dev` – Start the Vite development server
- `npm run build` – Build for production
- `npm run preview` – Preview the built application locally

## Common Operations

### Building
- **Backend**: `mvn clean package` (or `mvn clean spring-boot:run` for running)
- **Frontend**: `npm run dev` (development) or `npm run build` (production)

### Testing
- Unit tests reside in `src/test/java` (not shown in the structure above)
- Integration tests can be executed with `mvn test`

### Running Locally
1. Start the backend: `cd backend && mvn clean spring-boot:run`
2. Start the frontend: `cd frontend && npm run dev`
3. Access the app at `http://localhost:8080` (backend) and `http://localhost:3000` (frontend)

## Security Considerations
- All API endpoints are secured with JWT authentication
- Role-based access control (RBAC) protects sensitive operations
- Multi-tenant isolation ensures users only see data from their college
- Passwords are hashed with BCrypt
- JWT tokens are stateless and expire after a configurable period

## Next Steps
1. Review the `AuthController` and `JwtAuthenticationFilter` for login/logout flow
2. Check the `AuthContext` for state management patterns
3. Examine the frontend `LoginPage` and `PlatformAdminLoginPage` for authentication UI
4. Review the `StudentProfile`, `CanteenMenu`, and `SportsBrowse` pages for frontend routing
5. Look at the design system files (`stitch_campus_utility_portal/*/DESIGN.md`) for component specifications

## References
- **README.md** – Project overview and quickstart guide
- **stitch_campus_utility_portal/*/DESIGN.md** – Design system specifications (Institutional Logic & Institutional Modern)
- **backend/pom.xml** – Technology stack and dependencies
- **frontend/package.json** – Frontend dependencies and scripts