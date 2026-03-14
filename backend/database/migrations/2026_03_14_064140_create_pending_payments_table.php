<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_payments', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('counselor_id');

            $table->date('appointment_date');
            $table->time('appointment_time');

            $table->string('type')->default('chat');

            $table->string('name');
            $table->string('nickname')->nullable();
            $table->string('email');
            $table->string('phone');

            $table->decimal('amount', 10, 2)->default(0);

            $table->string('payment_method')->default('esewa');
            $table->string('transaction_uuid')->unique();
            $table->string('status')->default('pending');
            $table->text('gateway_response')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_payments');
    }
};