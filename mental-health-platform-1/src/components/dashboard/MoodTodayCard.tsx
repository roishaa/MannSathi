import React from 'react';
import { MoodHappy } from 'lucide-react';

const MoodTodayCard = () => {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6 transition-transform hover:scale-105">
            <div className="flex items-center space-x-4">
                <MoodHappy className="h-8 w-8 text-mint-green" />
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Mood Today</h2>
                    <p className="text-gray-600">How are you feeling today?</p>
                </div>
            </div>
            <button className="mt-4 bg-soft-pink text-white rounded-xl px-4 py-2 transition-colors hover:bg-soft-pink/80">
                Share Your Mood
            </button>
        </div>
    );
};

export default MoodTodayCard;