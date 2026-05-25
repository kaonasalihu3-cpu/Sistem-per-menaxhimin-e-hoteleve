<?php

namespace App\Models;

use App\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'guest_id',
        'room_id',
        'data_hyrjes',
        'data_daljes',
        'statusi',
        'nr_personave',
    ];

    protected $casts = [
        'guest_id' => 'integer',
        'room_id' => 'integer',
        'data_hyrjes' => 'date',
        'data_daljes' => 'date',
        'nr_personave' => 'integer',
        'statusi' => ReservationStatus::class,
    ];

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function checkInOut(): HasOne
    {
        return $this->hasOne(CheckInOut::class);
    }

    public function serviceOrders(): HasMany
    {
        return $this->hasMany(ServiceOrder::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function scopeOverlapping(Builder $query, string $from, string $to): Builder
    {
        return $query->whereDate('data_hyrjes', '<', $to)
            ->whereDate('data_daljes', '>', $from);
    }

    public function netet(): int
    {
        $from = $this->data_hyrjes instanceof Carbon
            ? $this->data_hyrjes
            : Carbon::parse((string) $this->data_hyrjes);
        $to = $this->data_daljes instanceof Carbon
            ? $this->data_daljes
            : Carbon::parse((string) $this->data_daljes);

        return $from->diffInDays($to);
    }
}
