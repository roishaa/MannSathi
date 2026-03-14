<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CounselorAuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\HospitalCounselorController;
use App\Http\Controllers\MoodController;
use App\Http\Controllers\Api\UserSessionController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\CounselorPublicController;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\DebugController;
use App\Http\Controllers\Api\CounselorDashboardController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\EsewaController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// ================= DEBUG ENDPOINTS =================
Route::get('/debug/bearer', function (Request $request) {
    $authHeader = $request->header('Authorization');
    $bearerToken = $request->bearerToken();

    $response = [
        'timestamp' => now()->toIso8601String(),
        'raw_auth_header' => $authHeader ?? 'NOT FOUND',
        'bearer_token_extracted' => $bearerToken ? 'YES' : 'NO',
        'bearer_token_length' => $bearerToken ? strlen($bearerToken) : 0,
    ];

    if (!$bearerToken) {
        return response()->json([
            ...$response,
            'error' => 'No Bearer token found in Authorization header',
            'hint' => 'Frontend should send: Authorization: Bearer <token>',
            'request_headers' => $request->headers->all(),
        ], 400);
    }

    $personalToken = \Laravel\Sanctum\PersonalAccessToken::findToken($bearerToken);

    if (!$personalToken) {
        return response()->json([
            ...$response,
            'token_in_db' => false,
            'error' => 'Token not found in personal_access_tokens table',
            'possible_causes' => [
                'Token was never created (login failed)',
                'Token was revoked',
                'Token belongs to a different app',
            ],
        ], 400);
    }

    $tokenable = $personalToken->tokenable;

    if (!$tokenable) {
        return response()->json([
            ...$response,
            'token_in_db' => true,
            'error' => 'Token exists but tokenable model not found (corrupted token)',
        ], 400);
    }

    return response()->json([
        ...$response,
        'token_in_db' => true,
        'status' => 'OK',
        'authenticated_user' => [
            'model_class' => get_class($tokenable),
            'id' => $tokenable->id,
            'name' => $tokenable->name ?? null,
            'email' => $tokenable->email ?? null,
            'is_user' => $tokenable instanceof \App\Models\User,
            'is_counselor' => $tokenable instanceof \App\Models\Counselor,
            'is_admin' => $tokenable instanceof \App\Models\Admin,
        ],
    ], 200);
});

Route::get('/debug/protected', function (Request $request) {
    $user = $request->user();

    return response()->json([
        'status' => 'authenticated',
        'middleware' => 'multi.auth',
        'user_class' => get_class($user),
        'user' => [
            'id' => $user->id,
            'name' => $user->name ?? null,
            'email' => $user->email ?? null,
        ],
    ]);
})->middleware('multi.auth');

// ================= DEBUG =================
Route::get('/debug/no-auth', [DebugController::class, 'noAuth']);
Route::get('/debug/check-auth', [DebugController::class, 'checkAuth'])->middleware('multi.auth');

Route::get('/debug/test-appointment', function (Request $request) {
    return response()->json([
        'message' => 'This endpoint requires authentication',
        'method' => 'GET /api/debug/test-appointment',
        'test_with_curl' => [
            'command' => 'curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:8000/api/debug/test-appointment',
            'expected_response' => 'authenticated user data',
        ]
    ]);
})->middleware('multi.auth');

// ================= TEST AUTH =================
Route::get('/test-auth', [TestController::class, 'checkAuth'])->middleware('multi.auth');

// ================= PUBLIC AUTH =================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-counselor', [CounselorAuthController::class, 'register']);
Route::post('/counselor/login', [CounselorAuthController::class, 'login']);
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/google-login', [GoogleAuthController::class, 'login']);

// ================= ESEWA CALLBACK ROUTES (PUBLIC) =================
Route::get('/esewa/success', [EsewaController::class, 'success']);
Route::get('/esewa/failure', [EsewaController::class, 'failure']);

// ================= PROTECTED ROUTES =================
Route::middleware('multi.auth')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // ================= COUNSELOR DASHBOARD =================
    Route::get('/counselor/me', [CounselorDashboardController::class, 'me']);
    Route::get('/counselor/sessions', [CounselorDashboardController::class, 'sessions']);
    Route::patch('/counselor/sessions/{id}', [CounselorDashboardController::class, 'updateSession']);
    Route::post('/counselor/sessions/{id}/accept', [CounselorDashboardController::class, 'acceptSession']);
    Route::post('/counselor/sessions/{id}/decline', [CounselorDashboardController::class, 'declineSession']);
    Route::get('/counselor/materials', [CounselorDashboardController::class, 'materials']);
    Route::post('/counselor/materials', [CounselorDashboardController::class, 'uploadMaterial']);
    Route::get('/counselor/notes', [CounselorDashboardController::class, 'getNotes']);
    Route::post('/counselor/notes', [CounselorDashboardController::class, 'saveNotes']);
    Route::get('/content/shared', [CounselorDashboardController::class, 'sharedContent']);

    // ================= COUNSELORS =================
    Route::get('/counselors', [CounselorPublicController::class, 'index']);

    // ================= MOOD =================
    Route::post('/user/mood-entries', [MoodController::class, 'store']);
    Route::get('/user/mood-entries', [MoodController::class, 'history']);
    Route::get('/user/mood-report/weekly', [MoodController::class, 'weeklyReport']);
    Route::get('/user/mood-report/monthly', [MoodController::class, 'monthlyReport']);

    // Optional legacy
    Route::post('/mood', [MoodController::class, 'store']);
    Route::get('/mood/weekly', [MoodController::class, 'weekly']);
    Route::get('/mood/last-week', [MoodController::class, 'lastWeek']);

    // ================= SESSIONS =================
    Route::get('/user/sessions', [UserSessionController::class, 'index']);
    Route::get('/user/sessions/next', [UserSessionController::class, 'next']);
    Route::post('/user/sessions', [UserSessionController::class, 'store']);

    // ================= APPOINTMENTS =================
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/booked-slots', [AppointmentController::class, 'bookedSlots']);
    Route::get('/user/appointments', [AppointmentController::class, 'myAppointments']);
    Route::get('/user/appointments/next', [AppointmentController::class, 'next']);

    // ================= ESEWA PAYMENT =================
    Route::post('/esewa/pay', [EsewaController::class, 'pay']);

    // ================= HOSPITAL ADMIN =================
    Route::get('/hospital-admin/counselors', [HospitalCounselorController::class, 'index']);
    Route::put('/hospital-admin/counselors/{id}/approve', [HospitalCounselorController::class, 'approve']);
    Route::put('/hospital-admin/counselors/{id}/reject', [HospitalCounselorController::class, 'reject']);
});