<?php

namespace App\Http\Requests;

class UpdateCheckInOutRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data_checkin' => ['nullable', 'date'],
            'data_checkout' => ['nullable', 'date', 'after_or_equal:data_checkin'],
            'shenime' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

