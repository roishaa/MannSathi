<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CounselorMaterial extends Model
{
    protected $fillable = [
        'counselor_id',
        'title',
        'file_path',
        'file_type',
    ];
}
