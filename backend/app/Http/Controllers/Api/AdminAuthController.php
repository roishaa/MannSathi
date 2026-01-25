<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\PlatformAdmin;
use App\Models\HospitalAdmin;

class AdminAuthController extends Controller
{
    // ✅ NEW: One login for both platform + hospital admins
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = $request->email;
        $password = $request->password;

        // 1) Try Platform Admin
        $platform = PlatformAdmin::where('email', $email)->first();
        if ($platform && Hash::check($password, $platform->password)) {
            $token = $platform->createToken('platform_admin_token')->plainTextToken;

            return response()->json([
                'role' => 'platform_admin',
                'token' => $token,
                'admin' => [
                    'id' => $platform->id,
                    'name' => $platform->name,
                    'email' => $platform->email,
                ],
            ]);
        }

        // 2) Try Hospital Admin
        $hospital = HospitalAdmin::where('email', $email)->first();
        if ($hospital && Hash::check($password, $hospital->password)) {
            $token = $hospital->createToken('hospital_admin_token')->plainTextToken;

            return response()->json([
                'role' => 'hospital_admin',
                'token' => $token,
                'admin' => [
                    'id' => $hospital->id,
                    'name' => $hospital->name,
                    'email' => $hospital->email,
                    'hospital_id' => $hospital->hospital_id,
                    'hospital_name' => $hospital->hospital_name,
                ],
            ]);
        }

        // If neither matched
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // ✅ KEEP (optional for now): old endpoints still work
    public function platformLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $admin = PlatformAdmin::where('email', $request->email)->first();
        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $admin->createToken('platform_admin_token')->plainTextToken;

        return response()->json([
            'role' => 'platform_admin',
            'token' => $token,
            'admin' => ['id' => $admin->id, 'name' => $admin->name, 'email' => $admin->email]
        ]);
    }

    public function hospitalLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $admin = HospitalAdmin::where('email', $request->email)->first();
        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $admin->createToken('hospital_admin_token')->plainTextToken;

        return response()->json([
            'role' => 'hospital_admin',
            'token' => $token,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'hospital_id' => $admin->hospital_id,
                'hospital_name' => $admin->hospital_name
            ]
        ]);
    }
}
