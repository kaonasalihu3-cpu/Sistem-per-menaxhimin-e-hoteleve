<?php

namespace App\Http\Resources;

use App\Enums\RoomStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var RoomStatus|string $status */
        $status = $this->status;
        $statusValue = $status instanceof RoomStatus ? $status->value : (string) $status;
        $statusLabel = $status instanceof RoomStatus
            ? $status->label()
            : ucfirst(str_replace('_', ' ', $statusValue));

        $isOutOfService = $statusValue === RoomStatus::MAINTENANCE->value;

        return [
            'id' => $this->id,
            'room_type_id' => $this->room_type_id,
            'room_number' => $this->room_number,
            'floor' => $this->floor,
            'capacity' => $this->capacity,
            'status' => $statusValue,
            'status_label' => $statusLabel,
            'is_out_of_service' => $isOutOfService,
            'can_be_reserved' => $statusValue === RoomStatus::AVAILABLE->value,
            'room_type' => $this->whenLoaded('roomType', function () {
                return [
                    'id' => $this->roomType->id,
                    'name' => $this->roomType->name,
                    'description' => $this->roomType->description,
                    'price_per_night' => (float) $this->roomType->price_per_night,
                    'capacity' => $this->roomType->capacity,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

