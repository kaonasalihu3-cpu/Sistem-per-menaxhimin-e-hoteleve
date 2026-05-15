<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        /** @var User|null $user */
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        $allowedRoles = array_map(
            static fn (string $role): string => strtolower(trim($role)),
            explode('|', $roles)
        );

        $userRoles = $user->roles->pluck('normalized_name')->all();
        $hasAccess = count(array_intersect($allowedRoles, $userRoles)) > 0;

        if (!$hasAccess) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. You do not have required role.',
            ], 403);
        }

        return $next($request);
    }
}
