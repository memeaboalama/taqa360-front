
import React, { useState, useMemo } from 'react';
import { Transaction, WithdrawalRequest } from '../../../shared/types';
import { WalletIcon, CheckCircleIcon, ClockIcon, PlusIcon } from '../../../shared/components/Icons';
import WithdrawalModal from '../components/WithdrawalModal';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface EarningsViewProps {
    transactions: Transaction[];
    withdrawals: WithdrawalRequest[];
    onRequestWithdrawal: (amount: number) => void;
}

const EarningStatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <div className={`p-4 sm:p-6 rounded-xl border bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800`}>
         <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
         </div>
         <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">{title}</p>
         <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
);

const EarningsView: React.FC<EarningsViewProps> = ({ transactions, withdrawals, onRequestWithdrawal }) => {
    const { t } = useLanguage();
    const [isWithdrawalModalOpen, setWithdrawalModalOpen] = useState(false);

    const stats = useMemo(() => {
        const totalEarnings = transactions.filter(t => t.type === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0);
        const totalWithdrawn = withdrawals.filter(w => w.status === 'PROCESSED').reduce((sum, w) => sum + w.amount, 0);
        const availableBalance = totalEarnings - totalWithdrawn;
        return {
            totalEarnings: totalEarnings.toLocaleString(),
            totalWithdrawn: totalWithdrawn.toLocaleString(),
            availableBalance,
            availableBalanceFormatted: availableBalance.toLocaleString(),
        }
    }, [transactions, withdrawals]);

    return (
        <>
            <WithdrawalModal 
                isOpen={isWithdrawalModalOpen}
                onClose={() => setWithdrawalModalOpen(false)}
                onSubmit={(amount) => { onRequestWithdrawal(amount); setWithdrawalModalOpen(false); }}
                availableBalance={stats.availableBalance}
            />
            <div className="animate-fade-in space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('earnings.title')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('earnings.subtitle')}</p>
                    </div>
                     <button onClick={() => setWithdrawalModalOpen(true)} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                        <PlusIcon className="w-5 h-5 me-2" />
                        {t('earnings.requestWithdrawal')}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                     <EarningStatCard title={t('earnings.totalEarnings')} value={`${stats.totalEarnings} ${t('sarCurrency')}`} icon={<WalletIcon className="w-6 h-6"/>} color="bg-yellow-50 text-yellow-800" />
                     <EarningStatCard title={t('earnings.withdrawnAmount')} value={`${stats.totalWithdrawn} ${t('sarCurrency')}`} icon={<CheckCircleIcon className="w-6 h-6"/>} color="bg-green-100 text-green-600 dark:bg-green-900/50" />
                     <EarningStatCard title={t('earnings.availableBalance')} value={`${stats.availableBalanceFormatted} ${t('sarCurrency')}`} icon={<ClockIcon className="w-6 h-6"/>} color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Transactions History */}
                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
                        <h2 className="text-lg font-bold p-4">{t('earnings.transactionsHistory')}</h2>
                        <table className="w-full text-sm text-right text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('modals.description')}</th>
                                    <th scope="col" className="px-6 py-3">{t('earnings.amount')}</th>
                                    <th scope="col" className="px-6 py-3">{t('earnings.date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.id} className="border-b dark:border-slate-700">
                                        <td className="px-6 py-4">{t.description}</td>
                                        <td className={`px-6 py-4 font-mono font-semibold ${t.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-500'}`}>{t.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">{t.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Withdrawal Requests */}
                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
                         <h2 className="text-lg font-bold p-4">{t('earnings.withdrawalRequests')}</h2>
                        <table className="w-full text-sm text-right text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('earnings.amount')}</th>
                                    <th scope="col" className="px-6 py-3">{t('earnings.requestDate')}</th>
                                    <th scope="col" className="px-6 py-3">{t('status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.map(w => (
                                     <tr key={w.id} className="border-b dark:border-slate-700">
                                        <td className="px-6 py-4 font-mono font-semibold">{w.amount.toLocaleString()} {t('sarCurrency')}</td>
                                        <td className="px-6 py-4">{w.requestedAt}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${w.status === 'PROCESSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{w.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EarningsView;
