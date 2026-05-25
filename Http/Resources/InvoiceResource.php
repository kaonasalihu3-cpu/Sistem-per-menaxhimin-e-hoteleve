<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservation_id' => $this->reservation_id,
            'shuma_totale' => (float) $this->shuma_totale,
            'statusi' => $this->statusi,
            'data_fatures' => $this->data_fatures,
            'reservation' => $this->whenLoaded('reservation', function () {
                return [
                    'id' => $this->reservation->id,
                    'data_hyrjes' => $this->reservation->data_hyrjes,
                    'data_daljes' => $this->reservation->data_daljes,
                    'netet' => $this->reservation->netet(),
                    'guest' => $this->reservation->relationLoaded('guest') ? [
                        'id' => $this->reservation->guest->id,
                        'full_name' => trim($this->reservation->guest->emri . ' ' . $this->reservation->guest->mbiemri),
                        'email' => $this->reservation->guest->email,
                    ] : null,
                    'room' => $this->reservation->relationLoaded('room') ? [
                        'id' => $this->reservation->room->id,
                        'room_number' => $this->reservation->room->room_number,
                        'room_type' => $this->reservation->room->relationLoaded('roomType') ? [
                            'id' => $this->reservation->room->roomType->id,
                            'name' => $this->reservation->room->roomType->name,
                            'price_per_night' => (float) $this->reservation->room->roomType->price_per_night,
                        ] : null,
                    ] : null,
                ];
            }),
            'invoice_items' => $this->whenLoaded('invoiceItems', function () {
                return InvoiceItemResource::collection($this->invoiceItems);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

