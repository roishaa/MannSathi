<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function checkAuth(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'authenticated' => false,
                'message' => 'Not authenticated',
                'token_received' => $request->bearerToken() ? 'yes' : 'no',
            ], 401);
        }

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name ?? 'N/A',
                'email' => $user->email ?? 'N/A',
                'type' => get_class($user),
            ],
            'message' => 'Successfully authenticated'
        ]);
    }
}
