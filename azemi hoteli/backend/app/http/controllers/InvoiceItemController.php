<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoices\StoreInvoiceItemRequest;
use App\Http\Requests\Invoices\UpdateInvoiceItemRequest;
use App\Http\Resources\InvoiceItemResource;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Services\InvoiceService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class InvoiceItemController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly InvoiceService $invoiceService
    ) {
    }

    public function index(int $invoiceId): JsonResponse
    {
        $invoice = Invoice::query()->with('invoiceItems')->find($invoiceId);
        if (!$invoice) {
            return $this->error('Invoice not found.', null, 404);
        }

        return $this->success('Invoice items fetched successfully.', InvoiceItemResource::collection($invoice->invoiceItems));
    }

    public function store(StoreInvoiceItemRequest $request, int $invoiceId): JsonResponse
    {
        $invoice = Invoice::query()->find($invoiceId);
        if (!$invoice) {
            return $this->error('Invoice not found.', null, 404);
        }

        $editError = $this->validateInvoiceEditable($invoice, $request);
        if ($editError) {
            return $editError;
        }

        try {
            $item = $invoice->invoiceItems()->create($request->validated());
            $updatedInvoice = $this->invoiceService->recalculateInvoiceTotal($invoice);

            return $this->success('Invoice item created successfully.', [
                'item' => new InvoiceItemResource($item),
                'invoice' => new InvoiceResource($updatedInvoice),
            ], 201);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to create invoice item.', null, 500);
        }
    }

    public function update(UpdateInvoiceItemRequest $request, int $id): JsonResponse
    {
        $item = InvoiceItem::query()->with('invoice')->find($id);
        if (!$item) {
            return $this->error('Invoice item not found.', null, 404);
        }

        $editError = $this->validateInvoiceEditable($item->invoice, $request);
        if ($editError) {
            return $editError;
        }

        try {
            $item->update($request->validated());
            $updatedInvoice = $this->invoiceService->recalculateInvoiceTotal($item->invoice_id);

            return $this->success('Invoice item updated successfully.', [
                'item' => new InvoiceItemResource($item->fresh()),
                'invoice' => new InvoiceResource($updatedInvoice),
            ]);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to update invoice item.', null, 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $item = InvoiceItem::query()->with('invoice')->find($id);
        if (!$item) {
            return $this->error('Invoice item not found.', null, 404);
        }

        $editError = $this->validateInvoiceEditable($item->invoice, $request);
        if ($editError) {
            return $editError;
        }

        try {
            $invoiceId = $item->invoice_id;
            $item->delete();
            $updatedInvoice = $this->invoiceService->recalculateInvoiceTotal($invoiceId);

            return $this->success('Invoice item deleted successfully.', new InvoiceResource($updatedInvoice));
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to delete invoice item.', null, 500);
        }
    }

    protected function validateInvoiceEditable(Invoice $invoice, Request $request): ?JsonResponse
    {
        if ($invoice->statusi === 'cancelled') {
            return $this->error('Cancelled invoice cannot be edited.', [
                'statusi' => ['Cancelled invoice cannot be edited.'],
            ], 422);
        }

        if ($invoice->statusi === 'paid' && !$request->user()?->hasRole('admin')) {
            return $this->error('Paid invoice can only be edited by admin.', [
                'statusi' => ['Paid invoice can only be edited by admin.'],
            ], 403);
        }

        return null;
    }
}
