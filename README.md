# Campus Utility App — Multi-Tenant Institutional Platform

A comprehensive multi-tenant SaaS application empowering college students to order canteen food, borrow sports equipment, submit print jobs, and request hostel leave/outpasses through a single login, paired with role-scoped staff, warden, college admin, and platform admin dashboards.

---

## Technical Stack

- **Backend**: Java 17, Spring Boot 3, Spring Security (Stateless JWT Auth), Spring Data JPA.
- **Database**: PostgreSQL via Supabase (or H2 in-memory for local development/testing).
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (flat institutional theme, 4-6px sharp border radius, `#1E3A5F` navy primary accent).
- **Payments**: Passthrough UPI Intent (`upi://pay?pa=...&am=...&tn=...`) without stored balance or wallet liability.
- **File Storage**: Supabase Storage buckets.

---

## Quickstart & Local Setup

### 1. Run the Spring Boot Backend

```bash
cd backend
# Using Maven Wrapper or local Maven
mvn clean spring-boot:run
```

- Backend API running on `http://localhost:8080`
- Seeded Platform Admin: `admin` / `1234`

### 2. Run the React Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend App running on `http://localhost:3000`

---

## Multi-Tenancy & Dynamic RBAC Security

1. **Tenant Scoping**: Every domain table holds a `college_id` foreign key. `TenantContext` & `JwtAuthenticationFilter` automatically isolate queries per college.
2. **Top-Down Account Provisioning**: Self-service registration is disabled. Platform Admins create Colleges & College Admins; College Admins bulk-import students via CSV and provision staff.
3. **Dynamic RBAC**: Dynamic permissions checked via `@PreAuthorize` method security.

---

## Project Structure

- `/backend`: Spring Boot 3 REST API application
- `/frontend`: React 18 + TypeScript + Vite application
- `/stitch_campus_utility_portal`: Reference Stitch design screens
