<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'pershkrimi' => $this->pershkrimi,
            'shuma' => (float) $this->shuma,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

