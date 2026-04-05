<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SessionReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reminderData;

    public function __construct($reminderData)
    {
        $this->reminderData = $reminderData;
    }

    public function build()
    {
        return $this->subject('MannSathi Session Reminder')
                    ->view('emails.session_reminder');
    }
}