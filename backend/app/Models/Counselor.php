<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Counselor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialization',
        'license_no',
        'experience_years',
        'bio',
        'is_verified',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
}

