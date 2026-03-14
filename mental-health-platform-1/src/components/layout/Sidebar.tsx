import { Link } from 'react-router-dom';
import { Home, MessageCircle, Calendar, BarChart, Users, Settings as SettingsIcon } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="w-64 h-full bg-lavender shadow-md rounded-2xl p-6">
            <nav className="flex flex-col space-y-6">
                <Link to="/dashboard" className="flex items-center p-4 rounded-xl hover:scale-105 transition">
                    <Home className="mr-3" />
                    <span className="text-lg font-semibold">Dashboard</span>
                </Link>
                <Link to="/chat" className="flex items-center p-4 rounded-xl hover:scale-105 transition">
                    <MessageCircle className="mr-3" />
                    <span className="text-lg font-semibold">Chat with AI</span>
                </Link>
                <Link to="/sessions" className="flex items-center p-4 rounded-xl hover:scale-105 transition">
                    <Calendar className="mr-3" />
                    <span className="text-lg font-semibold">My Sessions</span>
                </Link>
                <Link to="/mood-tracker" className="flex items-center p-4 rounded-xl hover:scale-105 transition">
                    <BarChart className="mr-3" />
                    <span className="text-lg font-semibold">Mood Tracker</span>
                </Link>
                <Link to="/counselors" className="flex items-center p-4 rounded-xl hover:scale-105 transition">
                    <Users className="mr-3" />
                    <span className="text-lg font-semibold">Counselors</span>
                </Link>
                <Link to="/settings" className="flex items-center p-4 rounded-xl hover:scale-105 transition">
                    <SettingsIcon className="mr-3" />
                    <span className="text-lg font-semibold">Settings</span>
                </Link>
            </nav>
        </aside>
    );
};

export default Sidebar;