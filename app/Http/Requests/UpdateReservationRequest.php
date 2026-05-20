<?php

namespace App\Http\Requests;

use App\Enums\ReservationStatus;
use Illuminate\Validation\Rule;

class UpdateReservationRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'guest_id' => ['required', 'integer', 'exists:guests,id'],
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'data_hyrjes' => ['required', 'date'],
            'data_daljes' => ['required', 'date', 'after:data_hyrjes'],
            'statusi' => ['required', Rule::in(ReservationStatus::values())],
            'nr_personave' => ['required', 'integer', 'min:1'],
        ];
    }
}