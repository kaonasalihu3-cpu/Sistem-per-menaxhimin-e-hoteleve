<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use App\Http\Controllers\Controller;
use App\Models\CheckInOut;
use App\Models\Guest;
use App\Models\Invoice;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\Staff;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    use ApiResponse;

    public function summary(): JsonResponse
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd = Carbon::now()->endOfMonth();

        $totalRooms = Room::query()->count();
        $availableRooms = Room::query()->where('status', RoomStatus::AVAILABLE->value)->count();
        $occupiedRooms = Room::query()->where('status', RoomStatus::OCCUPIED->value)->count();
        $maintenanceRooms = Room::query()->where('status', RoomStatus::MAINTENANCE->value)->count();
        $totalReservations = Reservation::query()->count();
        $activeReservations = Reservation::query()
            ->whereIn('statusi', ReservationStatus::activeForAvailability())
            ->count();
        $checkInsToday = CheckInOut::query()->whereDate('data_checkin', $today)->count();
        $checkOutsToday = CheckInOut::query()->whereDate('data_checkout', $today)->count();
        $totalIncome = $this->paidInvoicesQuery()->sum('shuma_totale');
        $paidInvoices = $this->paidInvoicesQuery()->count();
        $monthlyIncome = $this->paidInvoicesQuery()
            ->whereBetween('data_fatures', [$monthStart, $monthEnd])
            ->sum('shuma_totale');
        $unpaidInvoices = Invoice::query()->where('statusi', 'unpaid')->count();
        $totalGuests = Guest::query()->count();
        $totalStaff = Staff::query()->count();

        return $this->success('Dashboard summary fetched successfully.', [
            'total_rooms' => $totalRooms,
            'available_rooms' => $availableRooms,
            'occupied_rooms' => $occupiedRooms,
            'maintenance_rooms' => $maintenanceRooms,
            'total_reservations' => $totalReservations,
            'active_reservations' => $activeReservations,
            'check_ins_today' => $checkInsToday,
            'check_outs_today' => $checkOutsToday,
            'total_income' => (float) $totalIncome,
            'paid_invoices' => $paidInvoices,
            'monthly_income' => (float) $monthlyIncome,
            'unpaid_invoices' => $unpaidInvoices,
            'total_guests' => $totalGuests,
            'total_staff' => $totalStaff,
        ]);
    }

    public function recentReservations(): JsonResponse
    {
        $reservations = Reservation::query()
            ->with(['guest', 'room'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function (Reservation $reservation): array {
                return [
                    'id' => $reservation->id,
                    'guest_name' => trim(($reservation->guest?->emri ?? '') . ' ' . ($reservation->guest?->mbiemri ?? '')),
                    'room_number' => $reservation->room?->room_number,
                    'data_hyrjes' => $reservation->data_hyrjes,
                    'data_daljes' => $reservation->data_daljes,
                    'statusi' => $reservation->statusi?->value ?? $reservation->statusi,
                ];
            });

        return $this->success('Recent reservations fetched successfully.', $reservations);
    }

    public function recentPayments(): JsonResponse
    {
        $payments = Invoice::query()
            ->with(['reservation.guest', 'reservation.room'])
            ->where('statusi', 'paid')
            ->latest('data_fatures')
            ->limit(10)
            ->get()
            ->map(function (Invoice $invoice): array {
                $guest = $invoice->reservation?->guest;
                $room = $invoice->reservation?->room;

                return [
                    'invoice_id' => $invoice->id,
                    'reservation_id' => $invoice->reservation_id,
                    'guest_name' => $guest ? trim($guest->emri . ' ' . $guest->mbiemri) : null,
                    'room_number' => $room?->room_number,
                    'amount' => (float) $invoice->shuma_totale,
                    'paid_at' => $invoice->data_fatures,
                ];
            });

        return $this->success('Recent payments fetched successfully.', $payments);
    }

    public function revenueChart(): JsonResponse
    {
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->startOfMonth()->subMonths($i);
            $months->push([
                'key' => $month->format('Y-m'),
                'label' => $month->format('M Y'),
                'total_income' => 0.0,
            ]);
        }

        $incomeRows = $this->paidInvoicesQuery()
            ->whereDate('data_fatures', '>=', Carbon::now()->startOfMonth()->subMonths(11))
            ->selectRaw("DATE_FORMAT(data_fatures, '%Y-%m') as month_key, SUM(shuma_totale) as total_income")
            ->groupBy('month_key')
            ->pluck('total_income', 'month_key');

        $chart = $months->map(function (array $month) use ($incomeRows): array {
            return [
                'month' => $month['label'],
                'month_key' => $month['key'],
                'total_income' => (float) ($incomeRows[$month['key']] ?? 0),
            ];
        })->values();

        return $this->success('Revenue chart data fetched successfully.', $chart);
    }

    public function occupancyChart(): JsonResponse
    {
        $totalRooms = Room::query()->count();
        $safeTotalRooms = max($totalRooms, 1);
        $chart = collect();

        for ($i = 11; $i >= 0; $i--) {
            $monthStart = Carbon::now()->startOfMonth()->subMonths($i);
            $monthEnd = $monthStart->copy()->endOfMonth();

            $occupiedRooms = Reservation::query()
                ->where('statusi', '!=', ReservationStatus::CANCELLED->value)
                ->whereDate('data_hyrjes', '<=', $monthEnd)
                ->whereDate('data_daljes', '>', $monthStart)
                ->distinct('room_id')
                ->count('room_id');

            $chart->push([
                'month' => $monthStart->format('M Y'),
                'month_key' => $monthStart->format('Y-m'),
                'occupied_rooms' => $occupiedRooms,
                'total_rooms' => $totalRooms,
                'occupancy_rate' => round(($occupiedRooms / $safeTotalRooms) * 100, 2),
            ]);
        }

        return $this->success('Occupancy chart data fetched successfully.', $chart);
    }

    private function paidInvoicesQuery()
    {
        return Invoice::query()->where('statusi', 'paid');
    }
}
