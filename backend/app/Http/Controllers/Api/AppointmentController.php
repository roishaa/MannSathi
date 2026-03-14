<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'counselor_id' => 'required|exists:counselors,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|date_format:H:i',
            'type' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'payment_method' => 'nullable|string|max:50',
            'payment_status' => 'nullable|string|max:50',
            'amount' => 'nullable|numeric',
            'transaction_ref' => 'nullable|string|max:255',
        ]);

        $dateTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['appointment_date'] . ' ' . $validated['appointment_time']
        )->format('Y-m-d H:i:s');

        $alreadyBooked = Appointment::where('counselor_id', $validated['counselor_id'])
            ->where('date_time', $dateTime)
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($alreadyBooked) {
            return response()->json([
                'message' => 'This slot is already booked.'
            ], 422);
        }

        $appointment = Appointment::create([
            'user_id' => Auth::id(),
            'counselor_id' => $validated['counselor_id'],
            'date_time' => $dateTime,
            'type' => $validated['type'] ?? 'chat',
            'name' => $validated['name'],
            'nickname' => $validated['nickname'] ?? null,
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'status' => 'pending',
            'payment_method' => $validated['payment_method'] ?? null,
            'payment_status' => $validated['payment_status'] ?? 'paid',
            'amount' => $validated['amount'] ?? 500,
            'transaction_ref' => $validated['transaction_ref'] ?? null,
        ]);

        return response()->json([
            'message' => 'Appointment booked successfully.',
            'item' => $appointment,
        ], 201);
    }

    public function bookedSlots(Request $request)
    {
        $request->validate([
            'counselor_id' => 'required|exists:counselors,id',
            'date' => 'required|date',
        ]);

        $slots = Appointment::where('counselor_id', $request->counselor_id)
            ->whereDate('date_time', $request->date)
            ->whereNotIn('status', ['cancelled'])
            ->orderBy('date_time')
            ->get()
            ->map(function ($appointment) {
                return Carbon::parse($appointment->date_time)->format('H:i');
            })
            ->values();

        return response()->json([
            'items' => $slots,
        ]);
    }

    public function myAppointments()
    {
        $appointments = Appointment::with('counselor')
            ->where('user_id', Auth::id())
            ->orderBy('date_time', 'desc')
            ->get();

        return response()->json([
            'items' => $appointments,
        ]);
    }

    public function next()
    {
        $appointment = Appointment::with('counselor')
            ->where('user_id', Auth::id())
            ->where('date_time', '>=', now())
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->orderBy('date_time', 'asc')
            ->first();

        return response()->json([
            'item' => $appointment,
        ]);
    }
}