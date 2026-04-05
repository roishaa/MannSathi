<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MentalHealthResource;
use Illuminate\Http\Request;

class MentalHealthResourceController extends Controller
{
    public function index(Request $request)
    {
        $query = MentalHealthResource::query()->where('is_active', true);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $resources = $query->latest()->get();

        return response()->json([
            'success' => true,
            'items' => $resources,
        ]);
    }

    public function featured()
    {
        $resources = MentalHealthResource::where('is_active', true)
            ->where('is_featured', true)
            ->latest()
            ->take(6)
            ->get();

        return response()->json([
            'success' => true,
            'items' => $resources,
        ]);
    }

    public function show($id)
    {
        $resource = MentalHealthResource::where('is_active', true)->findOrFail($id);

        return response()->json([
            'success' => true,
            'item' => $resource,
        ]);
    }
}