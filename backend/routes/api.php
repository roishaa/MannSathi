<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CounselorAuthController;
use App\Http\Controllers\MoodController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\HospitalCounselorController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// ================= PUBLIC AUTH =================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register-counselor', [CounselorAuthController::class, 'register']);
Route::post('/counselor/login', [CounselorAuthController::class, 'login']);

// ✅ ================= ADMIN AUTH (PUBLIC) =================
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// Optional (only if you still want old endpoints working for now)
// Route::post('/platform/login', [AdminAuthController::class, 'platformLogin']);
// Route::post('/hospital-admin/login', [AdminAuthController::class, 'hospitalLogin']);

// ================= PROTECTED ROUTES =================
Route::middleware('multi.auth')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/mood', [MoodController::class, 'store']);
    Route::get('/mood/weekly', [MoodController::class, 'weekly']);
    Route::get('/mood/last-week', [MoodController::class, 'lastWeek']);

    // Hospital Admin protected routes (Sanctum)
    Route::get('/hospital-admin/counselors', [HospitalCounselorController::class, 'index']);
    Route::put('/hospital-admin/counselors/{id}/approve', [HospitalCounselorController::class, 'approve']);
    Route::put('/hospital-admin/counselors/{id}/reject', [HospitalCounselorController::class, 'reject']);
});
