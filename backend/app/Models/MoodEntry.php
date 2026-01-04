<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MoodEntry;
use Carbon\Carbon;

class MoodController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'mood' => 'required|string',
            'note' => 'nullable|string',
        ]);

        MoodEntry::create([
            'user_id' => auth()->id(),
            'mood' => $request->mood,
            'note' => $request->note,
        ]);

        return response()->json(['message' => 'Mood saved']);
    }

    public function weekly()
    {
        return MoodEntry::where('user_id', auth()->id())
            ->whereBetween('created_at', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek(),
            ])
            ->get();
    }

    public function lastWeek()
    {
        return MoodEntry::where('user_id', auth()->id())
            ->whereBetween('created_at', [
                Carbon::now()->subWeek()->startOfWeek(),
                Carbon::now()->subWeek()->endOfWeek(),
            ])
            ->get();
    }
}
