<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\GuestBooking;

class HospitalPaymentController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->query('from');
        $to   = $request->query('to');

        // ── 1. Logged-in user payments (Appointment model) ──────
        $appointmentQuery = Appointment::with(['user', 'counselor'])
            ->whereNotNull('payment_status');

        if ($from) $appointmentQuery->whereDate('date_time', '>=', $from);
        if ($to)   $appointmentQuery->whereDate('date_time', '<=', $to);

        $appointments = $appointmentQuery->orderBy('date_time', 'desc')->get();

        $userPayments = $appointments->map(function ($a) {
            return [
                'id'               => 'U-' . $a->id,
                'type'             => 'user',
                'patient_name'     => $a->name ?? $a->user?->name ?? '—',
                'patient_email'    => $a->email ?? $a->user?->email ?? '—',
                'counselor_name'   => $a->counselor?->name ?? '—',
                'payment_date'     => $a->date_time?->toDateString(),
                'appointment_date' => $a->date_time?->toDateString(),
                'appointment_time' => $a->date_time?->format('H:i'),
                'payment_method'   => $a->payment_method ?? '—',
                'transaction_id'   => $a->transaction_ref ?? '—',
                'amount'           => $a->amount ?? 0,
                'payment_status'   => $a->payment_status ?? '—',
            ];
        });

        // ── 2. Guest payments (GuestBooking model) ───────────────
        $guestQuery = GuestBooking::with(['counselor'])
            ->whereNotNull('payment_status');

        if ($from) $guestQuery->whereDate('date', '>=', $from);
        if ($to)   $guestQuery->whereDate('date', '<=', $to);

        $guestBookings = $guestQuery->orderBy('date', 'desc')->get();

        $guestPayments = $guestBookings->map(function ($g) {
            return [
                'id'               => 'G-' . $g->id,
                'type'             => 'guest',
                'patient_name'     => $g->guest_name ?? '—',
                'patient_email'    => $g->guest_email ?? '—',
                'counselor_name'   => $g->counselor?->name ?? '—',
                'payment_date'     => $g->created_at?->toDateString(),
                'appointment_date' => $g->date ?? '—',
                'appointment_time' => $g->time ?? '—',
                'payment_method'   => $g->payment_method ?? '—',
                'transaction_id'   => $g->transaction_uuid ?? $g->payment_reference ?? '—',
                'amount'           => $g->amount ?? 0,
                'payment_status'   => $g->payment_status ?? $g->booking_status ?? '—',
            ];
        });

        // ── 3. Merge + sort by payment_date descending ───────────
        $all = $userPayments->concat($guestPayments)
            ->sortByDesc('payment_date')
            ->values();

        return response()->json([
            'data' => $all
        ]);
    }
    public function userPayments(Request $request)
{
    $user = $request->user();

    $appointments = Appointment::with(['counselor'])
        ->where('user_id', $user->id)
        ->whereNotNull('payment_status')
        ->orderBy('date_time', 'desc')
        ->get();

    $payments = $appointments->map(function ($a) {
        return [
            'id'             => 'U-' . $a->id,
            'counselor_name' => $a->counselor?->name ?? '—',
            'payment_date'   => $a->date_time?->toDateString(),
            'payment_method' => $a->payment_method ?? '—',
            'transaction_id' => $a->transaction_ref ?? '—',
            'amount'         => $a->amount ?? 0,
            'payment_status' => $a->payment_status ?? '—',
        ];
    });

    return response()->json(['data' => $payments]);
}
}