<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
    Schema::create('counselors', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('email')->unique();
      $table->string('password'); // hashed

      $table->string('specialization')->nullable();
      $table->string('license_no')->nullable();
      $table->integer('experience_years')->default(0);
      $table->text('bio')->nullable();

      // store uploaded file paths
      $table->string('license_document_path')->nullable();
      $table->string('degree_document_path')->nullable();
      $table->string('id_document_path')->nullable();

      // approval workflow
      $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');

      // one hospital only
      $table->string('hospital_id')->default('hosp_001');

      $table->timestamps();
    });
  }
  public function down(): void {
    Schema::dropIfExists('counselors');
  }
};