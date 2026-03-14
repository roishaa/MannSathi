import React from 'react';

const EmptySessionsState = () => {
    return (
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl shadow-md bg-lavender text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Sessions Yet</h2>
            <p className="text-gray-600 mb-6">It looks like you haven't booked any sessions. Start your journey to better mental health today!</p>
            <button className="px-4 py-2 rounded-xl bg-soft-blue text-white hover:scale-105 transition-shadow shadow-sm">
                Book Your First Session
            </button>
        </div>
    );
};

export default EmptySessionsState;