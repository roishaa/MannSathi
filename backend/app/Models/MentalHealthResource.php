<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MentalHealthResource extends Model
{
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
    ];
}