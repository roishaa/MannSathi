<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MoodEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MoodController extends Controller
{
    // POST /api/mood  (or /api/user/mood-entries)
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        // ✅ Only allow regular Users (not Counselors/Admins) to create mood entries
        if (!($user instanceof \App\Models\User)) {
            return response()->json([
                'message' => 'Mood check-in is only available for users, not counselors or admins.'
            ], 403);
        }

        $data = $request->validate([
            'mood' => ['required', 'string', 'max:50'],
            'note' => ['nullable', 'string', 'max:2000'],
            'mood_score' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        // ✅ Update if already checked-in today, else create
        $today = Carbon::today();

        $existing = MoodEntry::where('user_id', $user->id)
            ->whereDate('created_at', $today)
            ->first();

        if ($existing) {
            $existing->update($data);
            return response()->json(['message' => 'Mood updated', 'entry' => $existing]);
        }

        $entry = MoodEntry::create([
            'user_id' => $user->id,
            'mood' => $data['mood'],
            'mood_score' => $data['mood_score'] ?? null,
            'note' => $data['note'] ?? null,
        ]);

        return response()->json(['message' => 'Mood saved', 'entry' => $entry], 201);
    }

    // GET /api/user/mood-entries?range=7d|30d|month
    public function history(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);
        
        if (!($user instanceof \App\Models\User)) {
            return response()->json(['items' => []], 200);
        }

        $range = $request->query('range', '7d');

        $from = match ($range) {
            '7d' => Carbon::now()->subDays(6)->startOfDay(),
            '30d' => Carbon::now()->subDays(29)->startOfDay(),
            'month' => Carbon::now()->startOfMonth(),
            default => Carbon::now()->subDays(6)->startOfDay(),
        };

        $items = MoodEntry::where('user_id', $user->id)
            ->where('created_at', '>=', $from)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'mood', 'mood_score', 'note', 'created_at']);

        return response()->json(['items' => $items]);
    }

    // GET /api/user/mood-report/weekly
    public function weeklyReport(Request $request)
    {
        return $this->report($request, 7);
    }

    // GET /api/user/mood-report/monthly
    public function monthlyReport(Request $request)
    {
        return $this->report($request, 30);
    }

    private function report(Request $request, int $days)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $from = Carbon::now()->subDays($days - 1)->startOfDay();

        $base = MoodEntry::where('user_id', $user->id)
            ->where('created_at', '>=', $from);

        $avg = (float) ($base->clone()->avg('mood_score') ?? 0);

        $countsRaw = $base->clone()
            ->select('mood_score', DB::raw('COUNT(*) as total'))
            ->whereNotNull('mood_score')
            ->groupBy('mood_score')
            ->pluck('total', 'mood_score');

        $counts = [];
        for ($i = 1; $i <= 5; $i++) $counts[$i] = (int) ($countsRaw[$i] ?? 0);

        $trend = $base->clone()
            ->select(DB::raw("DATE(created_at) as day"), DB::raw("AVG(mood_score)::float as avg_score"))
            ->whereNotNull('mood_score')
            ->groupBy(DB::raw("DATE(created_at)"))
            ->orderBy('day')
            ->get();

        return response()->json([
            'days' => $days,
            'from' => $from->toDateString(),
            'avgMood' => round($avg, 2),
            'counts' => $counts,
            'trend' => $trend,
        ]);
    }

    // OPTIONAL: keep your old endpoints working
    public function weekly(Request $request)
    {
        // return entries for this week
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $items = MoodEntry::where('user_id', $user->id)
            ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['items' => $items]);
    }

    public function lastWeek(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $items = MoodEntry::where('user_id', $user->id)
            ->whereBetween('created_at', [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['items' => $items]);
    }
}
