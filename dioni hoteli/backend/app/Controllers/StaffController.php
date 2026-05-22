<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StoreStaffRequest;
use App\Http\Requests\Staff\UpdateStaffRequest;
use App\Http\Resources\StaffResource;
use App\Models\Staff;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class StaffController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Staff::query()->latest();

        if ($request->filled('departamenti')) {
            $query->where('departamenti', $request->string('departamenti')->toString());
        }

        if ($request->filled('turni')) {
            $query->where('turni', $request->string('turni')->toString());
        }

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->string('statusi')->toString());
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('emri', 'like', '%' . $search . '%')
                    ->orWhere('mbiemri', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('pozicioni', 'like', '%' . $search . '%');
            });
        }

        return $this->success('Staff fetched successfully.', StaffResource::collection($query->get()));
    }

    public function show(int $id): JsonResponse
    {
        $staff = Staff::query()->find($id);
        if (!$staff) {
            return $this->error('Staff not found.', null, 404);
        }

        return $this->success('Staff fetched successfully.', new StaffResource($staff));
    }

    public function store(StoreStaffRequest $request): JsonResponse
    {
        try {
            $staff = Staff::query()->create($request->validated());
            return $this->success('Staff created successfully.', new StaffResource($staff), 201);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to create staff.', null, 500);
        }
    }

    public function update(UpdateStaffRequest $request, int $id): JsonResponse
    {
        $staff = Staff::query()->find($id);
        if (!$staff) {
            return $this->error('Staff not found.', null, 404);
        }

        try {
            $staff->update($request->validated());
            return $this->success('Staff updated successfully.', new StaffResource($staff->fresh()));
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to update staff.', null, 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $staff = Staff::query()->find($id);
        if (!$staff) {
            return $this->error('Staff not found.', null, 404);
        }

        try {
            $staff->delete();
            return $this->success('Staff deleted successfully.', null);
        } catch (Throwable $exception) {
            report($exception);
            return $this->error('Failed to delete staff.', null, 500);
        }
    }
}
