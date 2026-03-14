import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, action }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6 transition-transform hover:scale-105">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
            <div className="mb-4">{children}</div>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export default Card;