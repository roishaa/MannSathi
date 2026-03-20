<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CounselorPublicController extends Controller
{
    // GET /api/counselors
    public function index(Request $request)
    {
        // ✅ Pull from actual table columns
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

        /**
         * ✅ APPROVED FILTER - case-insensitive
         * This makes sure: once hospital admin approves, user booking will show them.
         */
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

    $dateTime = $data['date'] . ' ' . $data['time'] . ':00';

    $items = DB::table('counselors')
        ->select([
            'counselors.id',
            'counselors.name',
            'counselors.email',
            'counselors.specialization',
            'counselors.status',
            'counselors.experience_years',
            'counselors.bio',
        ])
        ->whereRaw("UPPER(counselors.status) = ?", ['APPROVED'])
        ->whereNotExists(function ($query) use ($dateTime) {
            $query->select(DB::raw(1))
                ->from('appointments')
                ->whereColumn('appointments.counselor_id', 'counselors.id')
                ->where('appointments.date_time', $dateTime)
                ->whereNotIn('appointments.status', ['cancelled', 'declined']);
        })
        ->orderBy('counselors.id', 'desc')
        ->get();

    return response()->json([
        'items' => $items
    ]);
}
}
