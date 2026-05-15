<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'admin@hotel.com'],
            [
                'emri' => 'System',
                'mbiemri' => 'Admin',
                'password_hash' => Hash::make('password123'),
                'phone_number' => null,
                'email_confirmed' => true,
                'lockout_enabled' => true,
                'access_failed_count' => 0,
                'data_krijimit' => Carbon::now(),
                'statusi' => 'active',
            ]
        );

        $adminRole = Role::query()->where('normalized_name', 'admin')->first();
        if ($adminRole) {
            $user->roles()->syncWithoutDetaching([$adminRole->id]);
        }
    }
}

