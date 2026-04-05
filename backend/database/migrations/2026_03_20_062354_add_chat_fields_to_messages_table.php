<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->unsignedBigInteger('appointment_id')->nullable()->after('id');
            $table->string('sender_type')->nullable()->after('appointment_id');
            $table->unsignedBigInteger('sender_id')->nullable()->after('sender_type');
            $table->text('content')->nullable()->after('sender_id');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn([
                'appointment_id',
                'sender_type',
                'sender_id',
                'content',
            ]);
        });
    }
};