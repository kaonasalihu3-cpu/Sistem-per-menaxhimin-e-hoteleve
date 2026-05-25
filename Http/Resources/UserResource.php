<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'emri' => $this->emri,
            'mbiemri' => $this->mbiemri,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'email_confirmed' => $this->email_confirmed,
            'lockout_enabled' => $this->lockout_enabled,
            'access_failed_count' => $this->access_failed_count,
            'data_krijimit' => $this->data_krijimit,
            'statusi' => $this->statusi,
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(static fn ($role) => [
                    'id' => $role->id,
                    'emertimi' => $role->emertimi,
                    'normalized_name' => $role->normalized_name,
                ]);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

