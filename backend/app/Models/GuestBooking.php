<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuestBooking extends Model
{
    protected $fillable = [
        'counselor_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'date',
        'time',
        'session_type',
        'reason',
        'amount',
        'payment_method',
        'payment_status',
        'booking_status',
        'guest_token',
        'transaction_uuid',
        'payment_reference',
    ];

    public function counselor()
{
    return $this->belongsTo(\App\Models\Counselor::class, 'counselor_id');
}
}