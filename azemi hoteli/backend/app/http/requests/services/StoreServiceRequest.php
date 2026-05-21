<?php

namespace App\Http\Requests\Services;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class StoreServiceRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'emertimi' => ['required', 'string', 'max:120'],
            'pershkrimi' => ['nullable', 'string', 'max:2000'],
            'cmimi' => ['required', 'numeric', 'min:0'],
            'statusi' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}

