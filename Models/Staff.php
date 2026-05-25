<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    protected $fillable = [
        'emri',
        'mbiemri',
        'pozicioni',
        'departamenti',
        'turni',
        'email',
        'telefoni',
        'statusi',
        'data_punesimit',
    ];

    protected $casts = [
        'data_punesimit' => 'date',
    ];

    public function getFullNameAttribute(): string
    {
        return trim($this->emri . ' ' . $this->mbiemri);
    }
}
