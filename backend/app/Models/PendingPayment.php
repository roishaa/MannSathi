<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PendingPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'counselor_id',
        'appointment_date',
        'appointment_time',
        'type',
        'name',
        'nickname',
        'email',
        'phone',
        'amount',
        'payment_method',
        'transaction_uuid',
        'status',
        'gateway_response',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'amount' => 'decimal:2',
    ];
}