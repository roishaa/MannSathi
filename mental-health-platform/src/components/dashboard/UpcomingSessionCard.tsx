import React from 'react';
import { Calendar, User } from 'lucide-react';
import Button from '../ui/Button';

interface UpcomingSessionCardProps {
  counselorName: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
}

const UpcomingSessionCard: React.FC<UpcomingSessionCardProps> = ({
  counselorName,
  sessionDate,
  sessionTime,
  sessionType,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 transition-transform hover:scale-105">
      <div className="flex items-center space-x-4">
        <User className="text-soft-blue" />
        <h2 className="text-lg font-semibold">Upcoming Session</h2>
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-gray-600">
          <strong>Counselor:</strong> {counselorName}
        </p>
        <p className="text-gray-600">
          <strong>Date:</strong> {sessionDate}
        </p>
        <p className="text-gray-600">
          <strong>Time:</strong> {sessionTime}
        </p>
        <p className="text-gray-600">
          <strong>Type:</strong> {sessionType}
        </p>
      </div>
      <Button className="mt-4 w-full">Join Session</Button>
    </div>
  );
};

export default UpcomingSessionCard;