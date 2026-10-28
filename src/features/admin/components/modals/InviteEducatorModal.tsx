
import React, { useState } from 'react';
import { SendIcon } from '../../../../shared/components/Icons';
import { useLanguage } from '../../../../app/providers/LanguageProvider';

interface InviteEducatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string) => void;
    isLoading?: boolean;
}

const InviteEducatorModal: React.FC<InviteEducatorModalProps> = ({ isOpen, onClose, onInvite, isLoading }) => {
    const { t, language } = useLanguage();
    const [email, setEmail] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            alert(t('common.fillRequiredFields'));
            return;
        }
        onInvite(email);
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fade-in"
            onClick={handleClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md p-6 lg:p-8 m-4 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('modals.inviteEducatorTitle')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('modals.inviteEducatorSubtitle')}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="invite-email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('modals.educatorEmail')}</label>
                        <input
                            type="email"
                            id="invite-email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="name@example.com" required />
                    </div>

                    <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-4">
                        <button type="button" onClick={handleClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={isLoading} className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <svg className="w-4 h-4 me-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <SendIcon className="w-4 h-4 me-2" />
                            )}
                            {isLoading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t('modals.sendInvitation')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteEducatorModal;
