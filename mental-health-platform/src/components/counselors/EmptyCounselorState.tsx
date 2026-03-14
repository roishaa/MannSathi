import React from 'react';

const EmptyCounselorState = () => {
    return (
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl shadow-md bg-lavender text-center">
            <h2 className="text-2xl font-semibold text-soft-blue mb-4">No Counselors Available</h2>
            <p className="text-lg text-gray-600 mb-6">It looks like there are currently no counselors available. Please check back later or explore other options.</p>
            <button className="px-4 py-2 rounded-xl bg-soft-pink text-white hover:scale-105 transition duration-200 shadow-sm">
                Explore Options
            </button>
        </div>
    );
};

export default EmptyCounselorState;