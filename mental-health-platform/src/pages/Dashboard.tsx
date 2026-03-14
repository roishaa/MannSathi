import React from 'react';
import MoodTodayCard from '../components/dashboard/MoodTodayCard';
import UpcomingSessionCard from '../components/dashboard/UpcomingSessionCard';
import AISupportCard from '../components/dashboard/AISupportCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import DashboardLayout from '../components/layout/DashboardLayout';

const Dashboard = () => {
    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MoodTodayCard />
                    <UpcomingSessionCard />
                    <AISupportCard />
                    <RecentActivityCard />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;