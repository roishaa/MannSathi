<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Message;
use App\Models\User;
use App\Models\Counselor;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ChatController extends Controller
{
    public function index(Request $request, $appointmentId)
    {
        $appointment = Appointment::findOrFail($appointmentId);

        $authCheck = $this->authorizeParticipant($request, $appointment);
        if ($authCheck !== true) {
            return $authCheck;
        }

        $timeCheck = $this->ensureChatAccessible($appointment, false);
        if ($timeCheck !== true) {
            return $timeCheck;
        }

        $messages = Message::where('appointment_id', $appointment->id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'appointment_id' => $msg->appointment_id,
                    'sender_type' => $msg->sender_type,
                    'sender_id' => $msg->sender_id,
                    'message' => $msg->content,
                    'created_at' => $msg->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'messages' => $messages,
        ]);
    }

    public function store(Request $request, $appointmentId)
    {
        $appointment = Appointment::findOrFail($appointmentId);

        $authCheck = $this->authorizeParticipant($request, $appointment);
        if ($authCheck !== true) {
            return $authCheck;
        }

        $timeCheck = $this->ensureChatAccessible($appointment, true);
        if ($timeCheck !== true) {
            return $timeCheck;
        }

        $request->validate([
            'message' => 'required|string',
        ]);

        $authUser = $request->user();

        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized sender.',
            ], 401);
        }

        $senderType = null;
        $senderId = $authUser->id;

        // 🔥 Determine role from appointment ownership, not from guard
        if ((int) $appointment->counselor_id === (int) $authUser->id) {
            $senderType = 'counselor';
        } elseif ((int) $appointment->user_id === (int) $authUser->id) {
            $senderType = 'user';
        }

        if (!$senderType) {
            return response()->json([
                'success' => false,
                'message' => 'You are not allowed to send messages in this chat.',
            ], 403);
        }

        $message = Message::create([
            'appointment_id' => $appointment->id,
            'sender_type' => $senderType,
            'sender_id' => $senderId,
            'content' => $request->message,
        ]);

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'appointment_id' => $message->appointment_id,
                'sender_type' => $message->sender_type,
                'sender_id' => $message->sender_id,
                'message' => $message->content,
                'created_at' => $message->created_at,
            ],
        ], 201);
    }

    private function authorizeParticipant(Request $request, Appointment $appointment)
    {
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        if ((int) $appointment->counselor_id === (int) $authUser->id) {
            return true;
        }

        if ((int) $appointment->user_id === (int) $authUser->id) {
            return true;
        }

        return response()->json([
            'success' => false,
            'message' => 'You are not allowed to access this chat.',
        ], 403);
    }

    private function ensureChatAccessible(Appointment $appointment, bool $forSending = false)
    {
        if (strtolower((string) $appointment->status) !== 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'Chat is only available for confirmed appointments.',
            ], 403);
        }

        if (!$appointment->date_time) {
            return response()->json([
                'success' => false,
                'message' => 'Session time could not be determined.',
            ], 403);
        }

        $start = Carbon::parse($appointment->date_time);
        $end = (clone $start)->addHour();
        $now = now();

        if ($now->lt($start)) {
            return response()->json([
                'success' => false,
                'message' => 'Chat is locked until the scheduled time.',
                'chat_unlocked_at' => $start->toDateTimeString(),
            ], 403);
        }

        if ($forSending && $now->gt($end)) {
            return response()->json([
                'success' => false,
                'message' => 'This session has ended. Chat is now read-only.',
            ], 403);
        }

        return true;
    }
}