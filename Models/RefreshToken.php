<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class RefreshToken extends Model
{
    use HasFactory;

    protected $table = 'refresh_tokens';

    protected $fillable = [
        'user_id',
        'token',
        'expires',
        'created',
        'revoked',
    ];

    protected $casts = [
        'expires' => 'datetime',
        'created' => 'datetime',
        'revoked' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires instanceof Carbon && $this->expires->isPast();
    }

    public function isRevoked(): bool
    {
        return $this->revoked !== null;
    }
}

