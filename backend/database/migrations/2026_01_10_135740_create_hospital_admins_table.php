<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('hospital_admins', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('email')->unique();
      $table->string('password');

      // one hospital only (fixed), still store for future
      $table->string('hospital_id')->default('hosp_001');
      $table->string('hospital_name')->default('MannSathi General Hospital');

      $table->timestamps();
    });
  }
  public function down(): void {
    Schema::dropIfExists('hospital_admins');
  }
};
