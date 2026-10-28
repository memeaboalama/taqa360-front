
import React, { useState } from 'react';
import { CheckCircleIcon } from '../../../../shared/components/Icons';
import { useLanguage } from '../../../../app/providers/LanguageProvider';

interface AssignmentAgreementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (agreement: string) => void;
}

const AssignmentAgreementModal: React.FC<AssignmentAgreementModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const { t } = useLanguage();
    const [agreement, setAgreement] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(agreement);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in px-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 lg:p-8 m-4 flex flex-col items-center text-center animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                 <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 mb-4">
                    <CheckCircleIcon className="w-8 h-8"/>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('modals.assignmentAgreementTitle')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('modals.assignmentAgreementSubtitle')}</p>
                <form onSubmit={handleSubmit} className="w-full space-y-4 text-start">
                    <div>
                        <label htmlFor="assignment-agreement" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            {t('modals.messageOptional')}
                        </label>
                        <textarea 
                            id="assignment-agreement" 
                            rows={5}
                            value={agreement} 
                            onChange={e => setAgreement(e.target.value)} 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 focus:ring-brand-primary"
                            placeholder={t('modals.agreementPlaceholder')}></textarea>
                    </div>
                    <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse pt-4">
                        <button type="button" onClick={onClose} className="px-8 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors">
                            {t('cancel')}
                        </button>
                        <button type="submit" className="px-8 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 shadow-md transition-colors">
                           {t('modals.confirmAssignment')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignmentAgreementModal;