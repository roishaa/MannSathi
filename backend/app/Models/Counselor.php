<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Counselor extends Authenticatable {
  use HasApiTokens;

  protected $fillable = [
    'name','email','password','specialization','license_no','experience_years','bio',
    'license_document_path','degree_document_path','id_document_path','status','hospital_id'
  ];

  protected $hidden = ['password'];
}

