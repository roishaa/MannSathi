<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CounselorAuthController;
use App\Http\Controllers\MoodController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register-counselor', [CounselorAuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/mood', [MoodController::class, 'store']);
    Route::get('/mood/weekly', [MoodController::class, 'weekly']);
    Route::get('/mood/last-week', [MoodController::class, 'lastWeek']);
});
