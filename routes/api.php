<?php

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