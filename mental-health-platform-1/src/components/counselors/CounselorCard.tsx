import React from 'react';

interface CounselorCardProps {
    photo: string;
    name: string;
    specialization: string;
    rating: number;
    description: string;
    onBookSession: () => void;
}

const CounselorCard: React.FC<CounselorCardProps> = ({ photo, name, specialization, rating, description, onBookSession }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6 transition-transform hover:scale-105">
            <img src={photo} alt={`${name}'s profile`} className="w-24 h-24 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-center text-gray-800">{name}</h3>
            <p className="text-sm text-center text-gray-600">{specialization}</p>
            <p className="text-sm text-center text-gray-500 my-2">{description}</p>
            <div className="flex justify-center items-center">
                <span className="text-yellow-500 mr-2">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
                <span className="text-gray-500">({rating})</span>
            </div>
            <button 
                onClick={onBookSession} 
                className="mt-4 w-full bg-soft-pink text-white rounded-xl py-2 hover:bg-pink-600 transition-colors"
            >
                Book Session
            </button>
        </div>
    );
};

export default CounselorCard;