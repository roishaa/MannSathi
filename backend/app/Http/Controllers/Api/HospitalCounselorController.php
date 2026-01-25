<?php

// app/Http/Controllers/Api/HospitalCounselorController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Counselor;

class HospitalCounselorController extends Controller
{
  public function index(Request $request) {
    // one hospital only
    $list = Counselor::orderByDesc('id')->get([
      'id','name','email','specialization','license_no','experience_years','status','created_at'
    ]);

    return response()->json($list);
  }

  public function approve($id) {
    $c = Counselor::findOrFail($id);
    $c->status = 'APPROVED';
    $c->save();
    return response()->json(['message' => 'Approved', 'id'=>$c->id, 'status'=>$c->status]);
  }

  public function reject($id) {
    $c = Counselor::findOrFail($id);
    $c->status = 'REJECTED';
    $c->save();
    return response()->json(['message' => 'Rejected', 'id'=>$c->id, 'status'=>$c->status]);
  }
}
