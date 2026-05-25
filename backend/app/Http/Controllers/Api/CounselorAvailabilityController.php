<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CounselorAvailability;
use App\Models\CounselorBlockedDate;
use Illuminate\Http\Request;

class CounselorAvailabilityController extends Controller
{
    // ── GET /counselor/availability/check (public — used by user booking) ───
    // Returns which time slots are outside the counselor's working hours
    public function check(Request $request)
    {
        $request->validate([
            'counselor_id' => 'required|integer',
            'date'         => 'required|date',
        ]);

        $counselorId = $request->counselor_id;
        $date        = $request->date;
        $dayOfWeek   = (int) \Carbon\Carbon::parse($date)->format('w');

        $timeSlots = [
            "09:30", "10:30", "12:00", "13:00",
            "14:00", "15:00", "16:00", "17:00",
            "20:00", "21:00", "22:00",
        ];

        // Check if date is blocked
        $isBlocked = CounselorBlockedDate::where('counselor_id', $counselorId)
            ->where('blocked_date', $date)
            ->exists();

        if ($isBlocked) {
            // All slots unavailable
            return response()->json(['unavailable_slots' => $timeSlots]);
        }

        // Get the counselor's schedule for this day
        $daySchedule = CounselorAvailability::where('counselor_id', $counselorId)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        // No schedule set → treat as always available
        if (!$daySchedule) {
            return response()->json(['unavailable_slots' => []]);
        }

        // Day is off → all slots unavailable
        if (!$daySchedule->is_available) {
            return response()->json(['unavailable_slots' => $timeSlots]);
        }

        // Filter slots outside working hours (session = 60 min + 10 min buffer)
        $workStart = \Carbon\Carbon::parse("$date {$daySchedule->start_time}");
        $workEnd   = \Carbon\Carbon::parse("$date {$daySchedule->end_time}");

        $unavailable = array_filter($timeSlots, function ($slot) use ($date, $workStart, $workEnd) {
            $slotStart  = \Carbon\Carbon::parse("$date $slot");
            $sessionEnd = $slotStart->copy()->addMinutes(70);
            return $slotStart->lt($workStart) || $sessionEnd->gt($workEnd);
        });

        return response()->json([
            'unavailable_slots' => array_values($unavailable),
        ]);
    }
    public function index(Request $request)
    {
        $counselorId = $request->user()->id;

        $schedule = CounselorAvailability::where('counselor_id', $counselorId)
            ->orderBy('day_of_week')
            ->get();

        // If no schedule set yet, return defaults (all days off, 9-5)
        if ($schedule->isEmpty()) {
            $schedule = collect(range(0, 6))->map(fn($day) => [
                'day_of_week'  => $day,
                'is_available' => false,
                'start_time'   => '09:00',
                'end_time'     => '17:00',
            ]);
        }

        $blockedDates = CounselorBlockedDate::where('counselor_id', $counselorId)
            ->where('blocked_date', '>=', now()->toDateString())
            ->orderBy('blocked_date')
            ->get();

        return response()->json([
            'success'       => true,
            'schedule'      => $schedule,
            'blocked_dates' => $blockedDates,
        ]);
    }

    // ── POST /counselor/availability ────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'schedule'                => 'required|array|size:7',
            'schedule.*.day_of_week'  => 'required|integer|between:0,6',
            'schedule.*.is_available' => 'required|boolean',
            'schedule.*.start_time'   => 'required|date_format:H:i',
            'schedule.*.end_time'     => 'required|date_format:H:i',
        ]);

        $counselorId = $request->user()->id;

        foreach ($request->schedule as $day) {
            CounselorAvailability::updateOrCreate(
                [
                    'counselor_id' => $counselorId,
                    'day_of_week'  => $day['day_of_week'],
                ],
                [
                    'is_available' => $day['is_available'],
                    'start_time'   => $day['start_time'],
                    'end_time'     => $day['end_time'],
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Availability saved successfully.',
        ]);
    }

    // ── POST /counselor/blocked-dates ───────────────────────────────────────
    public function blockDate(Request $request)
    {
        $request->validate([
            'date'   => 'required|date|after_or_equal:today',
            'reason' => 'nullable|string|max:100',
        ]);

        $counselorId = $request->user()->id;

        CounselorBlockedDate::updateOrCreate(
            [
                'counselor_id' => $counselorId,
                'blocked_date' => $request->date,
            ],
            [
                'reason' => $request->reason,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Date blocked successfully.',
        ]);
    }

    // ── DELETE /counselor/blocked-dates/{id} ────────────────────────────────
    public function unblockDate(Request $request, $id)
    {
        $counselorId = $request->user()->id;

        CounselorBlockedDate::where('id', $id)
            ->where('counselor_id', $counselorId)
            ->firstOrFail()
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Date unblocked.',
        ]);
    }
}