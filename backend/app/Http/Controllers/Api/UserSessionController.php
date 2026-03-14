<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;

class UserSessionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $sessions = Appointment::with('counselor:id,name,email')
            ->where('user_id', $user->id)
            ->whereIn('status', ['confirmed', 'completed'])
            ->orderBy('date_time', 'asc')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'counselor_id' => $session->counselor_id,
                    'counselor_name' => $session->counselor->name ?? null,
                    'date' => $session->date_time ? date('Y-m-d', strtotime($session->date_time)) : null,
                    'time' => $session->date_time ? date('H:i', strtotime($session->date_time)) : null,
                    'type' => $session->type,
                    'status' => $session->status,
                ];
            });

        return response()->json(['items' => $sessions], 200);
    }

    public function next(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $now = now();

        $nextSession = Appointment::with('counselor:id,name,email')
            ->where('user_id', $user->id)
            ->where('date_time', '>=', $now)
            ->whereIn('status', ['confirmed'])
            ->orderBy('date_time', 'asc')
            ->first();

        if (!$nextSession) {
            return response()->json(['session' => null], 200);
        }

        return response()->json([
            'session' => [
                'id' => $nextSession->id,
                'counselor_id' => $nextSession->counselor_id,
                'counselor_name' => $nextSession->counselor->name ?? 'Counselor not assigned',
                'date' => date('Y-m-d', strtotime($nextSession->date_time)),
                'time' => date('H:i', strtotime($nextSession->date_time)),
                'type' => $nextSession->type,
                'status' => $nextSession->status,
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $request->validate([
            'counselor_id' => 'required|integer',
            'date_time' => 'required|date',
            'type' => 'nullable|string|in:chat,video',
        ]);

        $appt = Appointment::create([
            'user_id' => $user->id,
            'counselor_id' => $data['counselor_id'],
            'date_time' => $data['date_time'],
            'type' => $data['type'] ?? 'chat',
            'status' => 'confirmed',
        ]);

        return response()->json([
            'message' => 'Booked successfully',
            'data' => $appt
        ], 201);
    }
}