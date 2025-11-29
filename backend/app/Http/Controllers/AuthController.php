<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST /api/register
    public function register(Request $request)
    {
        // 1) Validate incoming data
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        // 2) Create user
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            
        ]);

        // 3) Create API token
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4) Return JSON
        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    // POST /api/login
    public function login(Request $request)
    {
        // 1) Validate
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // 2) Find user
        $user = User::where('email', $data['email'])->first();

        // 3) Check password
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // optional: only allow one active token
        $user->tokens()->delete();

        // 4) Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5) Return JSON
        return response()->json([
            'user'  => $user,
            'token' => $token,
            'role'  => $user->role,
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out',
        ]);
    }
}
