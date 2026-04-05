<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Booking Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Booking Confirmed</h2>

    <p>Hello {{ $bookingData['name'] ?? 'User' }},</p>

    <p>Your booking has been confirmed successfully.</p>

    <p><strong>Counselor:</strong> {{ $bookingData['counselor_name'] ?? 'Not assigned' }}</p>
    <p><strong>Date:</strong> {{ $bookingData['date'] ?? '' }}</p>
    <p><strong>Time:</strong> {{ $bookingData['time'] ?? '' }}</p>
    <p><strong>Status:</strong> Confirmed</p>

    @if(!empty($bookingData['session_link']))
        <p><strong>Session Link:</strong> 
            <a href="{{ $bookingData['session_link'] }}">{{ $bookingData['session_link'] }}</a>
        </p>
    @endif

    <p>Thank you for using MannSathi.</p>
</body>
</html>