import React from 'react';
import { ToastNotification } from '../types';
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon } from './Icons';

interface ToastProps {
    notification: ToastNotification;
}

const Toast: React.FC<ToastProps> = ({ notification }) => {
    const iconMap = {
        success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
        error: <XCircleIcon className="w-6 h-6 text-red-500" />,
        info: <AlertCircleIcon className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />,
    };

    return (
        <div className="max-w-sm w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-slate-200 dark:ring-slate-700 ring-opacity-5 overflow-hidden animate-fade-in-up">
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {iconMap[notification.type]}
                    </div>
                    <div className="ms-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {notification.message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface ToastContainerProps {
    notifications: ToastNotification[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ notifications }) => {
    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[9999]"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map(notification => (
                    <Toast key={notification.id} notification={notification} />
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;
