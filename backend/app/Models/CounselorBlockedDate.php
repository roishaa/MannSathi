<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CounselorBlockedDate extends Model
{
    protected $table = 'counselor_blocked_dates';

    protected $fillable = [
        'counselor_id',
        'blocked_date',
        'reason',
    ];

    protected $casts = [
        'blocked_date' => 'date',
    ];
}