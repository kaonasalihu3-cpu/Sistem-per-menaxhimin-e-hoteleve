<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreCheckInOutRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reservation_id' => ['required', 'integer', 'exists:reservations,id', Rule::unique('check_in_outs', 'reservation_id')],
            'data_checkin' => ['nullable', 'date'],
            'data_checkout' => ['nullable', 'date', 'after_or_equal:data_checkin'],
            'shenime' => ['nullable', 'string', 'max:2000'],
        ];
    }
}