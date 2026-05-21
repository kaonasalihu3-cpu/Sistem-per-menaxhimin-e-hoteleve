<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservation_id' => $this->reservation_id,
            'service_id' => $this->service_id,
            'sasia' => $this->sasia,
            'data' => $this->data,
            'statusi' => $this->statusi,
            'service' => $this->whenLoaded('service', function () {
                return [
                    'id' => $this->service->id,
                    'emertimi' => $this->service->emertimi,
                    'cmimi' => (float) $this->service->cmimi,
                    'statusi' => $this->service->statusi,
                ];
            }),
            'reservation' => $this->whenLoaded('reservation', function () {
                return [
                    'id' => $this->reservation->id,
                    'statusi' => $this->reservation->statusi->value ?? $this->reservation->statusi,
                    'guest' => $this->reservation->relationLoaded('guest') ? [
                        'id' => $this->reservation->guest->id,
                        'full_name' => trim($this->reservation->guest->emri . ' ' . $this->reservation->guest->mbiemri),
                    ] : null,
                    'room' => $this->reservation->relationLoaded('room') ? [
                        'id' => $this->reservation->room->id,
                        'room_number' => $this->reservation->room->room_number,
                    ] : null,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

