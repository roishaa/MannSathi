import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageCircle, Calendar, BarChart, Users, Settings as SettingsIcon } from 'lucide-react';

const Topbar = () => {
    return (
        <div className="bg-white shadow-md p-4 rounded-2xl flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">Mental Health Platform</h1>
            <div className="flex items-center space-x-4">
                <Link to="/settings" className="text-gray-600 hover:text-gray-800 transition">
                    <SettingsIcon className="w-6 h-6" />
                </Link>
                {/* Add user profile icon or dropdown here if needed */}
            </div>
        </div>
    );
};

export default Topbar;