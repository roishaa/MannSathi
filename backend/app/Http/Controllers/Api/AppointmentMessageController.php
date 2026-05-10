<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Message;
use App\Models\User;
use App\Models\Counselor;
use Carbon\Carbon;

class AppointmentMessageController extends Controller
{
    public function index(Request $request, $appointmentId)
    {
        $appointment = Appointment::findOrFail($appointmentId);

        $authCheck = $this->authorizeAuthenticatedParticipant($request, $appointment);
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
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'message' => $m->content,
                    'sender_type' => $m->sender_type,
                    'sender_id' => $m->sender_id,
                    'created_at' => $m->created_at,
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

        $authCheck = $this->authorizeAuthenticatedParticipant($request, $appointment);
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

        $senderType = null;
        $senderId = null;

        if (auth('counselor')->check()) {
            $senderType = 'counselor';
            $senderId = auth('counselor')->id();
        } elseif (auth('sanctum')->check()) {
            $senderType = 'user';
            $senderId = auth('sanctum')->id();
        } elseif (auth()->check()) {
            $senderType = 'user';
            $senderId = auth()->id();
        }

        if (!$senderType || !$senderId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized sender.',
            ], 401);
        }

        $msg = Message::create([
            'appointment_id' => $appointment->id,
            'sender_type' => $senderType,
            'sender_id' => $senderId,
            'content' => $request->message,
        ]);

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $msg->id,
                'message' => $msg->content,
                'sender_type' => $msg->sender_type,
                'sender_id' => $msg->sender_id,
                'created_at' => $msg->created_at,
            ],
        ], 201);
    }

    public function guestMessages(Request $request, $appointmentId)
    {
        $appointment = Appointment::findOrFail($appointmentId);

        $authCheck = $this->authorizeGuestParticipant($request, $appointment);
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
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'message' => $m->content,
                    'sender_type' => $m->sender_type,
                    'sender_id' => $m->sender_id,
                    'created_at' => $m->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'messages' => $messages,
        ]);
    }

    public function guestStore(Request $request, $appointmentId)
    {
        $appointment = Appointment::findOrFail($appointmentId);

        $authCheck = $this->authorizeGuestParticipant($request, $appointment);
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

        $msg = Message::create([
            'appointment_id' => $appointment->id,
            'sender_type' => 'guest',
            'sender_id' => null,
            'content' => $request->message,
        ]);

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $msg->id,
                'message' => $msg->content,
                'sender_type' => $msg->sender_type,
                'sender_id' => $msg->sender_id,
                'created_at' => $msg->created_at,
            ],
        ], 201);
    }

    private function authorizeAuthenticatedParticipant(Request $request, Appointment $appointment)
    {
        $user = null;

        if (auth('counselor')->check()) {
            $user = auth('counselor')->user();
        } elseif (auth('sanctum')->check()) {
            $user = auth('sanctum')->user();
        } elseif (auth()->check()) {
            $user = auth()->user();
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        if ($user instanceof Counselor && (int) $appointment->counselor_id === (int) $user->id) {
            return true;
        }

        if ($user instanceof User && (int) $appointment->user_id === (int) $user->id) {
            return true;
        }

        return response()->json([
            'success' => false,
            'message' => 'You are not allowed to access this chat.',
        ], 403);
    }

    private function authorizeGuestParticipant(Request $request, Appointment $appointment)
    {
        $token = $request->query('token') ?? $request->input('token');

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Guest token is required.',
            ], 401);
        }

        $guestBooking = \App\Models\GuestBooking::where('guest_token', $token)
            ->where('appointment_id', $appointment->id)
            ->first();

        if (!$guestBooking) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid guest token.',
            ], 403);
        }

        return true;
    }

    private function ensureChatAccessible(Appointment $appointment, bool $forSending = false)
    {
        if ($appointment->status !== 'confirmed') {
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