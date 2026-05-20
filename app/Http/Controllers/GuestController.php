<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuestRequest;
use App\Http\Requests\UpdateGuestRequest;
use App\Http\Resources\GuestResource;
use App\Models\Guest;
use Illuminate\Http\JsonResponse;
use Throwable;

class GuestController extends Controller
{
    public function index(): JsonResponse
    {
        $guests = Guest::query()->withCount('reservations')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Guests fetched successfully.',
            'data' => GuestResource::collection($guests),
        ]);
    }

    public function store(StoreGuestRequest $request): JsonResponse
    {
        try {
            $guest = Guest::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Guest created successfully.',
                'data' => new GuestResource($guest),
            ], 201);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to create guest.', $exception);
        }
    }

    public function show(int $id): JsonResponse
    {
        $guest = Guest::query()->withCount('reservations')->find($id);

        if (!$guest) {
            return response()->json([
                'success' => false,
                'message' => 'Guest not found.',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Guest fetched successfully.',
            'data' => new GuestResource($guest),
        ]);
    }

    public function update(UpdateGuestRequest $request, int $id): JsonResponse
    {
        $guest = Guest::query()->find($id);

        if (!$guest) {
            return response()->json([
                'success' => false,
                'message' => 'Guest not found.',
                'data' => null,
            ], 404);
        }

        try {
            $guest->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Guest updated successfully.',
                'data' => new GuestResource($guest->fresh()),
            ]);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to update guest.', $exception);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $guest = Guest::query()->withCount('reservations')->find($id);

        if (!$guest) {
            return response()->json([
                'success' => false,
                'message' => 'Guest not found.',
                'data' => null,
            ], 404);
        }

        if ($guest->reservations_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Guest cannot be deleted because reservations exist.',
                'data' => null,
            ], 422);
        }

        try {
            $guest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Guest deleted successfully.',
                'data' => null,
            ]);
        } catch (Throwable $exception) {
            return $this->serverError('Failed to delete guest.', $exception);
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