<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guest_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('counselor_id')->constrained('counselors')->onDelete('cascade');

            $table->string('guest_name');
            $table->string('guest_email');
            $table->string('guest_phone')->nullable();

            $table->date('date');
            $table->time('time');
            $table->string('session_type')->default('chat');
            $table->text('reason')->nullable();

            $table->decimal('amount', 10, 2)->default(0);

            $table->string('payment_method')->default('esewa');
            $table->string('payment_status')->default('pending');
            $table->string('booking_status')->default('pending');

            $table->string('guest_token', 128)->unique();
            $table->string('transaction_uuid')->nullable()->unique();
            $table->string('payment_reference')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guest_bookings');
    }
};