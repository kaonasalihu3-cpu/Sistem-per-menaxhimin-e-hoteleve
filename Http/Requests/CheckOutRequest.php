<?php

namespace App\Http\Requests;

class CheckOutRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data_checkout' => ['nullable', 'date'],
            'shenime' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

