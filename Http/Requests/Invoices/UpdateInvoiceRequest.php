<?php

namespace App\Http\Requests\Invoices;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'statusi' => ['required', Rule::in(['unpaid', 'paid', 'cancelled'])],
            'data_fatures' => ['required', 'date'],
        ];
    }
}

