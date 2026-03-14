<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Counselor;
use App\Models\CounselorMaterial;
use App\Models\CounselorNote;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CounselorDashboardController extends Controller
{
    private function requireCounselor(Request $request)
    {
        $user = $request->user();
        if (!($user instanceof Counselor)) {
            return [null, response()->json(['message' => 'Unauthorized'], 403)];
        }
        return [$user, null];
    }

    public function me(Request $request)
    {
        [$counselor, $resp] = $this->requireCounselor($request);
        if ($resp) return $resp;
        return response()->json($counselor);
    }

    public function sessions(Request $request)
    {
        [$counselor, $resp] = $this->requireCounselor($request);
        if ($resp) return $resp;

        $appointments = Appointment::with('user')
            ->where('counselor_id', $counselor->id)
            ->orderBy('date_time')
            ->get();

        $today = now()->toDateString();

        $data = $appointments->map(function ($a) use ($today) {
            $dt = $a->date_time ? Carbon::parse($a->date_time) : null;
            $dateLabel = $dt ? ($dt->toDateString() === $today ? 'Today' : $dt->format('M d, Y')) : '';
            $timeLabel = $dt ? $dt->format('h:i A') : '';

            return [
                'id' => $a->id,
                'patient_name' => $a->user?->name,
                'patient' => $a->user?->name,
                'time' => $timeLabel,
                'date' => $dateLabel,
                'type' => $a->type ? ucfirst($a->type) : '',
                'status' => $a->status ? ucfirst($a->status) : '',
                'topic' => '',
                'notes' => $a->notes,
                'feedback' => $a->feedback,
                'summary' => $a->summary,
                'rating' => null,
                'quiz_shared' => false,
                'quiz' => null,
            ];
        });

        return response()->json($data);
    }

    public function updateSession(Request $request, $id)
    {
        [$counselor, $resp] = $this->requireCounselor($request);
        if ($resp) return $resp;

        $data = $request->validate([
            'notes' => 'nullable|string',
            'feedback' => 'nullable|string',
            'summary' => 'nullable|string',
        ]);

        $appointment = Appointment::where('counselor_id', $counselor->id)->findOrFail($id);
        $appointment->fill($data);
        $appointment->save();

        return response()->json(['message' => 'Updated']);
    }

    public function acceptSession(Request $request, $id)
    {
        [$counselor, $resp] = $this->requireCounselor($request);
        if ($resp) return $resp;

        $appointment = Appointment::where('counselor_id', $counselor->id)->findOrFail($id);
        $appointment->status = 'scheduled';
        $appointment->save();

        return response()->json(['message' => 'Accepted']);
    }

    public function declineSession(Request $request, $id)
    {
        [$counselor, $resp] = $this->requireCounselor($request);
        if ($resp) return $resp;

        $appointment = Appointment::where('counselor_id', $counselor->id)->findOrFail($id);
        $appointment->status = 'declined';
        $appointment->save();

        return response()->json(['message' => 'Declined']);
    }

    public function materials(Request $request)
    {
        [$counselor, $resp] = $this->requireCounselor($request);
        if ($resp) return $resp;

        $materials = CounselorMaterial::where('counselor_id', $counselor->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($materials);
    }

    public function uploadMaterial(Request $request)
    {
        [$counselor, $resp] = $this->requireCounselor($request);
        if ($resp) return $resp;

        $data = $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $data['file'];
        $path = $file->store('counselor-materials', 'public');

        $material = CounselorMaterial::create([
            'counselor_id' => $counselor->id,
            'title' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => strtoupper($file->getClientOriginalExtension() ?: 'FILE'),
        ]);

        return response()->json($material, 201);
    }

    public function getNotes(Request $request)
    {
        [$counselor, $resp] = $this->requireCounselor($request);
        if ($resp) return $resp;

        $note = CounselorNote::firstOrCreate(
            ['counselor_id' => $counselor->id],
            ['notes' => '']
        );

        return response()->json(['notes' => $note->notes]);
    }

    public function saveNotes(Request $request)
    {
        [$counselor, $resp] = $this->requireCounselor($request);
        if ($resp) return $resp;

        $data = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $note = CounselorNote::firstOrCreate(
            ['counselor_id' => $counselor->id],
            ['notes' => '']
        );

        $note->notes = $data['notes'] ?? '';
        $note->save();

        return response()->json(['message' => 'Saved']);
    }

    public function sharedContent()
    {
        return response()->json([]);
    }
}
