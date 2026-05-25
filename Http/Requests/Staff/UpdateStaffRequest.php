<?php

namespace App\Http\Requests\Staff;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $staffId = $this->route('id');

        return [
            'emri' => ['required', 'string', 'max:120'],
            'mbiemri' => ['required', 'string', 'max:120'],
            'pozicioni' => ['required', 'string', 'max:120'],
            'departamenti' => ['required', 'string', 'max:120'],
            'turni' => ['required', 'string', 'max:60'],
            'email' => ['nullable', 'email', 'max:190', Rule::unique('staff', 'email')->ignore($staffId)],
            'telefoni' => ['nullable', 'string', 'max:60'],
            'statusi' => ['required', Rule::in(['active', 'inactive'])],
            'data_punesimit' => ['nullable', 'date'],
        ];
    }
}
