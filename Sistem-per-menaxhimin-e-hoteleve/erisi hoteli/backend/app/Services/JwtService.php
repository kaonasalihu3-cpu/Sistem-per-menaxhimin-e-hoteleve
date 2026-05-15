<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use RuntimeException;

class JwtService
{
    public function issueToken(User $user): string
    {
        $now = Carbon::now()->timestamp;
        $ttlMinutes = (int) config('auth_custom.access_token_ttl', 15);
        $exp = Carbon::now()->addMinutes($ttlMinutes)->timestamp;

        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT',
        ];

        $payload = [
            'iss' => config('app.url', 'hoteli-api'),
            'sub' => $user->id,
            'email' => $user->email,
            'iat' => $now,
            'exp' => $exp,
        ];

        $encodedHeader = $this->base64UrlEncode((string) json_encode($header, JSON_THROW_ON_ERROR));
        $encodedPayload = $this->base64UrlEncode((string) json_encode($payload, JSON_THROW_ON_ERROR));
        $signature = $this->sign($encodedHeader . '.' . $encodedPayload);

        return $encodedHeader . '.' . $encodedPayload . '.' . $signature;
    }

    public function decodeAndValidate(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new RuntimeException('Invalid token format.');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
        $expectedSignature = $this->sign($encodedHeader . '.' . $encodedPayload);

        if (!hash_equals($expectedSignature, $encodedSignature)) {
            throw new RuntimeException('Invalid token signature.');
        }

        $payloadJson = $this->base64UrlDecode($encodedPayload);
        $payload = json_decode($payloadJson, true, 512, JSON_THROW_ON_ERROR);

        if (!isset($payload['sub'], $payload['exp'])) {
            throw new RuntimeException('Invalid token payload.');
        }

        if ((int) $payload['exp'] < Carbon::now()->timestamp) {
            throw new RuntimeException('Token expired.');
        }

        return $payload;
    }

    protected function sign(string $data): string
    {
        $secret = (string) config('auth_custom.jwt_secret', env('JWT_SECRET'));
        if ($secret === '') {
            throw new RuntimeException('JWT secret is not configured.');
        }

        $raw = hash_hmac('sha256', $data, $secret, true);
        return $this->base64UrlEncode($raw);
    }

    protected function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    protected function base64UrlDecode(string $data): string
    {
        $padding = 4 - (strlen($data) % 4);
        if ($padding < 4) {
            $data .= str_repeat('=', $padding);
        }

        return (string) base64_decode(strtr($data, '-_', '+/'), true);
    }
}

