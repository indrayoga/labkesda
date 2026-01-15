<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        //
        return Inertia::render('Customer/Index', [
            'customers' => Customer::with('kecamatan', 'kelurahan')->where('nama', 'like', '%' . $request->nama . '%')->latest()->paginate(10),
            'kecamatans' => Kecamatan::all(),
            'kelurahans' => Kelurahan::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'no_telepon' => 'required|string',
            'alamat' => 'required|string|max:500',
            'kecamatan_id' => 'nullable|exists:kecamatan,id',
            'kelurahan_id' => 'nullable|exists:kelurahan,id',
        ]);

        Customer::create([
            'nama' => $request->nama,
            'no_telepon' => $request->no_telepon,
            'alamat' => $request->alamat,
            'kecamatan_id' => $request->kecamatan_id,
            'kelurahan_id' => $request->kelurahan_id,
        ]);

        return \redirect()->route('customers.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'no_telepon' => 'required|string',
            'alamat' => 'required|string|max:500',
            'kecamatan_id' => 'nullable|exists:kecamatan,id',
            'kelurahan_id' => 'nullable|exists:kelurahan,id',
        ]);

        $customer->update([
            'nama' => $request->nama,
            'no_telepon' => $request->no_telepon,
            'alamat' => $request->alamat,
            'kecamatan_id' => $request->kecamatan_id,
            'kelurahan_id' => $request->kelurahan_id,
        ]);

        return \redirect()->route('customers.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        //
        $customer->delete();
        return redirect()->route('customers.index');
    }
}
