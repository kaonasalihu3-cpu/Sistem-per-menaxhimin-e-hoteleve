<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('guest_id')
                ->constrained('guests')
                ->restrictOnDelete();
            $table->foreignId('room_id')
                ->constrained('rooms')
                ->restrictOnDelete();
            $table->date('data_hyrjes');
            $table->date('data_daljes');
            $table->enum('statusi', ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'])->default('pending');
            $table->unsignedInteger('nr_personave');
            $table->timestamps();

            $table->index(['room_id', 'data_hyrjes', 'data_daljes']);
            $table->index('statusi');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};