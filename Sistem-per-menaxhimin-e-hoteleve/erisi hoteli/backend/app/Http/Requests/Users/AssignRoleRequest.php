<?php

namespace App\Http\Requests\Users;

use App\Http\Requests\ApiFormRequest;

class AssignRoleRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role_id' => ['required', 'integer', 'exists:roles,id'],
        ];
    }
}

