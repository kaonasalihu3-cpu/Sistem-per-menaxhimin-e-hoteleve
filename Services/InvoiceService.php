<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Reservation;
use DomainException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function generateInvoiceForReservation(int $reservationId): Invoice
    {
        return DB::transaction(function () use ($reservationId): Invoice {
            $reservation = Reservation::query()
                ->with(['room.roomType', 'guest', 'serviceOrders.service'])
                ->lockForUpdate()
                ->find($reservationId);

            if (!$reservation) {
                throw new DomainException('Reservation not found.');
            }

            $reservationStatus = $reservation->statusi->value ?? $reservation->statusi;
            if ($reservationStatus === 'cancelled') {
                throw new DomainException('Cannot generate invoice for cancelled reservation.');
            }

            if (Invoice::query()->where('reservation_id', $reservationId)->exists()) {
                throw new DomainException('Invoice already exists for this reservation.');
            }

            $invoice = Invoice::query()->create([
                'reservation_id' => $reservation->id,
                'shuma_totale' => 0,
                'statusi' => 'unpaid',
                'data_fatures' => Carbon::today(),
            ]);

            $roomCost = $this->calculateRoomCost($reservation);
            $invoice->invoiceItems()->create([
                'pershkrimi' => 'Room charge (' . $reservation->netet() . ' nights)',
                'shuma' => $roomCost,
            ]);

            $serviceLines = $this->calculateServiceCosts($reservation);
            foreach ($serviceLines as $line) {
                $invoice->invoiceItems()->create([
                    'pershkrimi' => $line['pershkrimi'],
                    'shuma' => $line['shuma'],
                ]);
            }

            $this->recalculateInvoiceTotal($invoice);

            return $invoice->fresh(['reservation.guest', 'reservation.room.roomType', 'invoiceItems']);
        });
    }

    public function calculateRoomCost(Reservation $reservation): float
    {
        $reservation->loadMissing('room.roomType');
        $pricePerNight = (float) ($reservation->room?->roomType?->price_per_night ?? 0);
        $nights = max(1, $reservation->netet());

        return round($pricePerNight * $nights, 2);
    }

    public function calculateServiceCosts(Reservation $reservation): array
    {
        $reservation->loadMissing('serviceOrders.service');

        $lines = [];
        foreach ($reservation->serviceOrders as $order) {
            if ($order->statusi === 'cancelled') {
                continue;
            }

            $unitPrice = (float) ($order->service?->cmimi ?? 0);
            $amount = round($unitPrice * (int) $order->sasia, 2);

            $lines[] = [
                'pershkrimi' => sprintf(
                    'Service: %s x %d',
                    $order->service?->emertimi ?? 'Unknown',
                    (int) $order->sasia
                ),
                'shuma' => $amount,
            ];
        }

        return $lines;
    }

    public function recalculateInvoiceTotal(Invoice|int $invoice): Invoice
    {
        $invoiceModel = is_int($invoice)
            ? Invoice::query()->with('invoiceItems')->findOrFail($invoice)
            : $invoice->loadMissing('invoiceItems');

        $total = (float) $invoiceModel->invoiceItems->sum('shuma');
        $invoiceModel->update([
            'shuma_totale' => round($total, 2),
        ]);

        return $invoiceModel->fresh(['reservation.guest', 'reservation.room.roomType', 'invoiceItems']);
    }

    public function markAsPaid(Invoice|int $invoice): Invoice
    {
        $invoiceModel = is_int($invoice)
            ? Invoice::query()->findOrFail($invoice)
            : $invoice;

        if ($invoiceModel->statusi === 'cancelled') {
            throw new DomainException('Cancelled invoice cannot be paid.');
        }

        $invoiceModel->update(['statusi' => 'paid']);

        return $invoiceModel->fresh(['reservation.guest', 'reservation.room.roomType', 'invoiceItems']);
    }

    public function cancelInvoice(Invoice|int $invoice): Invoice
    {
        $invoiceModel = is_int($invoice)
            ? Invoice::query()->findOrFail($invoice)
            : $invoice;

        if ($invoiceModel->statusi === 'paid') {
            throw new DomainException('Paid invoice cannot be cancelled.');
        }

        $invoiceModel->update(['statusi' => 'cancelled']);

        return $invoiceModel->fresh(['reservation.guest', 'reservation.room.roomType', 'invoiceItems']);
    }
}

