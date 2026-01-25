<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class HospitalAdmin extends Authenticatable {
  use HasApiTokens;

  protected $fillable = ['name','email','password','hospital_id','hospital_name'];
  protected $hidden = ['password'];
}
