<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = $this->statusi?->value ?? $this->statusi;

        return [
            'id' => $this->id,
            'guest_id' => $this->guest_id,
            'room_id' => $this->room_id,
            'data_hyrjes' => $this->data_hyrjes,
            'data_daljes' => $this->data_daljes,
            'statusi' => $status,
            'nr_personave' => $this->nr_personave,
            'netet' => $this->netet(),
            'can_check_in' => in_array($status, ['pending', 'confirmed'], true),
            'can_check_out' => $status === 'checked_in',
            'guest' => $this->whenLoaded('guest', function () {
                return [
                    'id' => $this->guest->id,
                    'emri' => $this->guest->emri,
                    'mbiemri' => $this->guest->mbiemri,
                    'full_name' => trim($this->guest->emri . ' ' . $this->guest->mbiemri),
                    'email' => $this->guest->email,
                ];
            }),
            'room' => $this->whenLoaded('room', function () {
                return [
                    'id' => $this->room->id,
                    'room_number' => $this->room->room_number,
                    'status' => $this->room->status->value ?? $this->room->status,
                    'capacity' => $this->room->capacity,
                    'room_type_id' => $this->room->room_type_id,
                    'room_type' => $this->room->relationLoaded('roomType') ? [
                        'id' => $this->room->roomType->id,
                        'name' => $this->room->roomType->name,
                        'price_per_night' => (float) $this->room->roomType->price_per_night,
                    ] : null,
                ];
            }),
            'check_in_out' => $this->whenLoaded('checkInOut', function () {
                return $this->checkInOut ? [
                    'id' => $this->checkInOut->id,
                    'data_checkin' => $this->checkInOut->data_checkin,
                    'data_checkout' => $this->checkInOut->data_checkout,
                    'shenime' => $this->checkInOut->shenime,
                ] : null;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}