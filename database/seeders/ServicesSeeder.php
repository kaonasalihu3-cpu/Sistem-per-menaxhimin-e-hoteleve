<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['emertimi' => 'Breakfast', 'pershkrimi' => 'Daily breakfast package', 'cmimi' => 12.50, 'statusi' => 'active'],
            ['emertimi' => 'Laundry', 'pershkrimi' => 'Laundry and ironing service', 'cmimi' => 18.00, 'statusi' => 'active'],
            ['emertimi' => 'Spa', 'pershkrimi' => 'Spa and wellness access', 'cmimi' => 45.00, 'statusi' => 'active'],
            ['emertimi' => 'Room Service', 'pershkrimi' => 'In-room food and beverages', 'cmimi' => 25.00, 'statusi' => 'active'],
            ['emertimi' => 'Airport Transfer', 'pershkrimi' => 'Airport pickup/drop-off', 'cmimi' => 35.00, 'statusi' => 'active'],
        ];

        foreach ($services as $service) {
            Service::query()->updateOrCreate(
                ['emertimi' => $service['emertimi']],
                $service
            );
        }
    }
}

