<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use Carbon\Carbon;

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
            ->whereIn('status', ['confirmed', 'completed', 'scheduled', 'pending'])
            ->orderBy('date_time', 'asc')
            ->get()
            ->map(function ($session) {
                $dt = $session->date_time ? Carbon::parse($session->date_time) : null;

                return [
                    'id' => $session->id,
                    'counselor_id' => $session->counselor_id,
                    'counselor_name' => $session->counselor->name ?? 'Counselor not assigned',

                    'date_time' => $dt ? $dt->format('Y-m-d H:i:s') : null,
                    'date' => $dt ? $dt->format('Y-m-d') : null,
                    'time' => $dt ? $dt->format('H:i') : null,

                    'type' => $session->type ?? 'chat',
                    'status' => $session->status ?? 'pending',
                    'payment_status' => $session->payment_status ?? 'paid',
                    'meeting_link' => $session->meeting_link ?? null,
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
            ->whereIn('status', ['confirmed', 'scheduled', 'pending'])
            ->orderBy('date_time', 'asc')
            ->first();

        if (!$nextSession) {
            return response()->json(['session' => null], 200);
        }

        $dt = $nextSession->date_time ? Carbon::parse($nextSession->date_time) : null;

        return response()->json([
            'session' => [
                'id' => $nextSession->id,
                'counselor_id' => $nextSession->counselor_id,
                'counselor_name' => $nextSession->counselor->name ?? 'Counselor not assigned',

                'date_time' => $dt ? $dt->format('Y-m-d H:i:s') : null,
                'date' => $dt ? $dt->format('Y-m-d') : null,
                'time' => $dt ? $dt->format('H:i') : null,

                'type' => $nextSession->type ?? 'chat',
                'status' => $nextSession->status ?? 'pending',
                'payment_status' => $nextSession->payment_status ?? 'paid',
                'meeting_link' => $nextSession->meeting_link ?? null,
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

        $dt = Carbon::parse($data['date_time']);

        $appt = Appointment::create([
            'user_id' => $user->id,
            'counselor_id' => $data['counselor_id'],
            'date_time' => $dt->format('Y-m-d H:i:s'),
            'type' => $data['type'] ?? 'chat',
            'status' => 'confirmed',
        ]);

        return response()->json([
            'message' => 'Booked successfully',
            'data' => [
                'id' => $appt->id,
                'user_id' => $appt->user_id,
                'counselor_id' => $appt->counselor_id,
                'date_time' => $dt->format('Y-m-d H:i:s'),
                'date' => $dt->format('Y-m-d'),
                'time' => $dt->format('H:i'),
                'type' => $appt->type,
                'status' => $appt->status,
            ]
        ], 201);
    }
}