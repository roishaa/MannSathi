import React from 'react';
import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const MoodTracker = () => {
    const [moodEntries, setMoodEntries] = useState([]);

    const handleAddMood = (mood) => {
        setMoodEntries([...moodEntries, { mood, date: new Date().toLocaleDateString() }]);
    };

    return (
        <div className="p-6 bg-lavender min-h-screen">
            <h1 className="text-3xl font-semibold text-center mb-6">Mood Tracker</h1>
            <div className="flex flex-col space-y-6">
                <Card className="shadow-md rounded-2xl p-4">
                    <h2 className="text-xl font-medium">Track Your Mood</h2>
                    <div className="flex space-x-4 mt-4">
                        <Button onClick={() => handleAddMood('Happy')} className="bg-soft-blue hover:scale-105 transition">
                            Happy
                        </Button>
                        <Button onClick={() => handleAddMood('Sad')} className="bg-soft-pink hover:scale-105 transition">
                            Sad
                        </Button>
                        <Button onClick={() => handleAddMood('Anxious')} className="bg-mint-green hover:scale-105 transition">
                            Anxious
                        </Button>
                    </div>
                </Card>
                <Card className="shadow-md rounded-2xl p-4">
                    <h2 className="text-xl font-medium">Your Mood Entries</h2>
                    <div className="mt-4 space-y-2">
                        {moodEntries.length === 0 ? (
                            <p className="text-gray-500">No mood entries yet. Start tracking your mood!</p>
                        ) : (
                            moodEntries.map((entry, index) => (
                                <div key={index} className="flex justify-between p-2 bg-white rounded-xl shadow-sm">
                                    <span>{entry.mood}</span>
                                    <span>{entry.date}</span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MoodTracker;