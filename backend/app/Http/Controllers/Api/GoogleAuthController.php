<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Google\Client as GoogleClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'token' => ['required', 'string'],
        ]);

        $client = new GoogleClient([
            'client_id' => env('GOOGLE_CLIENT_ID'),
        ]);

        $payload = $client->verifyIdToken($request->token);

        if (!$payload) {
            return response()->json([
                'message' => 'Invalid Google token.'
            ], 401);
        }

        $googleId = $payload['sub'] ?? null;
        $email = $payload['email'] ?? null;
        $name = $payload['name'] ?? 'Google User';
        $avatar = $payload['picture'] ?? null;

        if (!$googleId || !$email) {
            return response()->json([
                'message' => 'Google account information is incomplete.'
            ], 422);
        }

        $user = User::where('email', $email)->first();

        if ($user) {
            if (!$user->google_id) {
                $user->google_id = $googleId;
            }

            $user->provider = 'google';
            $user->avatar = $avatar;
            if (!$user->email_verified_at) {
                $user->email_verified_at = now();
            }
            $user->save();
        } else {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
                'google_id' => $googleId,
                'provider' => 'google',
                'avatar' => $avatar,
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Google login successful.',
            'token' => $token,
            'user' => $user,
        ]);
    }
}