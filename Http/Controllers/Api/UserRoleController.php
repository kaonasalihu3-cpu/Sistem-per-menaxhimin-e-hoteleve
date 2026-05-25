<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\AssignRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Throwable;

class UserRoleController extends Controller
{
    use ApiResponse;

    public function index(int $id): JsonResponse
    {
        $user = User::query()->with('roles')->find($id);
        if (!$user) {
            return $this->error('User not found.', null, 404);
        }

        return $this->success(
            'User roles fetched successfully.',
            RoleResource::collection($user->roles)
        );
    }

    public function store(AssignRoleRequest $request, int $id): JsonResponse
    {
        $user = User::query()->with('roles')->find($id);
        if (!$user) {
            return $this->error('User not found.', null, 404);
        }

        $roleId = (int) $request->validated()['role_id'];
        $role = Role::query()->find($roleId);
        if (!$role) {
            return $this->error('Role not found.', null, 404);
        }

        if ($user->roles->contains('id', $roleId)) {
            return $this->error('Duplicate role assignment is not allowed.', [
                'role_id' => ['Role already assigned to this user.'],
            ], 422);
        }

        try {
            $user->roles()->attach($roleId);
            $user->load('roles');

            return $this->success('Role assigned successfully.', RoleResource::collection($user->roles));
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to assign role.', null, 500);
        }
    }

    public function destroy(int $id, int $roleId): JsonResponse
    {
        $user = User::query()->with('roles')->find($id);
        if (!$user) {
            return $this->error('User not found.', null, 404);
        }

        if (!$user->roles->contains('id', $roleId)) {
            return $this->error('Role is not assigned to this user.', [
                'role_id' => ['Role is not assigned to this user.'],
            ], 404);
        }

        try {
            $user->roles()->detach($roleId);
            $user->load('roles');

            return $this->success('Role removed successfully.', RoleResource::collection($user->roles));
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to remove role.', null, 500);
        }
    }
}

