import React from 'react';

interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`bg-soft-blue text-white font-semibold py-2 px-4 rounded-2xl shadow-md transition-transform duration-200 hover:scale-105 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );
};

export default Button;