<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'counselor_id',
        'date_time',
        'type',
        'name',
        'nickname',
        'email',
        'phone',
        'status',
        'payment_status',
        'payment_method',
        'amount',
        'transaction_ref',
    ];

    protected $casts = [
        'date_time' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function counselor()
    {
        return $this->belongsTo(Counselor::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function counselorNote()
{
    return $this->hasOne(CounselorNote::class);
}
}