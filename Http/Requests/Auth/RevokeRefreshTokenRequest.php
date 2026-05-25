<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\ApiFormRequest;

class RevokeRefreshTokenRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'refresh_token' => ['required', 'string'],
        ];
    }
}

