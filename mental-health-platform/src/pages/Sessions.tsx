import React from 'react';
import { useSelector } from 'react-redux';
import SessionCard from '../components/sessions/SessionCard';
import EmptySessionsState from '../components/sessions/EmptySessionsState';

const Sessions = () => {
    const sessions = useSelector((state) => state.sessions); // Assuming sessions are stored in Redux state

    return (
        <div className="flex flex-col p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">My Sessions</h1>
            {sessions.length === 0 ? (
                <EmptySessionsState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session) => (
                        <SessionCard key={session.id} session={session} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Sessions;