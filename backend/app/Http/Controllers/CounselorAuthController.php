<?php

namespace App\Http\Controllers;

use App\Models\Counselor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CounselorAuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required','string','max:100'],
            'email' => ['required','email','unique:counselors,email'],
            'password' => ['required','string','min:6','confirmed'],

            'specialization' => ['required','string','max:100'],
            'license_no' => ['required','string','max:100'],
            'experience_years' => ['nullable','integer','min:0'],
            'bio' => ['nullable','string'],

            'license_document' => ['required','file','mimes:pdf,jpg,jpeg,png','max:2048'],
            'degree_document' => ['required','file','mimes:pdf,jpg,jpeg,png','max:2048'],
            'id_document' => ['nullable','file','mimes:pdf,jpg,jpeg,png','max:2048'],

            'consent' => ['nullable'], // from frontend checkbox (not stored)
        ]);

        // Store files in /storage/app/public/...
        $licensePath = $request->file('license_document')->store('counselors/licenses', 'public');
        $degreePath  = $request->file('degree_document')->store('counselors/degrees', 'public');
        $idPath      = $request->file('id_document')
            ? $request->file('id_document')->store('counselors/ids', 'public')
            : null;

        $counselor = Counselor::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),

            'specialization' => $request->specialization,
            'license_no' => $request->license_no,
            'experience_years' => $request->experience_years,
            'bio' => $request->bio,

            // NOTE: your model uses *_path names
            'license_document_path' => $licensePath,
            'degree_document_path' => $degreePath,
            'id_document_path' => $idPath,

            // match DB enum casing
            'status' => 'PENDING',
        ]);

        return response()->json([
            'message' => 'Counselor registered. Pending verification.',
            'counselor' => [
                'id' => $counselor->id,
                'name' => $counselor->name,
                'email' => $counselor->email,
                'status' => $counselor->status,
                'hospital_id' => $counselor->hospital_id,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required','email'],
            'password' => ['required','string'],
        ]);

        $counselor = Counselor::where('email', $request->email)->first();

        if (!$counselor || !Hash::check($request->password, $counselor->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Optional: block unapproved counselors (DB stores uppercase)
        if (($counselor->status ?? 'PENDING') !== 'APPROVED') {
            return response()->json([
                'message' => 'Your account is pending verification by the hospital.'
            ], 403);
        }

        $token = $counselor->createToken('counselor_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'role' => 'counselor',
            'counselor' => [
                'id' => $counselor->id,
                'name' => $counselor->name,
                'email' => $counselor->email,
                'hospital_id' => $counselor->hospital_id,
                'status' => $counselor->status,
            ],
        ]);
    }
}
