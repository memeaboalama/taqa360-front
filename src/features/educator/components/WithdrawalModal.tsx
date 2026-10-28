
import React, { useState } from 'react';
import { SendIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number) => void;
    availableBalance: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, onSubmit, availableBalance }) => {
    const { t } = useLanguage();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleClose = () => {
        setAmount('');
        setError('');
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (!amount || numAmount <= 0) {
            setError(t('modals.invalidAmount'));
            return;
        }
        if (numAmount > availableBalance) {
            setError(t('modals.amountExceedsBalance'));
            return;
        }
        setError('');
        setAmount('');
        onSubmit(numAmount);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={handleClose}
        >
            <form 
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-md p-6 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('modals.newWithdrawalTitle')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('modals.newWithdrawalSubtitle')}</p>
                
                <div>
                    <label htmlFor="amount" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('modals.amountInSAR')}
                    </label>
                    <input 
                        type="number" 
                        id="amount" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary block w-full p-3 dark:bg-slate-700/50 dark:border-slate-600"
                        placeholder={t('modals.amountPlaceholder')}
                    />
                    <p className="text-xs text-slate-400 mt-1">{t('modals.availableBalance', { balance: availableBalance.toLocaleString() })}</p>
                </div>

                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                
                 <div className="mt-6 flex justify-end items-center gap-3">
                    <button type="button" onClick={handleClose} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200/70 rounded-lg hover:bg-slate-300/70 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                        {t('cancel')}
                    </button>
                    <button type="submit" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                        <SendIcon className="w-4 h-4 me-2" />
                        {t('modals.sendRequest')}
                    </button>
                 </div>
            </form>
        </div>
    );
};

export default WithdrawalModal;