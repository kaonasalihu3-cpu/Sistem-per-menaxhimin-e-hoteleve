# Hoteli - Room & Room Type Management Module

This workspace contains a full implementation of the Room & Room Type module for a Hotel Management System.

## Project Structure

- `backend/` Laravel API module code
- `frontend/` ReactJS UI module code

## Backend (Laravel + MySQL)

Implemented:
- `room_types` and `rooms` migrations
- models (`RoomType`, `Room`) and relationships
- enum-based room status handling
- full CRUD controllers for room types and rooms
- request validation classes
- API routes
- room filters:
  - `status`
  - `room_type_id`
  - `min_price` / `max_price` (by room type price)
  - `capacity` (minimum capacity)
  - `search` (room number)

## Frontend (ReactJS)

Implemented:
- Room Types page (list/create/edit/delete)
- Rooms page (list/create/edit/delete + filters + search)
- Room form modal with room type select, room details, and status
- Room detail page
- status-based colors:
  - available (green)
  - occupied (red)
  - maintenance (orange)
- loading and error states
- Axios API integration

## Run Commands

### 1) Backend

Create a Laravel app in `backend` (or copy these files into your existing Laravel backend) and run:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure MySQL in `.env`, then run:

```bash
php artisan migrate
php artisan serve
```

API base URL:

`http://localhost:8000/api`

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Frontend Environment

Set:

`VITE_API_BASE_URL=http://localhost:8000/api`

in `frontend/.env`.

## API Endpoints

Room Types:
- `GET /api/room-types`
- `POST /api/room-types`
- `GET /api/room-types/{id}`
- `PUT /api/room-types/{id}`
- `DELETE /api/room-types/{id}`

Rooms:
- `GET /api/rooms`
- `POST /api/rooms`
- `GET /api/rooms/{id}`
- `PUT /api/rooms/{id}`
- `DELETE /api/rooms/{id}`

## Notes

- `room_number` is unique.
- `room_type_id` must exist.
- `status` is restricted to `available`, `occupied`, `maintenance`.
- `capacity` and `price_per_night` are validated as positive values.
- response data includes `can_be_reserved` so occupied/maintenance rooms are clearly non-reservable.
