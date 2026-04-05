<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'sender_type',
        'sender_id',
        'content',
    ];

    protected $appends = ['message'];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function getMessageAttribute()
    {
        return $this->content;
    }
}