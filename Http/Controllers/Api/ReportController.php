<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReservationResource;
use App\Models\Invoice;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\ServiceOrder;
use App\Support\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    use ApiResponse;

    public function reservations(Request $request): JsonResponse
    {
        $query = Reservation::query()
            ->with(['guest', 'room.roomType', 'checkInOut'])
            ->latest();

        if ($request->filled('date_from')) {
            $query->whereDate('data_hyrjes', '>=', $request->string('date_from')->toString());
        }

        if ($request->filled('date_to')) {
            $query->whereDate('data_daljes', '<=', $request->string('date_to')->toString());
        }

        if ($request->filled('status')) {
            $query->where('statusi', $request->string('status')->toString());
        }

        if ($request->filled('room_id')) {
            $query->where('room_id', $request->integer('room_id'));
        }

        if ($request->filled('guest_id')) {
            $query->where('guest_id', $request->integer('guest_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function (Builder $builder) use ($search): void {
                $builder->whereHas('guest', function (Builder $guestQuery) use ($search): void {
                    $guestQuery->where('emri', 'like', '%' . $search . '%')
                        ->orWhere('mbiemri', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                })->orWhereHas('room', function (Builder $roomQuery) use ($search): void {
                    $roomQuery->where('room_number', 'like', '%' . $search . '%');
                });
            });
        }

        $reservations = $query->get();

        return $this->success('Reservation report fetched successfully.', [
            'items' => ReservationResource::collection($reservations)->resolve(),
            'total' => $reservations->count(),
        ]);
    }

    public function incomeSummary(Request $request): JsonResponse
    {
        $baseQuery = Invoice::query();
        $this->applyInvoiceDateFilters($baseQuery, $request);

        $totalIncome = (clone $baseQuery)->where('statusi', 'paid')->sum('shuma_totale');
        $paidInvoices = (clone $baseQuery)->where('statusi', 'paid')->count();
        $unpaidInvoices = (clone $baseQuery)->where('statusi', 'unpaid')->count();
        $cancelledInvoices = (clone $baseQuery)->where('statusi', 'cancelled')->count();

        $monthlyBreakdown = (clone $baseQuery)
            ->where('statusi', 'paid')
            ->selectRaw("DATE_FORMAT(data_fatures, '%Y-%m') as month_key")
            ->selectRaw('SUM(shuma_totale) as total_income')
            ->selectRaw('COUNT(*) as paid_invoices')
            ->groupBy('month_key')
            ->orderBy('month_key')
            ->get()
            ->map(function ($row): array {
                $date = Carbon::createFromFormat('Y-m', (string) $row->month_key);

                return [
                    'month_key' => $row->month_key,
                    'month' => $date->format('M Y'),
                    'total_income' => (float) $row->total_income,
                    'paid_invoices' => (int) $row->paid_invoices,
                ];
            });

        return $this->success('Income summary report fetched successfully.', [
            'total_income' => (float) $totalIncome,
            'paid_invoices' => $paidInvoices,
            'unpaid_invoices' => $unpaidInvoices,
            'cancelled_invoices' => $cancelledInvoices,
            'monthly_breakdown' => $monthlyBreakdown,
        ]);
    }

    public function serviceUsage(Request $request): JsonResponse
    {
        $query = ServiceOrder::query()
            ->join('services', 'service_orders.service_id', '=', 'services.id')
            ->select('service_orders.service_id', 'services.emertimi as service_name')
            ->selectRaw('SUM(service_orders.sasia) as total_quantity')
            ->selectRaw('SUM(service_orders.sasia * services.cmimi) as total_revenue')
            ->selectRaw('COUNT(DISTINCT service_orders.reservation_id) as reservation_count')
            ->groupBy('service_orders.service_id', 'services.emertimi')
            ->orderBy('services.emertimi');

        if ($request->filled('date_from')) {
            $query->whereDate('service_orders.data', '>=', $request->string('date_from')->toString());
        }

        if ($request->filled('date_to')) {
            $query->whereDate('service_orders.data', '<=', $request->string('date_to')->toString());
        }

        if ($request->filled('service_id')) {
            $query->where('service_orders.service_id', $request->integer('service_id'));
        }

        $items = $query->get()->map(function ($row): array {
            return [
                'service_id' => (int) $row->service_id,
                'service_name' => $row->service_name,
                'total_quantity' => (int) $row->total_quantity,
                'total_revenue' => (float) $row->total_revenue,
                'reservation_count' => (int) $row->reservation_count,
            ];
        });

        return $this->success('Service usage report fetched successfully.', [
            'items' => $items,
            'total_services' => $items->count(),
        ]);
    }

    public function occupancyRate(Request $request): JsonResponse
    {
        $dateFrom = $request->filled('date_from')
            ? Carbon::parse($request->string('date_from')->toString())->startOfDay()
            : Carbon::now()->startOfMonth()->startOfDay();
        $dateTo = $request->filled('date_to')
            ? Carbon::parse($request->string('date_to')->toString())->endOfDay()
            : Carbon::now()->endOfMonth()->endOfDay();

        if ($dateTo->lessThanOrEqualTo($dateFrom)) {
            return $this->error('date_to must be after date_from.', [
                'date_to' => ['date_to must be after date_from.'],
            ], 422);
        }

        $totalRooms = Room::query()->count();
        $occupiedRooms = Reservation::query()
            ->where('statusi', '!=', ReservationStatus::CANCELLED->value)
            ->whereDate('data_hyrjes', '<', $dateTo)
            ->whereDate('data_daljes', '>', $dateFrom)
            ->distinct('room_id')
            ->count('room_id');

        $availableRooms = max($totalRooms - $occupiedRooms, 0);
        $occupancyPercentage = $totalRooms > 0
            ? round(($occupiedRooms / $totalRooms) * 100, 2)
            : 0.0;

        return $this->success('Occupancy rate report fetched successfully.', [
            'date_from' => $dateFrom->toDateString(),
            'date_to' => $dateTo->toDateString(),
            'total_rooms' => $totalRooms,
            'occupied_rooms' => $occupiedRooms,
            'available_rooms' => $availableRooms,
            'occupancy_percentage' => $occupancyPercentage,
        ]);
    }

    private function applyInvoiceDateFilters(Builder $query, Request $request): void
    {
        if ($request->filled('date_from')) {
            $query->whereDate('data_fatures', '>=', $request->string('date_from')->toString());
        }

        if ($request->filled('date_to')) {
            $query->whereDate('data_fatures', '<=', $request->string('date_to')->toString());
        }
    }
}
