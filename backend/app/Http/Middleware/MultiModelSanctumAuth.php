<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\User;
use App\Models\Counselor;
use App\Models\HospitalAdmin;
use App\Models\PlatformAdmin;

class MultiModelSanctumAuth
{
    /**
     * Handle an incoming request and authenticate against multiple models.
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Find the token in personal_access_tokens table
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return response()->json(['message' => 'Invalid token.'], 401);
        }

        // Get the tokenable (the model that owns this token)
        $tokenable = $accessToken->tokenable;

        if (!$tokenable) {
            return response()->json(['message' => 'Token owner not found.'], 401);
        }

        // Set the authenticated user for the request
        $request->setUserResolver(function () use ($tokenable) {
            return $tokenable;
        });

        return $next($request);
    }
}
