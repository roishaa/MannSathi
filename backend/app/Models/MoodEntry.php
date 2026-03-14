<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MoodEntry extends Model
{
    protected $table = 'mood_entries';

    protected $fillable = ['user_id', 'mood', 'mood_score', 'note'];
}
