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
}
