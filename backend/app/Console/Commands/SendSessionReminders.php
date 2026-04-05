<?php

namespace App\Console\Commands;

use App\Mail\SessionReminderMail;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendSessionReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:send-session-reminders';

    /**
     * The console command description.
     */
    protected $description = 'Send reminder emails for sessions starting in 5 minutes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        $fiveMinutesLater = Carbon::now()->addMinutes(5);

        $appointments = Appointment::where('status', 'confirmed')
            ->where('payment_status', 'paid')
            ->where('reminder_sent', false)
            ->whereBetween('date_time', [$now, $fiveMinutesLater])
            ->get();

        foreach ($appointments as $appointment) {
            try {
                $sessionLink = null;

                // Guest session link
                if (is_null($appointment->user_id)) {
                    $guestBooking = \App\Models\GuestBooking::where('guest_email', $appointment->email)
                        ->where('counselor_id', $appointment->counselor_id)
                        ->where('date', Carbon::parse($appointment->date_time)->format('Y-m-d'))
                        ->where('booking_status', 'confirmed')
                        ->first();

                    if ($guestBooking) {
                        $sessionLink = 'http://localhost:5173/guest-session/' . $guestBooking->id . '?token=' . $guestBooking->guest_token;
                    }
                }

                $reminderData = [
                    'name' => $appointment->name ?? 'User',
                    'counselor_name' => 'Assigned Counselor',
                    'date' => Carbon::parse($appointment->date_time)->format('Y-m-d'),
                    'time' => Carbon::parse($appointment->date_time)->format('h:i A'),
                    'session_link' => $sessionLink,
                ];

                Mail::to($appointment->email)->send(new SessionReminderMail($reminderData));

                $appointment->update([
                    'reminder_sent' => true,
                ]);

                Log::info('Session reminder sent', [
                    'appointment_id' => $appointment->id,
                    'email' => $appointment->email,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send session reminder', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info('Session reminder check completed.');
    }
}