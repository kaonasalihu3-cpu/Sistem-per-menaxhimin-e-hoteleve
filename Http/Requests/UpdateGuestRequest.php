<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateGuestRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'emri' => ['required', 'string', 'max:120'],
            'mbiemri' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180', Rule::unique('guests', 'email')->ignore($id)],
            'telefoni' => ['required', 'string', 'max:30'],
            'nr_dokumentit' => ['required', 'string', 'max:60', Rule::unique('guests', 'nr_dokumentit')->ignore($id)],
            'kombesia' => ['required', 'string', 'max:80'],
        ];
    }
}

