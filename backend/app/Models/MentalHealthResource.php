<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MentalHealthResource extends Model
{
    use HasFactory;

    protected $table = 'mental_health_resources';

   protected $fillable = [
    'title',
    'description',
    'type',
    'category',
    'thumbnail',
    'resource_url',
    'embed_url',
    'duration',
    'is_featured',
    'is_active',
    'uploaded_by_counselor_id', // ← add this
];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_active'   => 'boolean',
    ];

    // Optional: link back to counselor
    public function counselor()
    {
        return $this->belongsTo(Counselor::class, 'uploaded_by_counselor_id');
    }
}