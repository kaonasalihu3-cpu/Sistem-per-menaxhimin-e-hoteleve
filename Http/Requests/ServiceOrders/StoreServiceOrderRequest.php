<?php

namespace App\Http\Requests\ServiceOrders;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class StoreServiceOrderRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reservation_id' => ['required', 'integer', 'exists:reservations,id'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'sasia' => ['required', 'integer', 'min:1'],
            'data' => ['required', 'date'],
            'statusi' => ['required', Rule::in(['pending', 'completed', 'cancelled'])],
        ];
    }
}

