<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CheckInOutResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservation_id' => $this->reservation_id,
            'data_checkin' => $this->data_checkin,
            'data_checkout' => $this->data_checkout,
            'shenime' => $this->shenime,
            'reservation' => $this->whenLoaded('reservation', function () {
                return [
                    'id' => $this->reservation->id,
                    'statusi' => $this->reservation->statusi->value ?? $this->reservation->statusi,
                    'room_id' => $this->reservation->room_id,
                    'guest_id' => $this->reservation->guest_id,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

