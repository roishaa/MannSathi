import React from 'react';

const EmptyState = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl shadow-md bg-lavender text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Data Available</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <button className="px-4 py-2 rounded-xl bg-soft-blue text-white hover:scale-105 transition duration-200 shadow-sm">
                Take Action
            </button>
        </div>
    );
};

export default EmptyState;