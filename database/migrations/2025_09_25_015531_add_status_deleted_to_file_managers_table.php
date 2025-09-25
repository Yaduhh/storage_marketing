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
        Schema::table('file_managers', function (Blueprint $table) {
            $table->boolean('status_deleted')->default(false)->after('is_folder');
            $table->timestamp('deleted_at')->nullable()->after('status_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('file_managers', function (Blueprint $table) {
            $table->dropColumn(['status_deleted', 'deleted_at']);
        });
    }
};
