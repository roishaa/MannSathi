import React from 'react';

interface SessionCardProps {
  counselorName: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  onJoinSession: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  counselorName,
  sessionDate,
  sessionTime,
  sessionType,
  onJoinSession,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 transition-transform hover:scale-105">
      <h3 className="text-lg font-semibold text-gray-800">{counselorName}</h3>
      <p className="text-gray-600">{sessionDate}</p>
      <p className="text-gray-600">{sessionTime}</p>
      <p className="text-gray-500">{sessionType}</p>
      <button
        onClick={onJoinSession}
        className="mt-4 bg-soft-blue text-white rounded-xl px-4 py-2 transition-colors hover:bg-blue-600"
      >
        Join Session
      </button>
    </div>
  );
};

export default SessionCard;