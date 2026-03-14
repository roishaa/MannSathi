<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::table('mood_entries', function (Blueprint $table) {
      if (!Schema::hasColumn('mood_entries', 'mood_score')) {
        $table->unsignedTinyInteger('mood_score')->nullable()->after('mood');
      }

      // Give index a fixed name (best practice)
      $table->index(['user_id', 'created_at'], 'mood_entries_user_created_idx');
    });
  }

  public function down(): void {
    Schema::table('mood_entries', function (Blueprint $table) {
      // Drop by name (safe)
      $table->dropIndex('mood_entries_user_created_idx');

      if (Schema::hasColumn('mood_entries', 'mood_score')) {
        $table->dropColumn('mood_score');
      }
    });
  }
};
