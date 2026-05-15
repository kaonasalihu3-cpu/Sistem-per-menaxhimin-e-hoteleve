<?php

namespace App\Http\Requests\Roles;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'emertimi' => ['required', 'string', 'max:80'],
            'pershkrimi' => ['nullable', 'string', 'max:255'],
            'normalized_name' => ['nullable', 'string', 'max:80', Rule::unique('roles', 'normalized_name')->ignore($id)],
        ];
    }
}

