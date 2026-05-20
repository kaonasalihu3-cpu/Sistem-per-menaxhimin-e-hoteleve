<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreGuestRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'emri' => ['required', 'string', 'max:120'],
            'mbiemri' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180', Rule::unique('guests', 'email')],
            'telefoni' => ['required', 'string', 'max:30'],
            'nr_dokumentit' => ['required', 'string', 'max:60', Rule::unique('guests', 'nr_dokumentit')],
            'kombesia' => ['required', 'string', 'max:80'],
        ];
    }
}