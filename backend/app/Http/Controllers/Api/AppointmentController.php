<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    // POST /api/appointments
    public function store(Request $request)
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'counselor_id' => ['required', 'integer'],
            'date_time'    => ['required', 'date'],  // e.g., "2025-12-25 14:30"
            'type'         => ['nullable', 'string', Rule::in(['chat', 'video'])],
        ]);

        // Prevent double booking: same counselor + same date_time (pending/confirmed)
        $conflict = Appointment::where('counselor_id', $data['counselor_id'])
            ->where('date_time', $data['date_time'])
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'This slot is already booked. Please choose another time.'
            ], 409);
        }

        $appointment = Appointment::create([
            'user_id'      => $userId,
            'counselor_id' => $data['counselor_id'],
            'date_time'    => $data['date_time'],
            'type'         => $data['type'] ?? 'chat',
            'status'       => 'pending',
        ]);

        return response()->json([
            'message' => 'Appointment created',
            'appointment' => $appointment
        ], 201);
    }

    // GET /api/user/appointments (optional but useful)
    public function myAppointments()
    {
        $userId = auth()->id();
        if (!$userId) return response()->json(['message' => 'Unauthenticated'], 401);

        $items = Appointment::where('user_id', $userId)
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->get();

        return response()->json(['items' => $items]);
    }

    // GET /api/user/appointments/next
    public function next()
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $now = now();
        $appointment = Appointment::with('counselor:id,name,specialization')
            ->where('user_id', $userId)
            ->where('date_time', '>=', $now)
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('date_time', 'asc')
            ->first();

        return response()->json(['item' => $appointment], 200);
    }
}
