<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoomTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roomTypeId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('room_types', 'name')->ignore($roomTypeId)],
            'description' => ['nullable', 'string', 'max:2000'],
            'price_per_night' => ['required', 'numeric', 'gt:0'],
            'capacity' => ['required', 'integer', 'gt:0'],
        ];
    }
}