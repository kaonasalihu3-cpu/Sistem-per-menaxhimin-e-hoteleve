<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class RefreshTokenService
{
    public function createForUser(User $user): RefreshToken
    {
        $days = (int) config('auth_custom.refresh_token_days', 14);
        $now = Carbon::now();

        return RefreshToken::query()->create([
            'user_id' => $user->id,
            'token' => hash('sha256', Str::uuid() . '|' . Str::random(80)),
            'created' => $now,
            'expires' => $now->copy()->addDays($days),
            'revoked' => null,
        ]);
    }

    public function revoke(string $token): void
    {
        RefreshToken::query()
            ->where('token', $token)
            ->whereNull('revoked')
            ->update(['revoked' => Carbon::now()]);
    }

    public function revokeAllForUser(User $user): void
    {
        RefreshToken::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked')
            ->update(['revoked' => Carbon::now()]);
    }

    public function isUsable(RefreshToken $refreshToken): bool
    {
        if ($refreshToken->isRevoked()) {
            return false;
        }

        return !$refreshToken->isExpired();
    }
}

