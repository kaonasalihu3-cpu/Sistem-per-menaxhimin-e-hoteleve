<?php

namespace App\Http\Requests\Staff;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class StoreStaffRequest extends ApiFormRequest
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
            'pozicioni' => ['required', 'string', 'max:120'],
            'departamenti' => ['required', 'string', 'max:120'],
            'turni' => ['required', 'string', 'max:60'],
            'email' => ['nullable', 'email', 'max:190', 'unique:staff,email'],
            'telefoni' => ['nullable', 'string', 'max:60'],
            'statusi' => ['required', Rule::in(['active', 'inactive'])],
            'data_punesimit' => ['nullable', 'date'],
        ];
    }
}
