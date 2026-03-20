<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuestBooking;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GuestBookingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'counselor_id' => 'required|exists:counselors,id',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
            'session_type' => 'required|in:chat,video,audio',
            'reason' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $dateTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $request->date . ' ' . $request->time
        )->format('Y-m-d H:i:s');

        $slotTaken = Appointment::where('counselor_id', $request->counselor_id)
            ->where('date_time', $dateTime)
            ->whereIn('status', ['confirmed', 'upcoming', 'active'])
            ->exists();

        if ($slotTaken) {
            return response()->json([
                'message' => 'Selected slot is already booked.'
            ], 422);
        }

        $booking = GuestBooking::create([
            'counselor_id' => $request->counselor_id,
            'guest_name' => $request->guest_name,
            'guest_email' => $request->guest_email,
            'guest_phone' => $request->guest_phone,
            'date' => $request->date,
            'time' => $request->time,
            'session_type' => $request->session_type,
            'reason' => $request->reason,
            'amount' => $request->amount,
            'payment_method' => 'esewa',
            'payment_status' => 'pending',
            'booking_status' => 'pending',

            // Generate ONCE here and reuse this same token forever
            'guest_token' => Str::random(64),

            'transaction_uuid' => 'GUEST-' . strtoupper(Str::random(12)),
        ]);

        return response()->json([
            'message' => 'Guest booking created successfully.',
            'booking' => $booking,
        ], 201);
    }

    public function showGuestSession(Request $request, $id)
    {
        $token = $request->query('token');

        $booking = GuestBooking::with('counselor')->find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Guest booking not found.'
            ], 404);
        }

        if (!$token || $booking->guest_token !== $token) {
            return response()->json([
                'message' => 'Invalid or missing session token.'
            ], 403);
        }

        if ($booking->payment_status !== 'paid') {
            return response()->json([
                'message' => 'This session is not paid yet.'
            ], 403);
        }

        return response()->json([
            'booking' => [
                'id' => $booking->id,
                'guest_name' => $booking->guest_name,
                'guest_email' => $booking->guest_email,
                'guest_phone' => $booking->guest_phone,
                'date' => $booking->date,
                'time' => $booking->time,
                'session_type' => $booking->session_type,
                'reason' => $booking->reason,
                'amount' => $booking->amount,
                'payment_status' => $booking->payment_status,
                'booking_status' => $booking->booking_status,
                'payment_reference' => $booking->payment_reference,
                'guest_token' => $booking->guest_token,
                'counselor' => $booking->counselor ? [
                    'id' => $booking->counselor->id,
                    'name' => $booking->counselor->name,
                    'email' => $booking->counselor->email,
                    'specialization' => $booking->counselor->specialization,
                ] : null,
            ]
        ]);
    }
}