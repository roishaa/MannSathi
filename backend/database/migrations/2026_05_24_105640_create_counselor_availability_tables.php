<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('counselor_availability', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('counselor_id');
            $table->tinyInteger('day_of_week');
            $table->boolean('is_available')->default(false);
            $table->time('start_time')->default('09:00:00');
            $table->time('end_time')->default('17:00:00');
            $table->timestamps();

            $table->unique(['counselor_id', 'day_of_week']);
            $table->foreign('counselor_id')->references('id')->on('counselors')->onDelete('cascade');
        });

        Schema::create('counselor_blocked_dates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('counselor_id');
            $table->date('blocked_date');
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->unique(['counselor_id', 'blocked_date']);
            $table->foreign('counselor_id')->references('id')->on('counselors')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('counselor_blocked_dates');
        Schema::dropIfExists('counselor_availability');
    }
};