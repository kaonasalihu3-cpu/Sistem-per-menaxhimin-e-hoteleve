<?php
namespace App\Enums;

enum RoomStatus: string 
{
    case AVAILABLE = 'available';
    case OCCUPIED = 'occupied';
    case MAINTENANCE = 'maintenance';

    public function label(): string 
    {
        return match ($this) {
            self::AVAILABLE => 'Free',
            self::OCCUPIED => 'Occupied',
            self::MAINTENANCE => 'Out of Service',
        };
    }
    public static function values(): array
    {
        return array_map(static fn (self $status): string => $status->value, self::cases());
    }
}