
import React, { useState } from 'react';
import { Invoice, User, Project, ViewType, InvoiceStatus } from '../../../shared/types';
import { ArrowLeftIcon, ArrowRightIcon, PrinterIcon, SendIcon, CheckCircleIcon, CreditCardIcon } from '../../../shared/components/Icons';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface InvoiceDetailViewProps {
    invoice: Invoice;
    requester: User;
    project: Project;
    navigateTo: (view: ViewType, id?: string) => void;
    onUpdateStatus: (invoiceId: string, newStatus: InvoiceStatus) => void;
}

const getStatusInfo = (status: InvoiceStatus, t: (key: string) => string) => {
    const statusText = t(`status.${status}`);
    switch (status) {
        case InvoiceStatus.PAID: return { text: statusText, color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' };
        case InvoiceStatus.ISSUED: return { text: statusText, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' };
        case InvoiceStatus.OVERDUE: return { text: statusText, color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' };
        default: return { text: statusText, color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300' };
    }
}

const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({ invoice, requester, project, navigateTo, onUpdateStatus }) => {
    const { t, language } = useLanguage();
    const [isConfirmingPaid, setConfirmingPaid] = useState(false);
    const statusInfo = getStatusInfo(invoice.status, t);

    return (
        <>
        {isConfirmingPaid && <ConfirmationModal
            isOpen={true}
            onClose={() => setConfirmingPaid(false)}
            onConfirm={() => {
                onUpdateStatus(invoice.id, InvoiceStatus.PAID);
                setConfirmingPaid(false);
            }}
            title={t('invoice.confirmPaymentTitle')}
            message={t('invoice.confirmPaymentMessage', { invoiceNumber: invoice.invoiceNumber })}
            icon={<CheckCircleIcon className="w-8 h-8"/>}
            confirmButtonClass="bg-green-600 hover:bg-green-700"
            confirmText={t('invoice.confirmPaymentYes')}
        />}
        <div className="animate-fade-in">
            <div className="mb-6">
                <button onClick={() => navigateTo('finance')} className="flex items-center text-sm text-brand-primary dark:text-yellow-500 hover:underline mb-3">
                    {language === 'ar' ? <ArrowRightIcon className="w-4 h-4 me-1" /> : <ArrowLeftIcon className="w-4 h-4 me-1" />} {t('invoice.backToFinance')}
                </button>
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('invoice.invoiceTitle', { invoiceNumber: invoice.invoiceNumber })}</h1>
                        <span className={`mt-1 px-3 py-1 inline-flex items-center text-sm font-semibold rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600">
                            <PrinterIcon className="w-4 h-4"/> {t('invoice.print')}
                        </button>
                         {invoice.status !== InvoiceStatus.PAID && (
                            <button onClick={() => setConfirmingPaid(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                                <CreditCardIcon className="w-4 h-4"/> {t('invoice.markAsPaid')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Invoice Content */}
        </div>
        </>
    );
};

export default InvoiceDetailView;
