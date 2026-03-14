import React from 'react';
import { AiOutlineRobot } from 'lucide-react';
import Button from '../ui/Button';

const AISupportCard = () => {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6 transition-transform hover:scale-105">
            <div className="flex items-center space-x-4">
                <AiOutlineRobot className="h-10 w-10 text-soft-blue" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">AI Support</h3>
                    <p className="text-gray-600">Get instant support and guidance from our AI assistant.</p>
                </div>
            </div>
            <Button className="mt-4 w-full">Chat with AI</Button>
        </div>
    );
};

export default AISupportCard;