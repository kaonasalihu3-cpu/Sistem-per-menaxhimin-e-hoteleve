<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserClaim extends Model
{
    use HasFactory;

    protected $table = 'user_claims';

    protected $fillable = [
        'user_id',
        'claim_type',
        'claim_value',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

