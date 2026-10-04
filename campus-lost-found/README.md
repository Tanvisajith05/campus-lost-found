# Campus Lost & Found

A full-stack college-campus lost-and-found platform built with React + Vite, Node.js + Express, and MySQL.

## UX
The main dashboard opens first. A clean light UI uses rounded cards, indigo accents, responsive layout, friendly empty states, and a sidebar:
- Dashboard
- Projects — used for Lost/Found reports
- Clients — student/claim overview
- Settings

Students can register/login, report lost/found items, search/filter, view details, see explainable matches, submit claims, and track reports/claims.
Admins can review reports/claims, approve/reject, and mark items returned.

## Requirements
- Node.js 18+
- MySQL 8+

## Setup

### 1. Database
Create a MySQL database and run:

```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=campus_lost_found
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

A default admin can be created with:

```bash
npm run seed:admin
```

Default seed credentials:
- Email: admin@campus.local
- Password: Admin@12345

Change the password after first login.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Testing
The UI contains stable `data-testid` attributes for Selenium/TestNG. Backend tests can be added with Jest/Supertest; the reusable matching and validation services are isolated for unit testing.

Suggested testing:
- Unit: matching, validation, status transitions, authorization
- Functional: auth, reports, search, claims, admin
- Boundary: password 7/8/9; descriptions 499/500/501
- Negative: duplicate users, invalid IDs, invalid dates/images, unauthorized admin actions
- Integration: React → API → MySQL → matching/claims/admin
- UI automation: Selenium + TestNG
- Regression: rerun the suite after changes

## Project structure

```text
campus-lost-found/
  backend/
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      utils/
      app.js
      server.js
    uploads/
    schema.sql
    package.json
    .env.example
  frontend/
    src/
      components/
      context/
      pages/
      services/
      App.jsx
      main.jsx
      styles.css
    package.json
```
