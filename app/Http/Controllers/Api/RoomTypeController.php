<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoomTypeRequest;
use App\Http\Requests\UpdateRoomTypeRequest;
use App\Http\Resources\RoomTypeResource;
use App\Models\RoomType;
use Illuminate\Http\JsonResponse;
use Throwable;

class RoomTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $roomTypes = RoomType::query()
            ->withCount('rooms')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Room types fetched successfully.',
            'data' => RoomTypeResource::collection($roomTypes),
        ]);
    }

    public function store(StoreRoomTypeRequest $request): JsonResponse
    {
        try {
            $roomType = RoomType::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Room type created successfully.',
                'data' => new RoomTypeResource($roomType),
            ], 201);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to create room type.', $exception);
        }
    }

    public function show(int $id): JsonResponse
    {
        $roomType = RoomType::query()->withCount('rooms')->find($id);

        if (!$roomType) {
            return response()->json([
                'success' => false,
                'message' => 'Room type not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Room type fetched successfully.',
            'data' => new RoomTypeResource($roomType),
        ]);
    }

    public function update(UpdateRoomTypeRequest $request, int $id): JsonResponse
    {
        $roomType = RoomType::query()->find($id);

        if (!$roomType) {
            return response()->json([
                'success' => false,
                'message' => 'Room type not found.',
            ], 404);
        }

        try {
            $roomType->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Room type updated successfully.',
                'data' => new RoomTypeResource($roomType->fresh()),
            ]);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to update room type.', $exception);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $roomType = RoomType::query()->withCount('rooms')->find($id);

        if (!$roomType) {
            return response()->json([
                'success' => false,
                'message' => 'Room type not found.',
            ], 404);
        }

        if ($roomType->rooms_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Room type cannot be deleted because rooms are assigned to it.',
            ], 422);
        }

        try {
            $roomType->delete();

            return response()->json([
                'success' => true,
                'message' => 'Room type deleted successfully.',
            ]);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to delete room type.', $exception);
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

