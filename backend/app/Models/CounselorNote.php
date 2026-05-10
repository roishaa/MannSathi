<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CounselorNote extends Model
{
    protected $table = 'counselor_notes';

    protected $fillable = [
        'appointment_id',
        'counselor_id',
        'user_id',
        'notes',
    ];

    // ── Relationships ──

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function counselor()
    {
        return $this->belongsTo(Counselor::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}