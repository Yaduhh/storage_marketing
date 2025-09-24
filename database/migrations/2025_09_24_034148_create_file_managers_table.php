<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('file_managers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('original_name')->nullable();
            $table->string('path');
            $table->string('type')->nullable(); // file or folder
            $table->bigInteger('size')->nullable(); // in bytes
            $table->string('mime_type')->nullable();
            $table->string('extension')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->boolean('is_folder')->default(false);
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('file_managers')->onDelete('cascade');
            $table->index(['user_id', 'parent_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_managers');
    }
};
