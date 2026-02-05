<?php

namespace App\Http\Controllers;

use App\Models\JenisPasien;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JenisPasienController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return Inertia::render('JenisPasien/Index', [
            'jenis_pasiens' => JenisPasien::all(),
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(JenisPasien $jenisPasien)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JenisPasien $jenisPasien)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JenisPasien $jenisPasien)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JenisPasien $jenisPasien)
    {
        //
    }
}
