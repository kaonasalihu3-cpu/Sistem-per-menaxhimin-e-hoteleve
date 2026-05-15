<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckInOutController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\RoomTypeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserRoleController;
use App\Http\Middleware\EnsureUserIsActiveMiddleware;
use App\Http\Middleware\JwtAuthMiddleware;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

Route::middleware([JwtAuthMiddleware::class, EnsureUserIsActiveMiddleware::class])
    ->prefix('auth')
    ->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/revoke-refresh-token', [AuthController::class, 'revokeRefreshToken']);
        Route::get('/me', [AuthController::class, 'me']);
    });

Route::middleware([
    JwtAuthMiddleware::class,
    EnsureUserIsActiveMiddleware::class,
    RoleMiddleware::class . ':admin',
])->group(function (): void {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show'])->whereNumber('id');
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update'])->whereNumber('id');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->whereNumber('id');
    Route::patch('/users/{id}/activate', [UserController::class, 'activate'])->whereNumber('id');
    Route::patch('/users/{id}/deactivate', [UserController::class, 'deactivate'])->whereNumber('id');

    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/roles/{id}', [RoleController::class, 'show'])->whereNumber('id');
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{id}', [RoleController::class, 'update'])->whereNumber('id');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->whereNumber('id');

    Route::post('/users/{id}/roles', [UserRoleController::class, 'store'])->whereNumber('id');
    Route::delete('/users/{id}/roles/{roleId}', [UserRoleController::class, 'destroy'])
        ->whereNumber('id')
        ->whereNumber('roleId');
    Route::get('/users/{id}/roles', [UserRoleController::class, 'index'])->whereNumber('id');
});

Route::middleware([
    JwtAuthMiddleware::class,
    EnsureUserIsActiveMiddleware::class,
])->group(function (): void {
    Route::middleware([RoleMiddleware::class . ':admin|manager|user'])->group(function (): void {
        Route::get('/room-types', [RoomTypeController::class, 'index']);
        Route::get('/room-types/{id}', [RoomTypeController::class, 'show'])->whereNumber('id');

        Route::get('/rooms', [RoomController::class, 'index']);
        Route::get('/rooms/{id}', [RoomController::class, 'show'])->whereNumber('id');

        Route::get('/guests', [GuestController::class, 'index']);
        Route::get('/guests/{id}', [GuestController::class, 'show'])->whereNumber('id');

        Route::get('/reservations', [ReservationController::class, 'index']);
        Route::get('/reservations/availability', [ReservationController::class, 'checkAvailability']);
        Route::get('/reservations/{id}', [ReservationController::class, 'show'])->whereNumber('id');

        Route::get('/check-in-outs', [CheckInOutController::class, 'index']);
        Route::get('/check-in-outs/{id}', [CheckInOutController::class, 'show'])->whereNumber('id');
    });

    Route::middleware([RoleMiddleware::class . ':admin|manager'])->group(function (): void {
        Route::post('/room-types', [RoomTypeController::class, 'store']);
        Route::put('/room-types/{id}', [RoomTypeController::class, 'update'])->whereNumber('id');
        Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy'])->whereNumber('id');

        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{id}', [RoomController::class, 'update'])->whereNumber('id');
        Route::delete('/rooms/{id}', [RoomController::class, 'destroy'])->whereNumber('id');

        Route::post('/guests', [GuestController::class, 'store']);
        Route::put('/guests/{id}', [GuestController::class, 'update'])->whereNumber('id');
        Route::delete('/guests/{id}', [GuestController::class, 'destroy'])->whereNumber('id');

        Route::post('/reservations', [ReservationController::class, 'store']);
        Route::put('/reservations/{id}', [ReservationController::class, 'update'])->whereNumber('id');
        Route::delete('/reservations/{id}', [ReservationController::class, 'destroy'])->whereNumber('id');
        Route::post('/reservations/{reservationId}/check-in', [CheckInOutController::class, 'checkIn'])->whereNumber('reservationId');
        Route::post('/reservations/{reservationId}/check-out', [CheckInOutController::class, 'checkOut'])->whereNumber('reservationId');

        Route::post('/check-in-outs', [CheckInOutController::class, 'store']);
        Route::put('/check-in-outs/{id}', [CheckInOutController::class, 'update'])->whereNumber('id');
        Route::delete('/check-in-outs/{id}', [CheckInOutController::class, 'destroy'])->whereNumber('id');
    });
});

