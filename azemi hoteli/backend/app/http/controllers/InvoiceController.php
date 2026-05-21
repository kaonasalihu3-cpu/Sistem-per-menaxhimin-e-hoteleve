<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoices\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Services\InvoiceService;
use App\Support\ApiResponse;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class InvoiceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly InvoiceService $invoiceService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Invoice::query()
            ->with(['reservation.guest', 'reservation.room.roomType'])
            ->latest();

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->string('statusi')->toString());
        }

        if ($request->filled('reservation_id')) {
            $query->where('reservation_id', $request->integer('reservation_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('data_fatures', '>=', $request->string('date_from')->toString());
        }

        if ($request->filled('date_to')) {
            $query->whereDate('data_fatures', '<=', $request->string('date_to')->toString());
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', '%' . $search . '%')
                    ->orWhereHas('reservation.guest', function ($guestQuery) use ($search) {
                        $guestQuery->where('emri', 'like', '%' . $search . '%')
                            ->orWhere('mbiemri', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('reservation.room', function ($roomQuery) use ($search) {
                        $roomQuery->where('room_number', 'like', '%' . $search . '%');
                    });
            });
        }

        $invoices = $query->get();

        return $this->success('Invoices fetched successfully.', InvoiceResource::collection($invoices));
    }

    public function show(int $id): JsonResponse
    {
        $invoice = Invoice::query()
            ->with(['reservation.guest', 'reservation.room.roomType', 'invoiceItems'])
            ->find($id);

        if (!$invoice) {
            return $this->error('Invoice not found.', null, 404);
        }

        return $this->success('Invoice fetched successfully.', new InvoiceResource($invoice));
    }

    public function generate(int $reservationId): JsonResponse
    {
        try {
            $invoice = $this->invoiceService->generateInvoiceForReservation($reservationId);
            return $this->success('Invoice generated successfully.', new InvoiceResource($invoice), 201);
        } catch (DomainException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to generate invoice.', null, 500);
        }
    }

    public function update(UpdateInvoiceRequest $request, int $id): JsonResponse
    {
        $invoice = Invoice::query()->find($id);
        if (!$invoice) {
            return $this->error('Invoice not found.', null, 404);
        }

        if ($invoice->statusi === 'paid' && !$this->isAdmin($request)) {
            return $this->error('Paid invoice can only be edited by admin.', [
                'statusi' => ['Paid invoice can only be edited by admin.'],
            ], 403);
        }

        if ($invoice->statusi === 'cancelled') {
            return $this->error('Cancelled invoice cannot be edited.', [
                'statusi' => ['Cancelled invoice cannot be edited.'],
            ], 422);
        }

        try {
            $invoice->update($request->validated());
            return $this->success(
                'Invoice updated successfully.',
                new InvoiceResource($invoice->fresh(['reservation.guest', 'reservation.room.roomType', 'invoiceItems']))
            );
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to update invoice.', null, 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $invoice = Invoice::query()->with('invoiceItems')->find($id);
        if (!$invoice) {
            return $this->error('Invoice not found.', null, 404);
        }

        if ($invoice->statusi === 'paid' && !$this->isAdmin($request)) {
            return $this->error('Paid invoice can only be deleted by admin.', [
                'statusi' => ['Paid invoice can only be deleted by admin.'],
            ], 403);
        }

        try {
            $invoice->delete();
            return $this->success('Invoice deleted successfully.', null);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to delete invoice.', null, 500);
        }
    }

    public function pay(int $id): JsonResponse
    {
        $invoice = Invoice::query()->find($id);
        if (!$invoice) {
            return $this->error('Invoice not found.', null, 404);
        }

        try {
            $invoice = $this->invoiceService->markAsPaid($invoice);
            return $this->success('Invoice marked as paid successfully.', new InvoiceResource($invoice));
        } catch (DomainException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to mark invoice as paid.', null, 500);
        }
    }

    public function cancel(int $id): JsonResponse
    {
        $invoice = Invoice::query()->find($id);
        if (!$invoice) {
            return $this->error('Invoice not found.', null, 404);
        }

        try {
            $invoice = $this->invoiceService->cancelInvoice($invoice);
            return $this->success('Invoice cancelled successfully.', new InvoiceResource($invoice));
        } catch (DomainException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to cancel invoice.', null, 500);
        }
    }

    protected function isAdmin(Request $request): bool
    {
        return (bool) $request->user()?->hasRole('admin');
    }
}

