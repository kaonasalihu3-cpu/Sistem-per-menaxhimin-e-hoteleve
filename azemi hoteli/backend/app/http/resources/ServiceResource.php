<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'emertimi' => $this->emertimi,
            'pershkrimi' => $this->pershkrimi,
            'cmimi' => (float) $this->cmimi,
            'statusi' => $this->statusi,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

