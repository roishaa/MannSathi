<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CounselorNote;
use App\Models\Appointment;

class CounselorNotesController extends Controller
{
    public function store(Request $request, $appointmentId)
{
    $request->validate(['notes' => 'required|string']);

    $appointmentId = (int) $appointmentId;

    $appointment = Appointment::where('id', $appointmentId)
        ->whereNotNull('user_id')
        ->first();

    if (!$appointment) {
        return response()->json(['message' => 'Appointment not found.'], 404);
    }

    $user = $request->user();

    $note = CounselorNote::updateOrCreate(
        ['appointment_id' => $appointmentId],
        [
            'counselor_id' => $appointment->counselor_id,
            'user_id'      => $appointment->user_id,
            'notes'        => $request->notes,
        ]
    );

    return response()->json(['message' => 'Notes saved successfully.', 'note' => $note], 200);
}
    public function show(Request $request, $appointmentId)
    {
        $user = $request->user();

        $appointment = Appointment::find($appointmentId);

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        if ($user->role === 'counselor' && $appointment->counselor_id !== $user->id) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        if ($user->role === 'user' || $user->role === 'patient') {
            if ($appointment->user_id !== $user->id) {
                return response()->json(['message' => 'Access denied.'], 403);
            }

            $sessionEnd = \Carbon\Carbon::parse($appointment->date_time)->addMinutes(60);
            if (now()->lt($sessionEnd) && $appointment->status !== 'completed') {
                return response()->json(['message' => 'Notes are only available after the session ends.'], 403);
            }
        }

        $note = CounselorNote::where('appointment_id', $appointmentId)->first();

        return response()->json(['note' => $note], 200);
    }

    public function counselorHistory(Request $request)
    {
        $counselor = $request->user();
        $limit = $request->query('limit', 10);

        $sessions = Appointment::with(['user', 'counselorNote'])
            ->where('counselor_id', $counselor->id)
            ->whereNotNull('user_id')
            ->where(function ($q) {
                $q->where('status', 'completed')
                  ->orWhere('date_time', '<', now()->subMinutes(60));
            })
            ->orderBy('date_time', 'desc')
            ->paginate($limit);

        return response()->json($sessions, 200);
    }

    public function userHistory(Request $request)
    {
        $user = $request->user();
        $limit = $request->query('limit', 10);

        $sessions = Appointment::with(['counselor', 'counselorNote'])
            ->where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('status', 'completed')
                  ->orWhere('date_time', '<', now()->subMinutes(60));
            })
            ->orderBy('date_time', 'desc')
            ->paginate($limit);

        return response()->json($sessions, 200);
    }

    public function adminHistory(Request $request)
    {
        $limit = $request->query('limit', 15);

        $query = Appointment::with(['user', 'counselor', 'counselorNote'])
            ->whereNotNull('user_id')
            ->where(function ($q) {
                $q->where('status', 'completed')
                  ->orWhere('date_time', '<', now()->subMinutes(60));
            });

        if ($request->query('counselor_id')) {
            $query->where('counselor_id', $request->query('counselor_id'));
        }

        $sessions = $query->orderBy('date_time', 'desc')->paginate($limit);

        return response()->json($sessions, 200);
    }
}