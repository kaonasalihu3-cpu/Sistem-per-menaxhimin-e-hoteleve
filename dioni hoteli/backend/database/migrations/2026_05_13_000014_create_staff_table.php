<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table): void {
            $table->id();
            $table->string('emri', 120);
            $table->string('mbiemri', 120);
            $table->string('pozicioni', 120);
            $table->string('departamenti', 120);
            $table->string('turni', 60);
            $table->string('email', 190)->nullable()->unique();
            $table->string('telefoni', 60)->nullable();
            $table->enum('statusi', ['active', 'inactive'])->default('active');
            $table->date('data_punesimit')->nullable();
            $table->timestamps();

            $table->index(['departamenti', 'turni']);
            $table->index('statusi');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
