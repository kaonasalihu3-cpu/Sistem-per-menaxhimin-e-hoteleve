<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckInOutController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\InvoiceItemController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\RoomTypeController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ServiceOrderController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserRoleController;
use App\Http\Middleware\EnsureUserIsActiveMiddleware;
use App\Http\Middleware\JwtAuthMiddleware;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is running.',
        'data' => [
            'service' => 'hoteli-backend',
            'timestamp' => now()->toDateTimeString(),
        ],
    ]);
});

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
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('/dashboard/recent-reservations', [DashboardController::class, 'recentReservations']);
        Route::get('/dashboard/recent-payments', [DashboardController::class, 'recentPayments']);
        Route::get('/dashboard/revenue-chart', [DashboardController::class, 'revenueChart']);
        Route::get('/dashboard/occupancy-chart', [DashboardController::class, 'occupancyChart']);

        Route::get('/reports/reservations', [ReportController::class, 'reservations']);
        Route::get('/reports/income-summary', [ReportController::class, 'incomeSummary']);
        Route::get('/reports/service-usage', [ReportController::class, 'serviceUsage']);
        Route::get('/reports/occupancy-rate', [ReportController::class, 'occupancyRate']);

        Route::get('/staff', [StaffController::class, 'index']);
        Route::get('/staff/{id}', [StaffController::class, 'show'])->whereNumber('id');
        Route::post('/staff', [StaffController::class, 'store']);
        Route::put('/staff/{id}', [StaffController::class, 'update'])->whereNumber('id');
        Route::delete('/staff/{id}', [StaffController::class, 'destroy'])->whereNumber('id');

        Route::get('/services', [ServiceController::class, 'index']);
        Route::get('/services/{id}', [ServiceController::class, 'show'])->whereNumber('id');
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{id}', [ServiceController::class, 'update'])->whereNumber('id');
        Route::delete('/services/{id}', [ServiceController::class, 'destroy'])->whereNumber('id');

        Route::get('/service-orders', [ServiceOrderController::class, 'index']);
        Route::get('/service-orders/{id}', [ServiceOrderController::class, 'show'])->whereNumber('id');
        Route::post('/service-orders', [ServiceOrderController::class, 'store']);
        Route::put('/service-orders/{id}', [ServiceOrderController::class, 'update'])->whereNumber('id');
        Route::delete('/service-orders/{id}', [ServiceOrderController::class, 'destroy'])->whereNumber('id');

        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::get('/invoices/{id}', [InvoiceController::class, 'show'])->whereNumber('id');
        Route::post('/invoices/generate/{reservationId}', [InvoiceController::class, 'generate'])->whereNumber('reservationId');
        Route::put('/invoices/{id}', [InvoiceController::class, 'update'])->whereNumber('id');
        Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy'])->whereNumber('id');
        Route::patch('/invoices/{id}/pay', [InvoiceController::class, 'pay'])->whereNumber('id');
        Route::patch('/invoices/{id}/cancel', [InvoiceController::class, 'cancel'])->whereNumber('id');

        Route::get('/invoices/{invoiceId}/items', [InvoiceItemController::class, 'index'])->whereNumber('invoiceId');
        Route::post('/invoices/{invoiceId}/items', [InvoiceItemController::class, 'store'])->whereNumber('invoiceId');
        Route::put('/invoice-items/{id}', [InvoiceItemController::class, 'update'])->whereNumber('id');
        Route::delete('/invoice-items/{id}', [InvoiceItemController::class, 'destroy'])->whereNumber('id');

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
