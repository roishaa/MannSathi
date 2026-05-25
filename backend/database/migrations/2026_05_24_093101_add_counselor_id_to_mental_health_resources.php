<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('mental_health_resources', function (Blueprint $table) {
        $table->unsignedBigInteger('uploaded_by_counselor_id')->nullable()->after('is_active');
    });
}

public function down(): void
{
    Schema::table('mental_health_resources', function (Blueprint $table) {
        $table->dropColumn('uploaded_by_counselor_id');
    });
}
};
