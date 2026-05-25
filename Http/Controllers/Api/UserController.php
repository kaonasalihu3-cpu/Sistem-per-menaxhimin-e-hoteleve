<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Throwable;

class UserController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $users = User::query()->with('roles')->latest()->get();
        return $this->success('Users fetched successfully.', UserResource::collection($users));
    }

    public function show(int $id): JsonResponse
    {
        $user = User::query()->with('roles')->find($id);
        if (!$user) {
            return $this->error('User not found.', null, 404);
        }

        return $this->success('User fetched successfully.', new UserResource($user));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        try {
            $payload = $request->validated();
            $user = User::query()->create([
                'emri' => $payload['emri'],
                'mbiemri' => $payload['mbiemri'],
                'email' => strtolower($payload['email']),
                'password_hash' => Hash::make($payload['password']),
                'phone_number' => $payload['phone_number'] ?? null,
                'email_confirmed' => false,
                'lockout_enabled' => true,
                'access_failed_count' => 0,
                'data_krijimit' => Carbon::now(),
                'statusi' => $payload['statusi'],
            ]);

            return $this->success('User created successfully.', new UserResource($user), 201);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to create user.', null, 500);
        }
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = User::query()->find($id);
        if (!$user) {
            return $this->error('User not found.', null, 404);
        }

        try {
            $payload = $request->validated();
            $updates = [
                'emri' => $payload['emri'],
                'mbiemri' => $payload['mbiemri'],
                'email' => strtolower($payload['email']),
                'phone_number' => $payload['phone_number'] ?? null,
                'statusi' => $payload['statusi'],
            ];

            if (!empty($payload['password'])) {
                $updates['password_hash'] = Hash::make($payload['password']);
            }

            $user->update($updates);

            return $this->success('User updated successfully.', new UserResource($user->fresh('roles')));
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to update user.', null, 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::query()->find($id);
        if (!$user) {
            return $this->error('User not found.', null, 404);
        }

        try {
            $user->delete();
            return $this->success('User deleted successfully.', null);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to delete user.', null, 500);
        }
    }

    public function activate(int $id): JsonResponse
    {
        $user = User::query()->find($id);
        if (!$user) {
            return $this->error('User not found.', null, 404);
        }

        $user->update(['statusi' => 'active']);
        return $this->success('User activated successfully.', new UserResource($user->fresh('roles')));
    }

    public function deactivate(int $id): JsonResponse
    {
        $user = User::query()->find($id);
        if (!$user) {
            return $this->error('User not found.', null, 404);
        }

        $user->update(['statusi' => 'inactive']);
        return $this->success('User deactivated successfully.', new UserResource($user->fresh('roles')));
    }
}
