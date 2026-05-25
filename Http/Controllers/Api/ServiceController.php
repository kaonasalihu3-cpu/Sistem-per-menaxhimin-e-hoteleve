<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Services\StoreServiceRequest;
use App\Http\Requests\Services\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ServiceController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Service::query()->latest();

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->string('statusi')->toString());
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('emertimi', 'like', '%' . $search . '%')
                    ->orWhere('pershkrimi', 'like', '%' . $search . '%');
            });
        }

        $services = $query->get();

        return $this->success('Services fetched successfully.', ServiceResource::collection($services));
    }

    public function show(int $id): JsonResponse
    {
        $service = Service::query()->find($id);
        if (!$service) {
            return $this->error('Service not found.', null, 404);
        }

        return $this->success('Service fetched successfully.', new ServiceResource($service));
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        try {
            $service = Service::query()->create($request->validated());
            return $this->success('Service created successfully.', new ServiceResource($service), 201);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to create service.', null, 500);
        }
    }

    public function update(UpdateServiceRequest $request, int $id): JsonResponse
    {
        $service = Service::query()->find($id);
        if (!$service) {
            return $this->error('Service not found.', null, 404);
        }

        try {
            $service->update($request->validated());
            return $this->success('Service updated successfully.', new ServiceResource($service->fresh()));
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to update service.', null, 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $service = Service::query()->withCount('serviceOrders')->find($id);
        if (!$service) {
            return $this->error('Service not found.', null, 404);
        }

        if ($service->service_orders_count > 0) {
            return $this->error('Service cannot be deleted because orders exist.', [
                'service' => ['Service has related orders.'],
            ], 422);
        }

        try {
            $service->delete();
            return $this->success('Service deleted successfully.', null);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to delete service.', null, 500);
        }
    }
}

