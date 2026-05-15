<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory;

    protected $table = 'users';

    protected $fillable = [
        'emri',
        'mbiemri',
        'email',
        'password_hash',
        'phone_number',
        'email_confirmed',
        'lockout_enabled',
        'access_failed_count',
        'data_krijimit',
        'statusi',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'email_confirmed' => 'boolean',
        'lockout_enabled' => 'boolean',
        'access_failed_count' => 'integer',
        'data_krijimit' => 'datetime',
    ];

    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withTimestamps();
    }

    public function userClaims(): HasMany
    {
        return $this->hasMany(UserClaim::class);
    }

    public function userTokens(): HasMany
    {
        return $this->hasMany(UserToken::class);
    }

    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->emri . ' ' . $this->mbiemri);
    }

    public function hasRole(string $role): bool
    {
        $normalized = strtolower(trim($role));

        return $this->roles->contains(static fn (Role $item): bool => $item->normalized_name === $normalized);
    }
}
