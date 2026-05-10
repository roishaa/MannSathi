<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('counselor_notes', function (Blueprint $table) {
            $table->unsignedBigInteger('appointment_id')->nullable()->after('counselor_id');
            $table->unsignedBigInteger('user_id')->nullable()->after('appointment_id');

            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('counselor_id')->references('id')->on('counselors')->onDelete('cascade');

            $table->unique('appointment_id'); // one note per session
        });
    }

    public function down(): void
    {
        Schema::table('counselor_notes', function (Blueprint $table) {
            $table->dropForeign(['appointment_id']);
            $table->dropForeign(['user_id']);
            $table->dropForeign(['counselor_id']);
            $table->dropUnique(['appointment_id']);
            $table->dropColumn(['appointment_id', 'user_id']);
        });
    }
};