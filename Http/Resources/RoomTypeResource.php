<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price_per_night' => (float) $this->price_per_night,
            'capacity' => $this->capacity,
            'rooms_count' => $this->whenCounted('rooms'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

