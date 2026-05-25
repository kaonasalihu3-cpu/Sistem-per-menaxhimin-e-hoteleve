<?php

namespace Database\Seeders;

use App\Models\CheckInOut;
use App\Models\Guest;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Service;
use App\Models\ServiceOrder;
use App\Models\Staff;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DemoHotelSeeder extends Seeder
{
    public function run(): void
    {
        $roomTypes = [
            'Single' => RoomType::query()->updateOrCreate(
                ['name' => 'Single'],
                ['description' => 'Single room with one bed', 'price_per_night' => 45, 'capacity' => 1]
            ),
            'Double' => RoomType::query()->updateOrCreate(
                ['name' => 'Double'],
                ['description' => 'Double room for two guests', 'price_per_night' => 75, 'capacity' => 2]
            ),
            'Suite' => RoomType::query()->updateOrCreate(
                ['name' => 'Suite'],
                ['description' => 'Premium suite with living area', 'price_per_night' => 145, 'capacity' => 4]
            ),
        ];

        $rooms = [
            '101' => Room::query()->updateOrCreate(
                ['room_number' => '101'],
                ['room_type_id' => $roomTypes['Single']->id, 'floor' => 1, 'capacity' => 1, 'status' => 'available']
            ),
            '102' => Room::query()->updateOrCreate(
                ['room_number' => '102'],
                ['room_type_id' => $roomTypes['Single']->id, 'floor' => 1, 'capacity' => 1, 'status' => 'maintenance']
            ),
            '201' => Room::query()->updateOrCreate(
                ['room_number' => '201'],
                ['room_type_id' => $roomTypes['Double']->id, 'floor' => 2, 'capacity' => 2, 'status' => 'occupied']
            ),
            '202' => Room::query()->updateOrCreate(
                ['room_number' => '202'],
                ['room_type_id' => $roomTypes['Double']->id, 'floor' => 2, 'capacity' => 2, 'status' => 'available']
            ),
            '301' => Room::query()->updateOrCreate(
                ['room_number' => '301'],
                ['room_type_id' => $roomTypes['Suite']->id, 'floor' => 3, 'capacity' => 4, 'status' => 'available']
            ),
        ];

        $guests = [
            'aris.berisha@demo.com' => Guest::query()->updateOrCreate(
                ['email' => 'aris.berisha@demo.com'],
                [
                    'emri' => 'Aris',
                    'mbiemri' => 'Berisha',
                    'telefoni' => '+38344111001',
                    'nr_dokumentit' => 'ID-ARIS-001',
                    'kombesia' => 'Kosovo',
                ]
            ),
            'era.hoxha@demo.com' => Guest::query()->updateOrCreate(
                ['email' => 'era.hoxha@demo.com'],
                [
                    'emri' => 'Era',
                    'mbiemri' => 'Hoxha',
                    'telefoni' => '+38344111002',
                    'nr_dokumentit' => 'ID-ERA-002',
                    'kombesia' => 'Kosovo',
                ]
            ),
            'beni.gashi@demo.com' => Guest::query()->updateOrCreate(
                ['email' => 'beni.gashi@demo.com'],
                [
                    'emri' => 'Beni',
                    'mbiemri' => 'Gashi',
                    'telefoni' => '+38344111003',
                    'nr_dokumentit' => 'ID-BENI-003',
                    'kombesia' => 'Albania',
                ]
            ),
        ];

        $today = Carbon::today();

        $reservation1 = Reservation::query()->updateOrCreate(
            ['guest_id' => $guests['aris.berisha@demo.com']->id, 'room_id' => $rooms['201']->id],
            [
                'data_hyrjes' => $today->copy()->subDay()->toDateString(),
                'data_daljes' => $today->copy()->addDays(2)->toDateString(),
                'statusi' => 'checked_in',
                'nr_personave' => 2,
            ]
        );

        CheckInOut::query()->updateOrCreate(
            ['reservation_id' => $reservation1->id],
            [
                'data_checkin' => $today->copy()->subDay()->setTime(14, 0),
                'data_checkout' => null,
                'shenime' => 'Guest currently staying.',
            ]
        );

        $reservation2 = Reservation::query()->updateOrCreate(
            ['guest_id' => $guests['era.hoxha@demo.com']->id, 'room_id' => $rooms['301']->id],
            [
                'data_hyrjes' => $today->copy()->addDays(3)->toDateString(),
                'data_daljes' => $today->copy()->addDays(6)->toDateString(),
                'statusi' => 'confirmed',
                'nr_personave' => 3,
            ]
        );

        $reservation3 = Reservation::query()->updateOrCreate(
            ['guest_id' => $guests['beni.gashi@demo.com']->id, 'room_id' => $rooms['202']->id],
            [
                'data_hyrjes' => $today->copy()->subDays(7)->toDateString(),
                'data_daljes' => $today->copy()->subDays(4)->toDateString(),
                'statusi' => 'completed',
                'nr_personave' => 2,
            ]
        );

        CheckInOut::query()->updateOrCreate(
            ['reservation_id' => $reservation3->id],
            [
                'data_checkin' => $today->copy()->subDays(7)->setTime(13, 30),
                'data_checkout' => $today->copy()->subDays(4)->setTime(11, 0),
                'shenime' => 'Completed stay.',
            ]
        );

        $invoice1 = Invoice::query()->updateOrCreate(
            ['reservation_id' => $reservation1->id],
            [
                'statusi' => 'unpaid',
                'shuma_totale' => 150,
                'data_fatures' => $today->toDateString(),
            ]
        );

        $invoice2 = Invoice::query()->updateOrCreate(
            ['reservation_id' => $reservation3->id],
            [
                'statusi' => 'paid',
                'shuma_totale' => 295,
                'data_fatures' => $today->copy()->subDays(4)->toDateString(),
            ]
        );

        InvoiceItem::query()->updateOrCreate(
            ['invoice_id' => $invoice1->id, 'pershkrimi' => 'Room charge'],
            ['shuma' => 150]
        );
        InvoiceItem::query()->updateOrCreate(
            ['invoice_id' => $invoice2->id, 'pershkrimi' => 'Room charge'],
            ['shuma' => 225]
        );
        InvoiceItem::query()->updateOrCreate(
            ['invoice_id' => $invoice2->id, 'pershkrimi' => 'Breakfast and spa'],
            ['shuma' => 70]
        );

        $breakfast = Service::query()->where('emertimi', 'Breakfast')->first();
        if ($breakfast) {
            ServiceOrder::query()->updateOrCreate(
                ['reservation_id' => $reservation1->id, 'service_id' => $breakfast->id, 'data' => $today->toDateString()],
                ['sasia' => 2, 'statusi' => 'completed']
            );
        }

        Staff::query()->updateOrCreate(
            ['email' => 'manager@hotel.com'],
            [
                'emri' => 'Lira',
                'mbiemri' => 'Krasniqi',
                'pozicioni' => 'Hotel Manager',
                'departamenti' => 'Management',
                'turni' => 'Morning',
                'telefoni' => '+38344111010',
                'statusi' => 'active',
                'data_punesimit' => Carbon::now()->subYears(2)->toDateString(),
            ]
        );
    }
}
