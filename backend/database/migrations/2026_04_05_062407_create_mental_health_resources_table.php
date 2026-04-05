<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mental_health_resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();

            $table->string('type'); 
            // video, exercise, article, audio

            $table->string('category')->nullable(); 
            // stress, anxiety, sleep, mindfulness, etc.

            $table->string('thumbnail')->nullable();
            $table->string('resource_url')->nullable();
            $table->string('embed_url')->nullable();
            $table->string('duration')->nullable();

            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mental_health_resources');
    }
};