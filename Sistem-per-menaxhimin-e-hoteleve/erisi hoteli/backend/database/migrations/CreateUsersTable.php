<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('emri', 120);
            $table->string('mbiemri', 120);
            $table->string('email', 180)->unique();
            $table->string('password_hash');
            $table->string('phone_number', 30)->nullable();
            $table->boolean('email_confirmed')->default(false);
            $table->boolean('lockout_enabled')->default(true);
            $table->unsignedInteger('access_failed_count')->default(0);
            $table->timestamp('data_krijimit')->nullable();
            $table->string('statusi', 30)->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

