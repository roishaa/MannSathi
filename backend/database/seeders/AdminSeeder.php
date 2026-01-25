<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\PlatformAdmin;
use App\Models\HospitalAdmin;

class AdminSeeder extends Seeder {
  public function run(): void {
    PlatformAdmin::updateOrCreate(
      ['email' => 'owner@mannsathi.com'],
      ['name' => 'MannSathi Owner', 'password' => Hash::make('owner123')]
    );

    HospitalAdmin::updateOrCreate(
      ['email' => 'admin@hospital.com'],
      [
        'name' => 'Hospital Admin',
        'password' => Hash::make('admin123'),
        'hospital_id' => 'hosp_001',
        'hospital_name' => 'MannSathi General Hospital'
      ]
    );
  }
}
