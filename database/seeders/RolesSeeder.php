<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['emertimi' => 'Admin', 'pershkrimi' => 'Full system access', 'normalized_name' => 'admin'],
            ['emertimi' => 'Manager', 'pershkrimi' => 'Hotel operations management', 'normalized_name' => 'manager'],
            ['emertimi' => 'User', 'pershkrimi' => 'Limited/basic access', 'normalized_name' => 'user'],
        ];

        foreach ($roles as $role) {
            Role::query()->updateOrCreate(
                ['normalized_name' => $role['normalized_name']],
                $role
            );
        }
    }
}

