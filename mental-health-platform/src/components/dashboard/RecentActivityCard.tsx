import React from 'react';
import { ActivityIcon } from 'lucide-react'; // Importing an icon from lucide-react
import Card from '../ui/Card'; // Importing the reusable Card component

const RecentActivityCard = () => {
    return (
        <Card className="p-6 rounded-2xl shadow-md hover:scale-105 transition-transform duration-300">
            <div className="flex items-center space-x-4">
                <ActivityIcon className="h-8 w-8 text-soft-blue" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                    <p className="text-sm text-gray-600">Check your latest interactions and sessions.</p>
                </div>
            </div>
            <div className="mt-4 space-y-4">
                {/* Example activity items */}
                <div className="flex justify-between items-center p-4 bg-lavender rounded-xl shadow-sm">
                    <div>
                        <p className="text-gray-700">Joined session with Dr. Smith</p>
                        <p className="text-xs text-gray-500">March 15, 2026, 3:00 PM</p>
                    </div>
                    <button className="text-soft-pink hover:underline">View</button>
                </div>
                <div className="flex justify-between items-center p-4 bg-lavender rounded-xl shadow-sm">
                    <div>
                        <p className="text-gray-700">Completed mood tracker</p>
                        <p className="text-xs text-gray-500">March 14, 2026</p>
                    </div>
                    <button className="text-soft-pink hover:underline">View</button>
                </div>
            </div>
        </Card>
    );
};

export default RecentActivityCard;