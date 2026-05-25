<?php

namespace App\Http\Requests\Invoices;

use App\Http\Requests\ApiFormRequest;

class StoreInvoiceItemRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pershkrimi' => ['required', 'string', 'max:255'],
            'shuma' => ['required', 'numeric', 'min:0'],
        ];
    }
}

