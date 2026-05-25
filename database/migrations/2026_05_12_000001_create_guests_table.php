<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table): void {
            $table->id();
            $table->string('emri', 120);
            $table->string('mbiemri', 120);
            $table->string('email', 180)->unique();
            $table->string('telefoni', 30);
            $table->string('nr_dokumentit', 60)->unique();
            $table->string('kombesia', 80);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};

