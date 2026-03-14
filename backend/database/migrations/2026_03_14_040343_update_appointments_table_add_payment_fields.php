<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {

            $table->string('name')->nullable();
            $table->string('nickname')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();

            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('unpaid');

            $table->decimal('amount', 10, 2)->default(0);
            $table->string('transaction_ref')->nullable();

        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {

            $table->dropColumn([
                'name',
                'nickname',
                'email',
                'phone',
                'payment_method',
                'payment_status',
                'amount',
                'transaction_ref'
            ]);

        });
    }
};