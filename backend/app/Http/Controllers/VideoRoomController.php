<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;

class VideoRoomController extends Controller
{
    /**
     * POST /api/appointments/{id}/create-video-room
     * With Jitsi we don't need to create a room — just verify the appointment
     * is a video type and return the Jitsi room name.
     */
    public function createRoom(Request $request, $id)
    {
        $user = $request->user();

        $appointment = Appointment::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('counselor_id', $user->id);
            })
            ->first();

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        if ($appointment->type !== 'video') {
            return response()->json(['message' => 'This is not a video appointment.'], 400);
        }

        // Generate Jitsi room name from appointment ID
        $roomName = 'mannsathi-session-' . $appointment->id;
        $roomUrl  = 'https://meet.jit.si/' . $roomName;

        // Save to appointment if not already saved
        if (!$appointment->daily_room_url) {
            $appointment->daily_room_url  = $roomUrl;
            $appointment->daily_room_name = $roomName;
            $appointment->save();
        }

        return response()->json([
            'room_url'  => $roomUrl,
            'room_name' => $roomName,
        ]);
    }

    /**
     * GET /api/appointments/{id}/video-room
     * Returns the Jitsi room URL for both user and counselor.
     */
    public function getRoom(Request $request, $id)
    {
        $user = $request->user();

        $appointment = Appointment::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('counselor_id', $user->id);
            })
            ->first();

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        // Generate Jitsi room name — no external API needed
        $roomName = 'mannsathi-session-' . $appointment->id;
        $roomUrl  = 'https://meet.jit.si/' . $roomName;

        return response()->json([
            'room_url'  => $roomUrl,
            'room_name' => $roomName,
        ]);
    }
}