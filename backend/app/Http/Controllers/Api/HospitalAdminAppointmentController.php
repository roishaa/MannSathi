<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Carbon\Carbon;

class HospitalAdminAppointmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::with(['user', 'counselor'])
            ->orderBy('date_time', 'desc')
            ->get()
            ->map(function ($appointment) {
                $dt = $appointment->date_time ? Carbon::parse($appointment->date_time) : null;

                return [
                    'id' => $appointment->id,
                    'user_id' => $appointment->user_id,
                    'counselor_id' => $appointment->counselor_id,

                    'name' => $appointment->name,
                    'email' => $appointment->email,
                    'phone' => $appointment->phone,

                    'user' => $appointment->user ? [
                        'id' => $appointment->user->id,
                        'name' => $appointment->user->name,
                        'email' => $appointment->user->email ?? null,
                    ] : null,

                    'counselor' => $appointment->counselor ? [
                        'id' => $appointment->counselor->id,
                        'name' => $appointment->counselor->name,
                        'email' => $appointment->counselor->email ?? null,
                    ] : null,

                    'date_time' => $dt ? $dt->format('Y-m-d H:i:s') : null,
                    'date' => $dt ? $dt->format('Y-m-d') : null,
                    'time' => $dt ? $dt->format('H:i') : null,

                    'type' => $appointment->type,
                    'status' => $appointment->status,
                    'payment_status' => $appointment->payment_status,
                    'payment_method' => $appointment->payment_method,
                    'amount' => $appointment->amount,
                    'transaction_ref' => $appointment->transaction_ref,

                    'created_at' => $appointment->created_at,
                    'updated_at' => $appointment->updated_at,
                ];
            });

        return response()->json([
            'appointments' => $appointments
        ]);
    }
}