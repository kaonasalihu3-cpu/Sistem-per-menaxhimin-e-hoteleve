<?php

use App\Http\Controllers\Api\CheckInOutController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\RoomTypeController;
use Illuminate\Support\Facades\Route;

Route::get('/room-types', [RoomTypeController::class, 'index']);
Route::post('/room-types', [RoomTypeController::class, 'store']);
Route::get('/room-types/{id}', [RoomTypeController::class, 'show'])->whereNumber('id');
Route::put('/room-types/{id}', [RoomTypeController::class, 'update'])->whereNumber('id');
Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy'])->whereNumber('id');

Route::get('/rooms', [RoomController::class, 'index']);
Route::post('/rooms', [RoomController::class, 'store']);
Route::get('/rooms/{id}', [RoomController::class, 'show'])->whereNumber('id');
Route::put('/rooms/{id}', [RoomController::class, 'update'])->whereNumber('id');
Route::delete('/rooms/{id}', [RoomController::class, 'destroy'])->whereNumber('id');

Route::get('/guests', [GuestController::class, 'index']);
Route::post('/guests', [GuestController::class, 'store']);
Route::get('/guests/{id}', [GuestController::class, 'show'])->whereNumber('id');
Route::put('/guests/{id}', [GuestController::class, 'update'])->whereNumber('id');
Route::delete('/guests/{id}', [GuestController::class, 'destroy'])->whereNumber('id');

Route::get('/reservations', [ReservationController::class, 'index']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::get('/reservations/availability', [ReservationController::class, 'checkAvailability']);
Route::get('/reservations/{id}', [ReservationController::class, 'show'])->whereNumber('id');
Route::put('/reservations/{id}', [ReservationController::class, 'update'])->whereNumber('id');
Route::delete('/reservations/{id}', [ReservationController::class, 'destroy'])->whereNumber('id');

Route::get('/check-in-outs', [CheckInOutController::class, 'index']);
Route::post('/check-in-outs', [CheckInOutController::class, 'store']);
Route::get('/check-in-outs/{id}', [CheckInOutController::class, 'show'])->whereNumber('id');
Route::put('/check-in-outs/{id}', [CheckInOutController::class, 'update'])->whereNumber('id');
Route::delete('/check-in-outs/{id}', [CheckInOutController::class, 'destroy'])->whereNumber('id');

Route::post('/reservations/{reservationId}/check-in', [CheckInOutController::class, 'checkIn'])->whereNumber('reservationId');
Route::post('/reservations/{reservationId}/check-out', [CheckInOutController::class, 'checkOut'])->whereNumber('reservationId');