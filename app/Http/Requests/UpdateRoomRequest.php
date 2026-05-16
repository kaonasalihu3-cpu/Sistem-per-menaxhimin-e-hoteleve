<?php

namespace App\Http\Requests;

use App\Enums\RoomStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roomId = $this->route('id');

        return [
            'room_type_id' => ['required', 'integer', 'exists:room_types,id'],
            'room_number' => ['required', 'string', 'max:40', Rule::unique('rooms', 'room_number')->ignore($roomId)],
            'floor' => ['required', 'integer'],
            'capacity' => ['required', 'integer', 'gt:0'],
            'status' => ['required', Rule::in(RoomStatus::values())],
        ];
    }
}