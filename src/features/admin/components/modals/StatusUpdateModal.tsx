
import React, { useState } from 'react';
import { useLanguage } from '../../../../app/providers/LanguageProvider';

interface StatusUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    label: string;
    onSubmit: (reason: string) => void;
    icon: React.ReactNode;
    isReasonRequired?: boolean;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    description, 
    label,
    onSubmit, 
    icon, 
    isReasonRequired = true
}) => {
    const { t } = useLanguage();
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        if (isSubmitting) return; // prevent close during submission
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReasonRequired && !reason.trim()) {
            setError(t('modals.fieldRequired'));
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await Promise.resolve(onSubmit(reason));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in px-4"
            onClick={handleClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 lg:p-8 m-4 flex flex-col items-center text-center animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 mb-4">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{description}</p>
                <form onSubmit={handleSubmit} className="w-full space-y-4 text-start">
                    <div>
                        <label htmlFor="status-update-reason" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            {label}
                        </label>
                        <textarea 
                            id="status-update-reason" 
                            rows={3}
                            value={reason} 
                            onChange={(e) => { setReason(e.target.value); if (error) setError(''); }} 
                            disabled={isSubmitting}
                            className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-2 block w-full p-2.5 dark:bg-gray-700/50 disabled:opacity-60 ${error ? 'border-red-500 focus:ring-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            style={error ? undefined : { borderColor: 'var(--primary-color)', '--tw-ring-color': 'var(--primary-color)' } as React.CSSProperties}
                            placeholder={t('modals.reasonPlaceholder')}></textarea>
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                    <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-8 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-2.5 text-sm font-medium text-white rounded-lg shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'var(--primary-color)' }}
                        >
                            {isSubmitting && (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}
                            {isSubmitting ? 'جارِ الحفظ...' : t('confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StatusUpdateModal;