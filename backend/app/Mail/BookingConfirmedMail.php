<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $bookingData;

    /**
     * Create a new message instance.
     */
    public function __construct($bookingData)
    {
        $this->bookingData = $bookingData;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('MannSathi Booking Confirmed')
                    ->view('emails.booking_confirmed');
    }
}