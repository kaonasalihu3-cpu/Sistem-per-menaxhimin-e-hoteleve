<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\RevokeRefreshTokenRequest;
use App\Http\Resources\UserResource;
use App\Models\RefreshToken;
use App\Models\Role;
use App\Models\User;
use App\Services\JwtService;
use App\Services\RefreshTokenService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Throwable;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly JwtService $jwtService,
        private readonly RefreshTokenService $refreshTokenService
    ) {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = DB::transaction(function () use ($request) {
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
                    'statusi' => 'active',
                ]);

                $defaultRole = Role::query()->where('normalized_name', 'user')->first();
                if ($defaultRole) {
                    $user->roles()->syncWithoutDetaching([$defaultRole->id]);
                }

                return $user->load('roles');
            });

            return $this->success('User registered successfully.', new UserResource($user), 201);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to register user.', null, 500);
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $user = User::query()->with('roles')->where('email', strtolower($payload['email']))->first();

        if (!$user || !Hash::check($payload['password'], $user->password_hash)) {
            if ($user) {
                $user->increment('access_failed_count');
            }

            return $this->error('Invalid email or password.', [
                'credentials' => ['Invalid email or password.'],
            ], 401);
        }

        if ($user->lockout_enabled && $user->access_failed_count >= 5) {
            return $this->error('Account is temporarily locked due to failed attempts.', null, 423);
        }

        if ($user->statusi !== 'active') {
            return $this->error('User is inactive and cannot log in.', [
                'statusi' => ['User is inactive.'],
            ], 403);
        }

        $user->update(['access_failed_count' => 0]);

        try {
            $accessToken = $this->jwtService->issueToken($user);
            $refreshToken = $this->refreshTokenService->createForUser($user);

            return $this->success('Login successful.', [
                'access_token' => $accessToken,
                'token_type' => 'Bearer',
                'expires_in_minutes' => (int) config('auth_custom.access_token_ttl', 15),
                'refresh_token' => $refreshToken->token,
                'refresh_token_expires' => $refreshToken->expires,
                'user' => new UserResource($user),
            ]);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Login failed. Token generation error.', null, 500);
        }
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->loadMissing('roles');

        return $this->success('Profile fetched successfully.', new UserResource($user));
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $refreshToken = $request->input('refresh_token');

        if (is_string($refreshToken) && $refreshToken !== '') {
            $this->refreshTokenService->revoke($refreshToken);
        } else {
            $this->refreshTokenService->revokeAllForUser($user);
        }

        return $this->success('Logout successful.', null);
    }

    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        $tokenValue = $request->validated()['refresh_token'];
        $refreshToken = RefreshToken::query()->with('user.roles')->where('token', $tokenValue)->first();

        if (!$refreshToken) {
            return $this->error('Invalid refresh token.', [
                'refresh_token' => ['Refresh token not found.'],
            ], 401);
        }

        if (!$this->refreshTokenService->isUsable($refreshToken)) {
            return $this->error('Refresh token is expired or revoked.', [
                'refresh_token' => ['Refresh token is expired or revoked.'],
            ], 401);
        }

        $user = $refreshToken->user;
        if (!$user || $user->statusi !== 'active') {
            return $this->error('User is inactive.', [
                'statusi' => ['User is inactive.'],
            ], 403);
        }

        try {
            $this->refreshTokenService->revoke($tokenValue);

            $newAccessToken = $this->jwtService->issueToken($user);
            $newRefreshToken = $this->refreshTokenService->createForUser($user);

            return $this->success('Token refreshed successfully.', [
                'access_token' => $newAccessToken,
                'token_type' => 'Bearer',
                'expires_in_minutes' => (int) config('auth_custom.access_token_ttl', 15),
                'refresh_token' => $newRefreshToken->token,
                'refresh_token_expires' => $newRefreshToken->expires,
            ]);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to refresh token.', null, 500);
        }
    }

    public function revokeRefreshToken(RevokeRefreshTokenRequest $request): JsonResponse
    {
        $tokenValue = $request->validated()['refresh_token'];
        $this->refreshTokenService->revoke($tokenValue);

        return $this->success('Refresh token revoked successfully.', null);
    }
}
