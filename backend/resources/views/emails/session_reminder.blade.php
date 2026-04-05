<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Session Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Your session is about to start</h2>

    <p>Hello {{ $reminderData['name'] ?? 'User' }},</p>

    <p>This is a reminder that your counseling session will start in about 5 minutes.</p>

    <p><strong>Counselor:</strong> {{ $reminderData['counselor_name'] ?? 'Assigned Counselor' }}</p>
    <p><strong>Date:</strong> {{ $reminderData['date'] ?? '' }}</p>
    <p><strong>Time:</strong> {{ $reminderData['time'] ?? '' }}</p>

    @if(!empty($reminderData['session_link']))
        <p><strong>Session Link:</strong>
            <a href="{{ $reminderData['session_link'] }}">{{ $reminderData['session_link'] }}</a>
        </p>
    @endif

    <p>Please be ready to join on time.</p>
    <p>Thank you for using MannSathi.</p>
</body>
</html>