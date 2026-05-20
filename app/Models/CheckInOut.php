<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckInOut extends Model
{
    use HasFactory;

    protected $table = 'check_in_outs';

    protected $fillable = [
        'reservation_id',
        'data_checkin',
        'data_checkout',
        'shenime',
    ];

    protected $casts = [
        'reservation_id' => 'integer',
        'data_checkin' => 'datetime',
        'data_checkout' => 'datetime',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}