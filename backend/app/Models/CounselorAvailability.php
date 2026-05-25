<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CounselorAvailability extends Model
{
    protected $table = 'counselor_availability';

    protected $fillable = [
        'counselor_id',
        'day_of_week',
        'is_available',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'day_of_week'  => 'integer',
    ];
}