<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class JwtAuthMiddleware
{
    public function __construct(
        private readonly JwtService $jwtService
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Access token is missing.',
            ], 401);
        }

        try {
            $payload = $this->jwtService->decodeAndValidate($token);
            $userId = (int) ($payload['sub'] ?? 0);
            $user = User::query()->with('roles')->find($userId);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. User not found.',
                ], 401);
            }

            $request->setUserResolver(static fn () => $user);
            $request->attributes->set('jwt_payload', $payload);
        } catch (Throwable $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Invalid or expired token.',
            ], 401);
        }

        return $next($request);
    }
}

