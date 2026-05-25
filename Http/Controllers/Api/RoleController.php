<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Throwable;

class RoleController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $roles = Role::query()->withCount('users')->latest()->get();
        return $this->success('Roles fetched successfully.', RoleResource::collection($roles));
    }

    public function show(int $id): JsonResponse
    {
        $role = Role::query()->withCount('users')->find($id);
        if (!$role) {
            return $this->error('Role not found.', null, 404);
        }

        return $this->success('Role fetched successfully.', new RoleResource($role));
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        try {
            $payload = $request->validated();
            $normalized = strtolower($payload['normalized_name'] ?? $payload['emertimi']);

            $role = Role::query()->create([
                'emertimi' => $payload['emertimi'],
                'pershkrimi' => $payload['pershkrimi'] ?? null,
                'normalized_name' => $normalized,
            ]);

            return $this->success('Role created successfully.', new RoleResource($role), 201);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to create role.', null, 500);
        }
    }

    public function update(UpdateRoleRequest $request, int $id): JsonResponse
    {
        $role = Role::query()->find($id);
        if (!$role) {
            return $this->error('Role not found.', null, 404);
        }

        try {
            $payload = $request->validated();
            $role->update([
                'emertimi' => $payload['emertimi'],
                'pershkrimi' => $payload['pershkrimi'] ?? null,
                'normalized_name' => strtolower($payload['normalized_name'] ?? $payload['emertimi']),
            ]);

            return $this->success('Role updated successfully.', new RoleResource($role->fresh()));
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to update role.', null, 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $role = Role::query()->withCount('users')->find($id);
        if (!$role) {
            return $this->error('Role not found.', null, 404);
        }

        if ($role->users_count > 0) {
            return $this->error('Role cannot be deleted because users are assigned.', [
                'role' => ['Role has assigned users.'],
            ], 422);
        }

        try {
            $role->delete();
            return $this->success('Role deleted successfully.', null);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to delete role.', null, 500);
        }
    }
}
