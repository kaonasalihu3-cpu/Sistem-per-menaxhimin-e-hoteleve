<?php

namespace App\Http\Requests;

class CheckInRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data_checkin' => ['nullable', 'date'],
            'shenime' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

