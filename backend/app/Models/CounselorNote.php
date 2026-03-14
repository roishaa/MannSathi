<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CounselorNote extends Model
{
    protected $fillable = [
        'counselor_id',
        'notes',
    ];
}
