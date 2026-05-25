# Hoteli - Hotel Management System

Sistem i plote per menaxhimin e hotelit me arkitekture `React + Laravel API + MySQL`, i integruar per perdorim ne prezantim universitar.

## Stack
- Frontend: ReactJS (Vite)
- Backend: Laravel PHP API
- Database: MySQL
- Auth: JWT + Refresh Tokens + Role-based Access

## Cfare eshte perfunduar ne pjesen e perbashket
- Integrim i unifikuar Frontend <-> Backend API.
- Auth flow i plote:
  - register
  - login
  - logout
  - refresh token
  - protected routes
  - role protected routes
- Layout global profesional:
  - responsive sidebar
  - top navbar
  - footer admin
  - logout action
  - linka per te gjitha modulet
- Dashboard kryesor:
  - total rooms
  - available/occupied/maintenance rooms
  - total/active reservations
  - total guests
  - total staff
  - total/monthly revenue
  - total payments
  - unpaid invoices
  - recent reservations
  - recent payments
  - charts (revenue, occupancy, reservation status, service usage)
- Error handling i perbashket:
  - loading states
  - error states me retry
  - flash success/error
  - axios interceptor me auto refresh
  - global React error boundary
- Seeders per demo:
  - role seed
  - admin seed
  - services seed
  - demo hotel data seed (rooms, guests, reservations, invoices, staff)

## Struktura
- `backend/` - Laravel API layer
- `frontend/` - React app

## Instalimi

### 1) Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Konfigurimi minimal ne `.env`:
```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hoteli
DB_USERNAME=root
DB_PASSWORD=
JWT_SECRET=replace_with_strong_secret
ACCESS_TOKEN_TTL=15
REFRESH_TOKEN_DAYS=14
```

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

`frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Demo Credentials
- Admin:
  - Email: `admin@hotel.com`
  - Password: `password123`

## Komanda kryesore
- Frontend dev: `npm run dev`
- Frontend build: `npm run build`
- Backend serve: `php artisan serve`
- Migrate + seed: `php artisan migrate --seed`

## Shared API endpoints (core)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/revoke-refresh-token`
- `GET /api/auth/me`

### Dashboard (Admin/Manager)
- `GET /api/dashboard/summary`
- `GET /api/dashboard/recent-reservations`
- `GET /api/dashboard/recent-payments`
- `GET /api/dashboard/revenue-chart`
- `GET /api/dashboard/occupancy-chart`

### Reports (Admin/Manager)
- `GET /api/reports/reservations`
- `GET /api/reports/income-summary`
- `GET /api/reports/service-usage`
- `GET /api/reports/occupancy-rate`

### Staff (Admin/Manager)
- `GET /api/staff`
- `GET /api/staff/{id}`
- `POST /api/staff`
- `PUT /api/staff/{id}`
- `DELETE /api/staff/{id}`

## Notes
- Sistemi perdor role:
  - `admin`
  - `manager`
  - `user`
- Route access kontrollohet nga middleware JWT + role checks.
- Frontend ruan `access_token` dhe `refresh_token`, dhe rifreskon automatikisht access token kur skadon.