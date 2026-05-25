<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'emri' => $this->emri,
            'mbiemri' => $this->mbiemri,
            'email' => $this->email,
            'telefoni' => $this->telefoni,
            'nr_dokumentit' => $this->nr_dokumentit,
            'kombesia' => $this->kombesia,
            'full_name' => trim($this->emri . ' ' . $this->mbiemri),
            'reservations_count' => $this->whenCounted('reservations'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

