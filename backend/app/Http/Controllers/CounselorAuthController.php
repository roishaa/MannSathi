<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Counselor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CounselorAuthController extends Controller
{
    public function register(Request $request)
    {
        // 1) validate data coming from React
        $validated = $request->validate([
            'name'             => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
            'specialization'   => ['nullable', 'string', 'max:255'],
            'license_no'       => ['nullable', 'string', 'max:255'],
            'experience_years' => ['nullable', 'integer', 'min:0'],
            'bio'              => ['nullable', 'string'],
        ]);

        // 2) create user with role 'counselor'
        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => 'counselor',
        ]);

        // 3) create counselor profile row
        Counselor::create([
            'user_id'          => $user->id,
            'specialization'   => $validated['specialization'] ?? null,
            'license_no'       => $validated['license_no'] ?? null,
            'experience_years' => $validated['experience_years'] ?? null,
            'bio'              => $validated['bio'] ?? null,
            'is_verified'      => false,
        ]);

        // 4) if you use Sanctum / tokens, generate token
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,   // <--- important
            ],
        ], 201);
    }
}
