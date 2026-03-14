import React from 'react';

const Settings = () => {
    return (
        <div className="flex flex-col p-6 space-y-6 bg-lavender rounded-2xl shadow-md">
            <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-md p-6 hover:scale-105 transition">
                    <h2 className="text-lg font-medium text-gray-700">Account Information</h2>
                    <p className="text-gray-600">Manage your account details and preferences.</p>
                    <button className="mt-4 bg-soft-blue text-white rounded-xl px-4 py-2 hover:bg-blue-600 transition">
                        Edit Account
                    </button>
                </div>
                <div className="bg-white rounded-2xl shadow-md p-6 hover:scale-105 transition">
                    <h2 className="text-lg font-medium text-gray-700">Privacy Settings</h2>
                    <p className="text-gray-600">Control your privacy settings and data sharing.</p>
                    <button className="mt-4 bg-soft-blue text-white rounded-xl px-4 py-2 hover:bg-blue-600 transition">
                        Update Privacy
                    </button>
                </div>
                <div className="bg-white rounded-2xl shadow-md p-6 hover:scale-105 transition">
                    <h2 className="text-lg font-medium text-gray-700">Notification Preferences</h2>
                    <p className="text-gray-600">Set your notification preferences for updates.</p>
                    <button className="mt-4 bg-soft-blue text-white rounded-xl px-4 py-2 hover:bg-blue-600 transition">
                        Manage Notifications
                    </button>
                </div>
                <div className="bg-white rounded-2xl shadow-md p-6 hover:scale-105 transition">
                    <h2 className="text-lg font-medium text-gray-700">Security Settings</h2>
                    <p className="text-gray-600">Enhance your account security and recovery options.</p>
                    <button className="mt-4 bg-soft-blue text-white rounded-xl px-4 py-2 hover:bg-blue-600 transition">
                        Update Security
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;