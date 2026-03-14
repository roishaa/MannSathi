<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DebugController extends Controller
{
    public function checkAuth(Request $request)
    {
        $headers = $request->headers->all();
        $authHeader = $request->header('Authorization');
        $token = $request->bearerToken();
        
        \Log::info('Debug Auth Request', [
            'has_auth_header' => !empty($authHeader),
            'auth_header' => $authHeader,
            'bearer_token' => $token,
            'all_headers' => $headers,
        ]);

        return response()->json([
            'has_authorization_header' => !empty($authHeader),
            'authorization_header' => $authHeader,
            'bearer_token' => $token,
            'user' => $request->user(),
            'authenticated' => !is_null($request->user()),
        ]);
    }

    public function noAuth()
    {
        return response()->json([
            'message' => 'This endpoint works without auth',
            'timestamp' => now(),
        ]);
    }
}
