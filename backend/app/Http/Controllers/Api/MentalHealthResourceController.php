<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MentalHealthResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MentalHealthResourceController extends Controller
{
    // ── GET /resources (users — all active resources) ───────────────────────
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
            'items'   => $resources,
        ]);
    }

    // ── GET /resources/featured ─────────────────────────────────────────────
    public function featured()
    {
        $resources = MentalHealthResource::where('is_active', true)
            ->where('is_featured', true)
            ->latest()
            ->take(6)
            ->get();

        return response()->json([
            'success' => true,
            'items'   => $resources,
        ]);
    }

    // ── GET /resources/{id} ─────────────────────────────────────────────────
    public function show($id)
    {
        $resource = MentalHealthResource::where('is_active', true)->findOrFail($id);

        return response()->json([
            'success' => true,
            'item'    => $resource,
        ]);
    }

    // ── GET /counselor/resources (counselor — only their uploads) ───────────
    public function counselorIndex()
    {
        $counselorId = auth()->id();

        $resources = MentalHealthResource::where('uploaded_by_counselor_id', $counselorId)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'items'   => $resources,
        ]);
    }

    // ── POST /counselor/resources (counselor upload) ────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:20480', // max 20MB
        ]);

        $file      = $request->file('file');
        $original  = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());

        $type = match(true) {
            in_array($extension, ['mp4', 'mov', 'avi', 'webm']) => 'video',
            in_array($extension, ['mp3', 'wav', 'ogg', 'm4a'])  => 'audio',
            in_array($extension, ['pdf', 'doc', 'docx'])        => 'article',
            default                                              => 'article',
        };

        $path = $file->store('resources', 'public');
        $url  = url(Storage::url($path)); // full URL e.g. http://127.0.0.1:8000/storage/resources/file.pdf

        $resource = MentalHealthResource::create([
            'title'                    => pathinfo($original, PATHINFO_FILENAME),
            'description'              => null,
            'type'                     => $type,
            'category'                 => null,
            'resource_url'             => $url,
            'is_active'                => true,
            'is_featured'              => false,
            'uploaded_by_counselor_id' => auth()->id(),
        ]);

        return response()->json([
            'success'  => true,
            'message'  => 'Resource uploaded successfully.',
            'resource' => $resource,
        ], 201);
    }

    // ── DELETE /counselor/resources/{id} ────────────────────────────────────
    public function destroy($id)
    {
        $counselorId = auth()->id();

        // Only allow counselor to delete their own uploads
        $resource = MentalHealthResource::where('id', $id)
            ->where('uploaded_by_counselor_id', $counselorId)
            ->firstOrFail();

        if ($resource->resource_url) {
            $path = str_replace('/storage/', 'public/', $resource->resource_url);
            Storage::delete($path);
        }

        $resource->delete();

        return response()->json([
            'success' => true,
            'message' => 'Resource deleted successfully.',
        ]);
    }
}