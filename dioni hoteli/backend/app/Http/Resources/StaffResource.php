<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'emri' => $this->emri,
            'mbiemri' => $this->mbiemri,
            'full_name' => $this->full_name,
            'pozicioni' => $this->pozicioni,
            'departamenti' => $this->departamenti,
            'turni' => $this->turni,
            'email' => $this->email,
            'telefoni' => $this->telefoni,
            'statusi' => $this->statusi,
            'data_punesimit' => $this->data_punesimit,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
