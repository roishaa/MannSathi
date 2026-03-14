import React from 'react';
import { CounselorCard } from '../components/counselors/CounselorCard';
import { EmptyCounselorState } from '../components/counselors/EmptyCounselorState';

const counselorsData = [
    // Sample data structure for counselors
    {
        id: 1,
        name: 'Jane Doe',
        specialization: 'Cognitive Behavioral Therapy',
        rating: 4.8,
        description: 'Experienced in helping clients with anxiety and depression.',
        photo: 'path/to/photo1.jpg',
    },
    {
        id: 2,
        name: 'John Smith',
        specialization: 'Mindfulness and Meditation',
        rating: 4.5,
        description: 'Specializes in mindfulness techniques for stress relief.',
        photo: 'path/to/photo2.jpg',
    },
    // Add more counselors as needed
];

const Counselors = () => {
    return (
        <div className="flex flex-col p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Available Counselors</h1>
            {counselorsData.length === 0 ? (
                <EmptyCounselorState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {counselorsData.map(counselor => (
                        <CounselorCard
                            key={counselor.id}
                            name={counselor.name}
                            specialization={counselor.specialization}
                            rating={counselor.rating}
                            description={counselor.description}
                            photo={counselor.photo}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Counselors;