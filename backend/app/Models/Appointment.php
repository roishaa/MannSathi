<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'user_id',
        'counselor_id',
        'date_time',
        'type',
        'status',
        'notes',
        'feedback',
        'summary',
    ];

    protected $casts = [
        'date_time' => 'datetime',
    ];

    public function counselor()
    {
        return $this->belongsTo(Counselor::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
