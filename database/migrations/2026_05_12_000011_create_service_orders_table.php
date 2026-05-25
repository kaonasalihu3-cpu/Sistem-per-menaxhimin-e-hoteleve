<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->restrictOnDelete();
            $table->unsignedInteger('sasia');
            $table->date('data');
            $table->enum('statusi', ['pending', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->index(['reservation_id', 'service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_orders');
    }
};

