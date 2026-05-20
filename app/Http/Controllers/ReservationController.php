<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Reservation::query()
            ->with(['guest', 'room.roomType', 'checkInOut'])
            ->latest();

        if ($request->filled('guest_id')) {
            $query->where('guest_id', $request->integer('guest_id'));
        }

        if ($request->filled('room_id')) {
            $query->where('room_id', $request->integer('room_id'));
        }

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->string('statusi')->toString());
        }

        if ($request->filled('date_from')) {
            $query->whereDate('data_hyrjes', '>=', $request->string('date_from')->toString());
        }

        if ($request->filled('date_to')) {
            $query->whereDate('data_daljes', '<=', $request->string('date_to')->toString());
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($q) use ($search) {
                $q->whereHas('guest', function ($guestQuery) use ($search) {
                    $guestQuery->where('emri', 'like', '%' . $search . '%')
                        ->orWhere('mbiemri', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                })->orWhereHas('room', function ($roomQuery) use ($search) {
                    $roomQuery->where('room_number', 'like', '%' . $search . '%');
                });
            });
        }

        $reservations = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Reservations fetched successfully.',
            'data' => ReservationResource::collection($reservations),
            'meta' => [
                'statuses' => ReservationStatus::values(),
                'total' => $reservations->count(),
            ],
        ]);
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $room = Room::query()->find($payload['room_id']);
        if ((int) $payload['nr_personave'] > (int) $room->capacity) {
            return response()->json([
                'success' => false,
                'message' => 'Number of persons exceeds room capacity.',
                'data' => null,
                'errors' => [
                    'nr_personave' => ['Number of persons exceeds room capacity.'],
                ],
            ], 422);
        }

        $isActiveReservation = in_array($payload['statusi'], ReservationStatus::activeForAvailability(), true);
        if ($isActiveReservation && !$this->isRoomAvailable($payload['room_id'], $payload['data_hyrjes'], $payload['data_daljes'])) {
            return response()->json([
                'success' => false,
                'message' => 'Room is not available for the selected interval.',
                'data' => null,
                'errors' => [
                    'room_id' => ['Room is not available for the selected interval.'],
                ],
            ], 422);
        }

        try {
            $reservation = Reservation::create($payload);
            $reservation->load(['guest', 'room.roomType', 'checkInOut']);

            return response()->json([
                'success' => true,
                'message' => 'Reservation created successfully.',
                'data' => new ReservationResource($reservation),
            ], 201);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to create reservation.', $exception);
        }
    }

    public function show(int $id): JsonResponse
    {
        $reservation = Reservation::query()
            ->with(['guest', 'room.roomType', 'checkInOut'])
            ->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Reservation fetched successfully.',
            'data' => new ReservationResource($reservation),
        ]);
    }

    public function update(UpdateReservationRequest $request, int $id): JsonResponse
    {
        $reservation = Reservation::query()->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found.',
                'data' => null,
            ], 404);
        }

        $payload = $request->validated();

        $room = Room::query()->find($payload['room_id']);
        if ((int) $payload['nr_personave'] > (int) $room->capacity) {
            return response()->json([
                'success' => false,
                'message' => 'Number of persons exceeds room capacity.',
                'data' => null,
                'errors' => [
                    'nr_personave' => ['Number of persons exceeds room capacity.'],
                ],
            ], 422);
        }

        $isActiveReservation = in_array($payload['statusi'], ReservationStatus::activeForAvailability(), true);
        if ($isActiveReservation && !$this->isRoomAvailable($payload['room_id'], $payload['data_hyrjes'], $payload['data_daljes'], $reservation->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Room is not available for the selected interval.',
                'data' => null,
                'errors' => [
                    'room_id' => ['Room is not available for the selected interval.'],
                ],
            ], 422);
        }

        try {
            $reservation->update($payload);
            $reservation->load(['guest', 'room.roomType', 'checkInOut']);

            return response()->json([
                'success' => true,
                'message' => 'Reservation updated successfully.',
                'data' => new ReservationResource($reservation),
            ]);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to update reservation.', $exception);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $reservation = Reservation::query()->with('checkInOut')->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found.',
                'data' => null,
            ], 404);
        }

        try {
            if ($reservation->checkInOut) {
                $reservation->checkInOut->delete();
            }
            $reservation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Reservation deleted successfully.',
                'data' => null,
            ]);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to delete reservation.', $exception);
        }
    }

    public function checkAvailability(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'data_hyrjes' => ['required', 'date'],
            'data_daljes' => ['required', 'date', 'after:data_hyrjes'],
            'exclude_reservation_id' => ['nullable', 'integer', 'exists:reservations,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'data' => null,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $available = $this->isRoomAvailable(
            (int) $data['room_id'],
            (string) $data['data_hyrjes'],
            (string) $data['data_daljes'],
            $data['exclude_reservation_id'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => $available ? 'Room is available.' : 'Room is not available.',
            'data' => [
                'available' => $available,
            ],
        ]);
    }

    protected function isRoomAvailable(int $roomId, string $from, string $to, ?int $excludeReservationId = null): bool
    {
        $query = Reservation::query()
            ->where('room_id', $roomId)
            ->whereIn('statusi', ReservationStatus::activeForAvailability())
            ->overlapping($from, $to);

        if ($excludeReservationId) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return !$query->exists();
    }

    protected function serverError(string $message, Throwable $exception): JsonResponse
    {
        report($exception);

        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
        ], 500);
    }
}