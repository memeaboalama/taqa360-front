import React from 'react';
// FIX: Added InvoiceStatus to the import.
import { Project, Educator, Invoice, ProjectStatus, InvoiceStatus } from '../../../shared/types';
import { ChartBarIcon, UsersIcon, ReceiptPercentIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface ReportsViewProps {
    projects: Project[];
    educators: Educator[];
    invoices: Invoice[];
}

const ReportCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border dark:border-gray-700">
        <div className="flex items-center mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-brand-primary dark:text-brand-accent">{icon}</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white ms-3">{title}</h2>
        </div>
        <div>{children}</div>
    </div>
);

const SimpleBarChart: React.FC<{ data: { label: string, value: number }[], colorClass: string }> = ({ data, colorClass }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex justify-around items-end h-48 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            {data.map(item => (
                <div key={item.label} className="flex flex-col items-center w-1/4">
                    <div
                        className={`w-1/2 rounded-t-md ${colorClass}`}
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                        title={`${item.label}: ${item.value}`}
                    ></div>
                    <span className="text-xs mt-2 text-gray-500 dark:text-gray-400">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

const ReportsView: React.FC<ReportsViewProps> = ({ projects, educators, invoices }) => {
    const { t } = useLanguage();
    const projectStatusData = Object.values(ProjectStatus).map(status => ({
        label: t(`status.${status}`),
        value: projects.filter(p => p.status === status).length,
    }));
    
    const totalRevenue = invoices.filter(i => i.status === InvoiceStatus.PAID).reduce((sum, i) => sum + i.totalAmount, 0);
    const topEducators = [...educators].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const avgProjectValue = projects.length > 0 ? (projects.reduce((sum, p) => sum + (p.budget || 0), 0) / projects.length) : 0;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('reports.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard title={t('reports.projectStatus')} icon={<ChartBarIcon className="w-6 h-6"/>}>
                    <SimpleBarChart data={projectStatusData} colorClass="bg-[var(--primary-color)]"/>
                </ReportCard>

                <ReportCard title={t('reports.educatorPerformance')} icon={<UsersIcon className="w-6 h-6"/>}>
                    <ul className="space-y-2">
                        {topEducators.map(e => (
                            <li key={e.id} className="flex justify-between items-center text-sm">
                                <span>{e.name}</span>
                                <span className="font-bold">{e.rating.toFixed(1)} ★</span>
                            </li>
                        ))}
                    </ul>
                </ReportCard>
                
                <ReportCard title={t('reports.financialPerformance')} icon={<ReceiptPercentIcon className="w-6 h-6"/>}>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">{t('totalRevenue')}</p>
                            <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} {t('sarCurrency')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('reports.avgProjectValue')}</p>
                             <p className="text-2xl font-bold">{avgProjectValue.toLocaleString()} {t('sarCurrency')}</p>
                        </div>
                    </div>
                </ReportCard>
            </div>
        </div>
    );
};

export default ReportsView;