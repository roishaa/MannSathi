<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class HospitalAdminPatientController extends Controller
{
    public function index()
    {
        $patients = User::with(['appointments.counselor'])
            ->get()
            ->map(function ($user) {
                $appointments = $user->appointments
                    ->sortByDesc('date_time')
                    ->values();

                $lastAppointment = $appointments
                    ->filter(fn ($a) => $a->date_time && strtotime($a->date_time) < time())
                    ->first();

                $nextAppointment = $appointments
                    ->filter(fn ($a) => $a->date_time && strtotime($a->date_time) >= time())
                    ->sortBy('date_time')
                    ->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'total_appointments' => $appointments->count(),
                    'last_appointment' => $lastAppointment?->date_time,
                    'next_appointment' => $nextAppointment?->date_time,
                ];
            });

        return response()->json([
            'patients' => $patients,
        ]);
    }
}