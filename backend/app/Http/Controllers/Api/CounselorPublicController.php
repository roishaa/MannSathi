<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\CounselorAvailability;
use App\Models\CounselorBlockedDate;
use Carbon\Carbon;

class CounselorPublicController extends Controller
{
    // GET /api/counselors
    public function index(Request $request)
    {
        $query = DB::table('counselors')
            ->select([
                'id',
                'name',
                'email',
                'specialization',
                'status',
                'experience_years',
                'bio',
            ]);

        $query->whereRaw("UPPER(status) = ?", ['APPROVED']);

        $items = $query->orderBy('id', 'desc')->get();

        return response()->json(['items' => $items]);
    }

    public function availableForGuest(Request $request)
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
        ]);

        $date = $data['date'];
        $time = $data['time'];

        // Day of week: 0=Sunday, 6=Saturday
        $dayOfWeek  = (int) Carbon::parse($date)->format('w');

        // Slot start and end (session = 60 min + 10 min buffer = 70 min)
        $slotStart  = Carbon::parse("$date $time");
        $sessionEnd = $slotStart->copy()->addMinutes(70);

        // Get all approved counselors
        $counselors = DB::table('counselors')
            ->select(['id', 'name', 'specialization', 'experience_years', 'bio', 'status'])
            ->whereRaw("UPPER(status) = ?", ['APPROVED'])
            ->get();

        $available = $counselors->filter(function ($counselor) use (
            $date, $time, $dayOfWeek, $slotStart, $sessionEnd
        ) {
            // ── 1. Check weekly schedule ────────────────────────────────────
            $daySchedule = CounselorAvailability::where('counselor_id', $counselor->id)
                ->where('day_of_week', $dayOfWeek)
                ->first();

            if ($daySchedule) {
                // Counselor has set a schedule — respect it
                if (!$daySchedule->is_available) {
                    return false; // day off
                }

                $workStart = Carbon::parse("$date {$daySchedule->start_time}");
                $workEnd   = Carbon::parse("$date {$daySchedule->end_time}");

                // Session must start AND end within working hours
                if ($slotStart->lt($workStart) || $sessionEnd->gt($workEnd)) {
                    return false;
                }
            }
            // If no schedule set yet, counselor is treated as always available
            // (so existing counselors aren't broken before they set their schedule)

            // ── 2. Check blocked dates ──────────────────────────────────────
            $isBlocked = CounselorBlockedDate::where('counselor_id', $counselor->id)
                ->where('blocked_date', $date)
                ->exists();

            if ($isBlocked) return false;

            // ── 3. Check overlapping appointments (70 min window) ───────────
            $appointments = DB::table('appointments')
                ->where('counselor_id', $counselor->id)
                ->whereDate('date_time', $date)
                ->whereNotIn('status', ['cancelled', 'declined'])
                ->get();

            foreach ($appointments as $appt) {
                $apptStart = Carbon::parse($appt->date_time);
                $apptEnd   = $apptStart->copy()->addMinutes(70);

                if ($slotStart->lt($apptEnd) && $sessionEnd->gt($apptStart)) {
                    return false; // overlap
                }
            }

            // ── 4. Check overlapping guest bookings ─────────────────────────
            $guestBookings = DB::table('guest_bookings')
                ->where('counselor_id', $counselor->id)
                ->where('date', $date)
                ->whereNotIn('booking_status', ['cancelled', 'declined'])
                ->get();

            foreach ($guestBookings as $g) {
                $gStart = Carbon::parse("$g->date $g->time");
                $gEnd   = $gStart->copy()->addMinutes(70);

                if ($slotStart->lt($gEnd) && $sessionEnd->gt($gStart)) {
                    return false; // overlap
                }
            }

            return true;
        });

        return response()->json(
            $available->values()->map(fn($c) => [
                'id'               => $c->id,
                'name'             => $c->name,
                'specialization'   => $c->specialization ?? '',
                'experience_years' => $c->experience_years ?? null,
                'bio'              => $c->bio ?? '',
            ])
        );
    }
}