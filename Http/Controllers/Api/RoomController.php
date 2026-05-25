<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoomStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class RoomController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Room::query()->with('roomType');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('room_type_id')) {
            $query->where('room_type_id', $request->integer('room_type_id'));
        }

        if ($request->filled('capacity')) {
            $query->where('capacity', '>=', $request->integer('capacity'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where('room_number', 'like', '%' . $search . '%');
        }

        if ($request->filled('min_price') || $request->filled('max_price')) {
            $minPrice = $request->input('min_price');
            $maxPrice = $request->input('max_price');

            $query->whereHas('roomType', function ($roomTypeQuery) use ($minPrice, $maxPrice) {
                if ($minPrice !== null && $minPrice !== '') {
                    $roomTypeQuery->where('price_per_night', '>=', (float) $minPrice);
                }

                if ($maxPrice !== null && $maxPrice !== '') {
                    $roomTypeQuery->where('price_per_night', '<=', (float) $maxPrice);
                }
            });
        }

        $rooms = $query
            ->orderBy('floor')
            ->orderBy('room_number')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Rooms fetched successfully.',
            'data' => RoomResource::collection($rooms),
            'meta' => [
                'statuses' => RoomStatus::values(),
                'total' => $rooms->count(),
            ],
        ]);
    }

    public function store(StoreRoomRequest $request): JsonResponse
    {
        try {
            $room = Room::create($request->validated());
            $room->load('roomType');

            return response()->json([
                'success' => true,
                'message' => 'Room created successfully.',
                'data' => new RoomResource($room),
            ], 201);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to create room.', $exception);
        }
    }

    public function show(int $id): JsonResponse
    {
        $room = Room::query()->with('roomType')->find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Room fetched successfully.',
            'data' => new RoomResource($room),
        ]);
    }

    public function update(UpdateRoomRequest $request, int $id): JsonResponse
    {
        $room = Room::query()->find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found.',
            ], 404);
        }

        try {
            $room->update($request->validated());
            $room->load('roomType');

            return response()->json([
                'success' => true,
                'message' => 'Room updated successfully.',
                'data' => new RoomResource($room),
            ]);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to update room.', $exception);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $room = Room::query()->find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found.',
            ], 404);
        }

        try {
            $room->delete();

            return response()->json([
                'success' => true,
                'message' => 'Room deleted successfully.',
            ]);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to delete room.', $exception);
        }
    }

    protected function serverError(string $message, Throwable $exception): JsonResponse
    {
        report($exception);

        return response()->json([
            'success' => false,
            'message' => $message,
        ], 500);
    }
}

