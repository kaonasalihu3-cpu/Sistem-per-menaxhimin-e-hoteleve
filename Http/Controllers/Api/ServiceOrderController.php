<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceOrders\StoreServiceOrderRequest;
use App\Http\Requests\ServiceOrders\UpdateServiceOrderRequest;
use App\Http\Resources\ServiceOrderResource;
use App\Models\Reservation;
use App\Models\Service;
use App\Models\ServiceOrder;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ServiceOrderController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = ServiceOrder::query()
            ->with(['service', 'reservation.guest', 'reservation.room'])
            ->latest();

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->string('statusi')->toString());
        }

        if ($request->filled('reservation_id')) {
            $query->where('reservation_id', $request->integer('reservation_id'));
        }

        if ($request->filled('service_id')) {
            $query->where('service_id', $request->integer('service_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('data', '>=', $request->string('date_from')->toString());
        }

        if ($request->filled('date_to')) {
            $query->whereDate('data', '<=', $request->string('date_to')->toString());
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->whereHas('service', function ($serviceQuery) use ($search) {
                    $serviceQuery->where('emertimi', 'like', '%' . $search . '%');
                })->orWhereHas('reservation.guest', function ($guestQuery) use ($search) {
                    $guestQuery->where('emri', 'like', '%' . $search . '%')
                        ->orWhere('mbiemri', 'like', '%' . $search . '%');
                })->orWhereHas('reservation.room', function ($roomQuery) use ($search) {
                    $roomQuery->where('room_number', 'like', '%' . $search . '%');
                });
            });
        }

        $orders = $query->get();

        return $this->success('Service orders fetched successfully.', ServiceOrderResource::collection($orders));
    }

    public function show(int $id): JsonResponse
    {
        $order = ServiceOrder::query()
            ->with(['service', 'reservation.guest', 'reservation.room'])
            ->find($id);

        if (!$order) {
            return $this->error('Service order not found.', null, 404);
        }

        return $this->success('Service order fetched successfully.', new ServiceOrderResource($order));
    }

    public function store(StoreServiceOrderRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $validationError = $this->validateBusinessRules($payload['reservation_id'], $payload['service_id']);
        if ($validationError) {
            return $validationError;
        }

        try {
            $order = ServiceOrder::query()->create($payload);
            $order->load(['service', 'reservation.guest', 'reservation.room']);

            return $this->success('Service order created successfully.', new ServiceOrderResource($order), 201);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to create service order.', null, 500);
        }
    }

    public function update(UpdateServiceOrderRequest $request, int $id): JsonResponse
    {
        $order = ServiceOrder::query()->find($id);
        if (!$order) {
            return $this->error('Service order not found.', null, 404);
        }

        $payload = $request->validated();
        $validationError = $this->validateBusinessRules($payload['reservation_id'], $payload['service_id']);
        if ($validationError) {
            return $validationError;
        }

        try {
            $order->update($payload);
            $order->load(['service', 'reservation.guest', 'reservation.room']);

            return $this->success('Service order updated successfully.', new ServiceOrderResource($order));
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to update service order.', null, 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $order = ServiceOrder::query()->find($id);
        if (!$order) {
            return $this->error('Service order not found.', null, 404);
        }

        try {
            $order->delete();
            return $this->success('Service order deleted successfully.', null);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to delete service order.', null, 500);
        }
    }

    protected function validateBusinessRules(int $reservationId, int $serviceId): ?JsonResponse
    {
        $reservation = Reservation::query()->find($reservationId);
        if (!$reservation) {
            return $this->error('Reservation not found.', [
                'reservation_id' => ['Reservation does not exist.'],
            ], 422);
        }

        $reservationStatus = $reservation->statusi->value ?? $reservation->statusi;
        if ($reservationStatus === ReservationStatus::CANCELLED->value) {
            return $this->error('Service order is not allowed for cancelled reservation.', [
                'reservation_id' => ['Reservation is cancelled.'],
            ], 422);
        }

        $service = Service::query()->find($serviceId);
        if (!$service) {
            return $this->error('Service not found.', [
                'service_id' => ['Service does not exist.'],
            ], 422);
        }

        if ($service->statusi !== 'active') {
            return $this->error('Inactive service cannot be ordered.', [
                'service_id' => ['Service is inactive.'],
            ], 422);
        }

        return null;
    }
}

