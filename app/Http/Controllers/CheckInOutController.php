<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckInRequest;
use App\Http\Requests\CheckOutRequest;
use App\Http\Requests\StoreCheckInOutRequest;
use App\Http\Requests\UpdateCheckInOutRequest;
use App\Http\Resources\CheckInOutResource;
use App\Models\CheckInOut;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

class CheckInOutController extends Controller
{
    public function index(): JsonResponse
    {
        $items = CheckInOut::query()
            ->with('reservation.room')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Check-in/out records fetched successfully.',
            'data' => CheckInOutResource::collection($items),
        ]);
    }

    public function store(StoreCheckInOutRequest $request): JsonResponse
    {
        try {
            $item = CheckInOut::create($request->validated());
            $item->load('reservation.room');

            return response()->json([
                'success' => true,
                'message' => 'Check-in/out record created successfully.',
                'data' => new CheckInOutResource($item),
            ], 201);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to create check-in/out record.', $exception);
        }
    }

    public function show(int $id): JsonResponse
    {
        $item = CheckInOut::query()->with('reservation.room')->find($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Check-in/out record not found.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Check-in/out record fetched successfully.',
            'data' => new CheckInOutResource($item),
        ]);
    }

    public function update(UpdateCheckInOutRequest $request, int $id): JsonResponse
    {
        $item = CheckInOut::query()->find($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Check-in/out record not found.',
                'data' => null,
            ], 404);
        }

        try {
            $payload = $request->validated();
            if (
                isset($payload['data_checkin'], $payload['data_checkout']) &&
                Carbon::parse($payload['data_checkout'])->lt(Carbon::parse($payload['data_checkin']))
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Check-out date must be after or equal to check-in date.',
                    'data' => null,
                    'errors' => [
                        'data_checkout' => ['Check-out date must be after or equal to check-in date.'],
                    ],
                ], 422);
            }

            $item->update($payload);
            $item->load('reservation.room');

            return response()->json([
                'success' => true,
                'message' => 'Check-in/out record updated successfully.',
                'data' => new CheckInOutResource($item),
            ]);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to update check-in/out record.', $exception);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $item = CheckInOut::query()->find($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Check-in/out record not found.',
                'data' => null,
            ], 404);
        }

        try {
            $item->delete();

            return response()->json([
                'success' => true,
                'message' => 'Check-in/out record deleted successfully.',
                'data' => null,
            ]);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to delete check-in/out record.', $exception);
        }
    }

    public function checkIn(CheckInRequest $request, int $reservationId): JsonResponse
    {
        try {
            $record = DB::transaction(function () use ($request, $reservationId) {
                $reservation = Reservation::query()
                    ->with(['room', 'checkInOut'])
                    ->lockForUpdate()
                    ->find($reservationId);

                if (!$reservation) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Reservation not found.',
                        'data' => null,
                    ], 404);
                }

                $status = $reservation->statusi->value ?? $reservation->statusi;
                if (!in_array($status, [ReservationStatus::PENDING->value, ReservationStatus::CONFIRMED->value], true)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Check-in is allowed only for pending or confirmed reservations.',
                        'data' => null,
                    ], 422);
                }

                if ($reservation->checkInOut && $reservation->checkInOut->data_checkin) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Reservation is already checked in.',
                        'data' => null,
                    ], 422);
                }

                $checkInAt = $request->input('data_checkin') ?: now();
                $notes = $request->input('shenime');

                $checkInOut = $reservation->checkInOut
                    ? tap($reservation->checkInOut)->update([
                        'data_checkin' => $checkInAt,
                        'shenime' => $notes ?? $reservation->checkInOut->shenime,
                    ])
                    : CheckInOut::query()->create([
                        'reservation_id' => $reservation->id,
                        'data_checkin' => $checkInAt,
                        'shenime' => $notes,
                    ]);

                $reservation->update([
                    'statusi' => ReservationStatus::CHECKED_IN->value,
                ]);

                $reservation->room->update([
                    'status' => RoomStatus::OCCUPIED->value,
                ]);

                $checkInOut->load('reservation.room');

                return response()->json([
                    'success' => true,
                    'message' => 'Check-in completed successfully.',
                    'data' => new CheckInOutResource($checkInOut),
                ]);
            });

            return $record;
        } catch (Throwable $exception) {
            return $this->serverError('Failed to perform check-in.', $exception);
        }
    }

    public function checkOut(CheckOutRequest $request, int $reservationId): JsonResponse
    {
        try {
            $record = DB::transaction(function () use ($request, $reservationId) {
                $reservation = Reservation::query()
                    ->with(['room', 'checkInOut'])
                    ->lockForUpdate()
                    ->find($reservationId);

                if (!$reservation) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Reservation not found.',
                        'data' => null,
                    ], 404);
                }

                if (!$reservation->checkInOut || !$reservation->checkInOut->data_checkin) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Check-out is not allowed before check-in.',
                        'data' => null,
                    ], 422);
                }

                if ($reservation->checkInOut->data_checkout) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Reservation is already checked out.',
                        'data' => null,
                    ], 422);
                }

                $checkOutAt = Carbon::parse($request->input('data_checkout') ?: now());
                if ($checkOutAt->lt(Carbon::parse($reservation->checkInOut->data_checkin))) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Check-out date must be after check-in date.',
                        'data' => null,
                        'errors' => [
                            'data_checkout' => ['Check-out date must be after check-in date.'],
                        ],
                    ], 422);
                }

                $mergedNotes = trim(implode("\n", array_filter([
                    $reservation->checkInOut->shenime,
                    $request->input('shenime'),
                ])));

                $reservation->checkInOut->update([
                    'data_checkout' => $checkOutAt,
                    'shenime' => $mergedNotes !== '' ? $mergedNotes : null,
                ]);

                $reservation->update([
                    'statusi' => ReservationStatus::COMPLETED->value,
                ]);

                $reservation->room->update([
                    'status' => RoomStatus::AVAILABLE->value,
                ]);

                $reservation->checkInOut->load('reservation.room');

                return response()->json([
                    'success' => true,
                    'message' => 'Check-out completed successfully.',
                    'data' => new CheckInOutResource($reservation->checkInOut),
                ]);
            });

            return $record;
        } catch (Throwable $exception) {
            return $this->serverError('Failed to perform check-out.', $exception);
        }
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