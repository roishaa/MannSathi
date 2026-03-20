<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\GuestBooking;
use App\Models\PendingPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EsewaController extends Controller
{
    public function pay(Request $request)
    {
        $validated = $request->validate([
            'counselor_id' => 'required|exists:counselors,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|date_format:H:i',
            'type' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'amount' => 'required|numeric|min:1',
        ]);

        $dateTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['appointment_date'] . ' ' . $validated['appointment_time']
        )->format('Y-m-d H:i:s');

        $alreadyBooked = Appointment::where('counselor_id', $validated['counselor_id'])
            ->where('date_time', $dateTime)
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($alreadyBooked) {
            return response()->json([
                'message' => 'This slot is already booked.'
            ], 422);
        }

        $transactionUuid = 'APPT-' . now()->format('YmdHis') . '-' . rand(1000, 9999);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        PendingPayment::create([
            'user_id' => $user->id,
            'counselor_id' => $validated['counselor_id'],
            'appointment_date' => $validated['appointment_date'],
            'appointment_time' => $validated['appointment_time'],
            'type' => $validated['type'] ?? 'chat',
            'name' => $validated['name'],
            'nickname' => $validated['nickname'] ?? null,
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'amount' => $validated['amount'],
            'payment_method' => 'esewa',
            'transaction_uuid' => $transactionUuid,
            'status' => 'pending',
        ]);

        $amount = number_format((float) $validated['amount'], 2, '.', '');
        $taxAmount = "0";
        $serviceCharge = "0";
        $deliveryCharge = "0";
        $totalAmount = number_format(
            (float) $amount + (float) $taxAmount + (float) $serviceCharge + (float) $deliveryCharge,
            2,
            '.',
            ''
        );

        $productCode = config('services.esewa.merchant_code');
        $secretKey = config('services.esewa.secret_key');

        $signedFieldNames = 'total_amount,transaction_uuid,product_code';
        $message = "total_amount={$totalAmount},transaction_uuid={$transactionUuid},product_code={$productCode}";
        $signature = base64_encode(hash_hmac('sha256', $message, $secretKey, true));

        return response()->json([
            'payment_url' => config('services.esewa.payment_url'),
            'form_fields' => [
                'amount' => $amount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'transaction_uuid' => $transactionUuid,
                'product_code' => $productCode,
                'product_service_charge' => $serviceCharge,
                'product_delivery_charge' => $deliveryCharge,
                'success_url' => config('services.esewa.success_url'),
                'failure_url' => config('services.esewa.failure_url'),
                'signed_field_names' => $signedFieldNames,
                'signature' => $signature,
            ],
        ]);
    }

    public function guestPay(Request $request)
    {
        $validated = $request->validate([
            'guest_booking_id' => 'required|exists:guest_bookings,id',
        ]);

        $guestBooking = GuestBooking::findOrFail($validated['guest_booking_id']);

        if ($guestBooking->payment_status === 'paid') {
            return response()->json([
                'message' => 'Booking already paid.'
            ], 400);
        }

        $dateTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $guestBooking->date . ' ' . Carbon::parse($guestBooking->time)->format('H:i')
        )->format('Y-m-d H:i:s');

        $alreadyBooked = Appointment::where('counselor_id', $guestBooking->counselor_id)
            ->where('date_time', $dateTime)
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($alreadyBooked) {
            return response()->json([
                'message' => 'This slot is already booked.'
            ], 422);
        }

        $transactionUuid = $guestBooking->transaction_uuid;

        $amount = number_format((float) $guestBooking->amount, 2, '.', '');
        $taxAmount = "0";
        $serviceCharge = "0";
        $deliveryCharge = "0";

        $totalAmount = number_format(
            (float) $amount + (float) $taxAmount + (float) $serviceCharge + (float) $deliveryCharge,
            2,
            '.',
            ''
        );

        $productCode = config('services.esewa.merchant_code');
        $secretKey = config('services.esewa.secret_key');

        $signedFieldNames = 'total_amount,transaction_uuid,product_code';
        $message = "total_amount={$totalAmount},transaction_uuid={$transactionUuid},product_code={$productCode}";
        $signature = base64_encode(hash_hmac('sha256', $message, $secretKey, true));

        return response()->json([
            'payment_url' => config('services.esewa.payment_url'),
            'form_fields' => [
                'amount' => $amount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'transaction_uuid' => $transactionUuid,
                'product_code' => $productCode,
                'product_service_charge' => $serviceCharge,
                'product_delivery_charge' => $deliveryCharge,
                'success_url' => config('services.esewa.success_url'),
                'failure_url' => config('services.esewa.failure_url'),
                'signed_field_names' => $signedFieldNames,
                'signature' => $signature,
            ],
        ]);
    }

    public function success(Request $request)
    {
        $encodedData = $request->get('data');

        if (!$encodedData) {
            return redirect('http://localhost:5173/payment-failed?reason=missing-data');
        }

        $decodedJson = base64_decode($encodedData, true);

        if (!$decodedJson) {
            return redirect('http://localhost:5173/payment-failed?reason=invalid-data');
        }

        $responseData = json_decode($decodedJson, true);

        if (!is_array($responseData)) {
            return redirect('http://localhost:5173/payment-failed?reason=invalid-json');
        }

        Log::info('eSewa success callback', $responseData);

        $status = $responseData['status'] ?? null;
        $transactionUuid = $responseData['transaction_uuid'] ?? null;
        $totalAmount = $responseData['total_amount'] ?? null;
        $productCode = $responseData['product_code'] ?? null;
        $receivedSignature = $responseData['signature'] ?? null;

        if (!$transactionUuid || !$totalAmount || !$productCode || !$status) {
            return redirect('http://localhost:5173/payment-failed?reason=incomplete-response');
        }

        $pendingPayment = PendingPayment::where('transaction_uuid', $transactionUuid)->first();
        $guestBooking = GuestBooking::where('transaction_uuid', $transactionUuid)->first();

        if (!$pendingPayment && !$guestBooking) {
            return redirect('http://localhost:5173/payment-failed?reason=payment-not-found');
        }

        if ((string) $productCode !== (string) config('services.esewa.merchant_code')) {
            if ($pendingPayment) {
                $pendingPayment->update([
                    'status' => 'failed',
                    'gateway_response' => json_encode($responseData),
                ]);
            }

            if ($guestBooking) {
                $guestBooking->update([
                    'payment_status' => 'failed',
                    'booking_status' => 'cancelled',
                    'payment_reference' => $transactionUuid,
                ]);
            }

            return redirect('http://localhost:5173/payment-failed?reason=product-code-mismatch');
        }

        if ($receivedSignature) {
            $secretKey = config('services.esewa.secret_key');
            $signedFieldNames = $responseData['signed_field_names'] ?? 'transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names';
            $signedKeys = array_map('trim', explode(',', $signedFieldNames));

            $pairs = [];
            foreach ($signedKeys as $key) {
                if (array_key_exists($key, $responseData)) {
                    $pairs[] = $key . '=' . $responseData[$key];
                }
            }

            $signedMessage = implode(',', $pairs);
            $expectedSignature = base64_encode(hash_hmac('sha256', $signedMessage, $secretKey, true));

            if (!hash_equals($expectedSignature, $receivedSignature)) {
                if ($pendingPayment) {
                    $pendingPayment->update([
                        'status' => 'failed',
                        'gateway_response' => json_encode($responseData),
                    ]);
                }

                if ($guestBooking) {
                    $guestBooking->update([
                        'payment_status' => 'failed',
                        'booking_status' => 'cancelled',
                        'payment_reference' => $transactionUuid,
                    ]);
                }

                return redirect('http://localhost:5173/payment-failed?reason=signature-mismatch');
            }
        }

        if ($status !== 'COMPLETE') {
            if ($pendingPayment) {
                $pendingPayment->update([
                    'status' => 'failed',
                    'gateway_response' => json_encode($responseData),
                ]);
            }

            if ($guestBooking) {
                $guestBooking->update([
                    'payment_status' => 'failed',
                    'booking_status' => 'cancelled',
                    'payment_reference' => $transactionUuid,
                ]);
            }

            return redirect('http://localhost:5173/payment-failed?reason=payment-not-complete');
        }

        if ($guestBooking) {
    if ($guestBooking->payment_status === 'paid' && $guestBooking->booking_status === 'confirmed') {
        return redirect(
            'http://localhost:5173/guest-session/' .
            $guestBooking->id .
            '?token=' .
            $guestBooking->guest_token
        );
    }

    $dateTime = Carbon::createFromFormat(
        'Y-m-d H:i',
        $guestBooking->date . ' ' . Carbon::parse($guestBooking->time)->format('H:i')
    )->format('Y-m-d H:i:s');

    $alreadyBooked = Appointment::where('counselor_id', $guestBooking->counselor_id)
        ->where('date_time', $dateTime)
        ->whereNotIn('status', ['cancelled'])
        ->exists();

    if ($alreadyBooked) {
        $guestBooking->update([
            'payment_status' => 'failed',
            'booking_status' => 'cancelled',
            'payment_reference' => $transactionUuid,
        ]);

        return redirect('http://localhost:5173/payment-failed?reason=slot-taken');
    }

    $appointment = Appointment::create([
        'user_id' => null,
        'counselor_id' => $guestBooking->counselor_id,
        'date_time' => $dateTime,
        'type' => $guestBooking->session_type,
        'name' => $guestBooking->guest_name,
        'nickname' => null,
        'email' => $guestBooking->guest_email,
        'phone' => $guestBooking->guest_phone,
        'status' => 'confirmed',
        'payment_method' => 'esewa',
        'payment_status' => 'paid',
        'amount' => $totalAmount,
        'transaction_ref' => $transactionUuid,
    ]);

    $guestBooking->update([
        'payment_status' => 'paid',
        'booking_status' => 'confirmed',
        'payment_reference' => $transactionUuid,
    ]);

    return redirect(
        'http://localhost:5173/guest-session/' .
        $guestBooking->id .
        '?token=' .
        $guestBooking->guest_token .
        '&appointment_id=' .
        $appointment->id
    );
}
        if ($pendingPayment->status === 'completed') {
            $existingAppointment = Appointment::where('transaction_ref', $transactionUuid)->first();

            if ($existingAppointment) {
                return redirect('http://localhost:5173/payment-success?appointment_id=' . $existingAppointment->id);
            }

            return redirect('http://localhost:5173/payment-failed?reason=already-processed');
        }

        $datePart = Carbon::parse($pendingPayment->appointment_date)->format('Y-m-d');
        $timePart = Carbon::parse($pendingPayment->appointment_time)->format('H:i:s');

        $dateTime = Carbon::createFromFormat(
            'Y-m-d H:i:s',
            $datePart . ' ' . $timePart
        )->format('Y-m-d H:i:s');

        $alreadyBooked = Appointment::where('counselor_id', $pendingPayment->counselor_id)
            ->where('date_time', $dateTime)
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($alreadyBooked) {
            $pendingPayment->update([
                'status' => 'failed',
                'gateway_response' => json_encode($responseData),
            ]);

            return redirect('http://localhost:5173/payment-failed?reason=slot-taken');
        }

        $appointment = Appointment::create([
            'user_id' => $pendingPayment->user_id,
            'counselor_id' => $pendingPayment->counselor_id,
            'date_time' => $dateTime,
            'type' => $pendingPayment->type,
            'name' => $pendingPayment->name,
            'nickname' => $pendingPayment->nickname,
            'email' => $pendingPayment->email,
            'phone' => $pendingPayment->phone,
            'status' => 'confirmed',
            'payment_method' => 'esewa',
            'payment_status' => 'paid',
            'amount' => $totalAmount,
            'transaction_ref' => $transactionUuid,
        ]);

        $pendingPayment->update([
            'status' => 'completed',
            'gateway_response' => json_encode($responseData),
        ]);

        return redirect('http://localhost:5173/payment-success?appointment_id=' . $appointment->id);
    }

    public function failure(Request $request)
    {
        $transactionUuid = $request->get('transaction_uuid');

        if ($transactionUuid) {
            $pendingPayment = PendingPayment::where('transaction_uuid', $transactionUuid)->first();
            $guestBooking = GuestBooking::where('transaction_uuid', $transactionUuid)->first();

            if ($pendingPayment && $pendingPayment->status === 'pending') {
                $pendingPayment->update([
                    'status' => 'failed',
                    'gateway_response' => json_encode($request->all()),
                ]);
            }

            if ($guestBooking && $guestBooking->payment_status === 'pending') {
                $guestBooking->update([
                    'payment_status' => 'failed',
                    'booking_status' => 'cancelled',
                    'payment_reference' => $transactionUuid,
                ]);
            }
        }

        return redirect('http://localhost:5173/payment-failed');
    }
}