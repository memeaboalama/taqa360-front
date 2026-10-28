
import React, { useMemo, useState } from 'react';
import { Invoice, InvoiceStatus, User, Project, ViewType } from '../../../shared/types';
import { PlusIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface FinanceViewProps {
    invoices: Invoice[];
    users: User[];
    projects: Project[];
    navigateTo: (view: ViewType, id: string) => void;
}

const getStatusChipClass = (status: InvoiceStatus) => {
    switch (status) {
        case InvoiceStatus.PAID: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        case InvoiceStatus.ISSUED: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        case InvoiceStatus.OVERDUE: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
        case InvoiceStatus.DRAFT: return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        case InvoiceStatus.CANCELED: return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
        default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
};

const InvoiceRow: React.FC<{ invoice: Invoice, requesterName: string, projectName: string, onView: () => void }> = ({ invoice, requesterName, projectName, onView }) => {
    const { t } = useLanguage();
    return (
        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/30">
            <td onClick={onView} className="px-6 py-4 font-semibold text-brand-primary hover:underline cursor-pointer">#{invoice.invoiceNumber}</td>
            <td className="px-6 py-4">{projectName}</td>
            <td className="px-6 py-4">{requesterName}</td>
            <td className="px-6 py-4">{invoice.issueDate}</td>
            <td className="px-6 py-4">{invoice.dueDate}</td>
            <td className="px-6 py-4 font-mono font-bold text-green-600">{(Number(invoice.totalAmount) || 0).toLocaleString()} {t('sarCurrency')}</td>
            <td className="px-6 py-4">
                 <span className={`px-2 py-1 text-xs whitespace-nowrap font-medium rounded-full ${getStatusChipClass(invoice.status)}`}>
                    {t(`status.${invoice.status}`)}
                 </span>
            </td>
            <td className="px-6 py-4">
                <button onClick={onView} className="text-brand-primary hover:underline font-semibold">{t('viewDetails')}</button>
            </td>
        </tr>
    );
};

const FinanceView: React.FC<FinanceViewProps> = ({ invoices, users, projects, navigateTo }) => {
    const { t } = useLanguage();
    const mappedInvoices = useMemo(() => {
        return invoices.map(inv => {
            const requester = users.find(u => u.id === inv.requesterId);
            const project = projects.find(p => p.id === inv.projectId);
            return {
                ...inv,
                requesterName: requester?.name || t('finance.unknown'),
                projectName: project?.title || t('finance.unlinkedProject')
            }
        });
    }, [invoices, users, projects, t]);
    
    const totalRevenue = useMemo(() => mappedInvoices.filter(i => i.status === InvoiceStatus.PAID).reduce((acc, i) => acc + i.totalAmount, 0), [mappedInvoices]);
    const totalOutstanding = useMemo(() => mappedInvoices.filter(i => i.status === InvoiceStatus.ISSUED || i.status === InvoiceStatus.OVERDUE).reduce((acc, i) => acc + i.totalAmount, 0), [mappedInvoices]);

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('finance')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('finance.subtitle')}</p>
              </div>
               <button className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors shadow-md hover:shadow-lg focus:ring-4 focus:ring-yellow-300">
                    <PlusIcon className="w-5 h-5 me-2" />
                    {t('finance.createInvoice')}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                    <p className="text-sm text-gray-500">{t('finance.totalRevenue')}</p>
                    <p className="text-3xl font-bold text-green-500 mt-1">{totalRevenue.toLocaleString()} {t('sarCurrency')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                    <p className="text-sm text-gray-500">{t('finance.outstandingAmount')}</p>
                    <p className="text-3xl font-bold text-red-500 mt-1">{totalOutstanding.toLocaleString()} {t('sarCurrency')}</p>
                </div>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700">
                <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('finance.invoiceNumber')}</th>
                            <th scope="col" className="px-6 py-3">{t('projects')}</th>
                            <th scope="col" className="px-6 py-3">{t('finance.client')}</th>
                            <th scope="col" className="px-6 py-3">{t('finance.issueDate')}</th>
                            <th scope="col" className="px-6 py-3">{t('finance.dueDate')}</th>
                            <th scope="col" className="px-6 py-3">{t('finance.amount')}</th>
                            <th scope="col" className="px-6 py-3">{t('status')}</th>
                            <th scope="col" className="px-6 py-3">{t('action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mappedInvoices.map(invoice => <InvoiceRow key={invoice.id} invoice={invoice} requesterName={invoice.requesterName} projectName={invoice.projectName} onView={() => navigateTo('invoiceDetail', invoice.id)} />)}
                         {mappedInvoices.length === 0 && (
                            <tr><td colSpan={8} className="text-center py-10 text-gray-500">{t('finance.noInvoices')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinanceView;
