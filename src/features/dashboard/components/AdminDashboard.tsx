
import React from 'react';
import { Project, Bid, Educator, User, EducationalRequest, Invoice, ProjectStatus, EducationalRequestStatus, AdminActivity, AdminActivityIcon, ViewType, InvoiceStatus } from '../../../shared/types';
import { DollarSignIcon, BriefcaseIcon, AcademicCapIcon, UserCheckIcon, ReceiptPercentIcon, UserPlusIcon, UsersIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface AdminDashboardProps {
    projects: Project[];
    bids: Bid[];
    educators: Educator[];
    users: User[];
    educationalRequests: EducationalRequest[];
    invoices: Invoice[];
    activityFeed: AdminActivity[];
    navigateTo: (view: ViewType, id?: string) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; description: string; }> = ({ title, value, icon, description }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 flex items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 text-brand-primary dark:text-brand-accent rounded-xl">
      {icon}
    </div>
    <div className="ms-4">
      <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{value}</p>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  </div>
);

const ActivityIcon: React.FC<{type: AdminActivityIcon}> = ({ type }) => {
    const iconMap = {
        application: { icon: <UserPlusIcon className="w-5 h-5"/>, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400' },
        invoice: { icon: <ReceiptPercentIcon className="w-5 h-5"/>, color: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' },
        project: { icon: <BriefcaseIcon className="w-5 h-5"/>, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' },
        user: { icon: <UsersIcon className="w-5 h-5"/>, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' },
        request: { icon: <UserCheckIcon className="w-5 h-5"/>, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' },
    };
    const { icon, color } = iconMap[type];
    return <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ projects, educators, users, educationalRequests, invoices, activityFeed, navigateTo }) => {
    const { t } = useLanguage();
    const totalRevenue = invoices
        .filter(i => i.status === InvoiceStatus.PAID)
        .reduce((sum, i) => sum + i.totalAmount, 0);
        
    const stats = {
        totalRevenue: `${totalRevenue.toLocaleString()} ${t('sarCurrency')}`,
        activeProjects: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
        totalEducators: educators.length,
        pendingRequests: educationalRequests.filter(r => r.status === EducationalRequestStatus.PENDING).length,
    };

    const recentProjects = projects.slice(0, 5);
    const pendingRequests = educationalRequests.filter(r => r.status === EducationalRequestStatus.PENDING).slice(0, 5);

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-white">{t('adminDashboardTitle')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('adminDashboardSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    title={t('totalRevenue')}
                    value={stats.totalRevenue} 
                    icon={<DollarSignIcon className="w-8 h-8"/>} 
                    description={t('fromPaidInvoices')}
                />
                <StatCard 
                    title={t('activeProjects')}
                    value={stats.activeProjects} 
                    icon={<BriefcaseIcon className="w-8 h-8"/>}
                    description={t('projectsInProgress')}
                />
                <StatCard 
                    title={t('totalEducators')}
                    value={stats.totalEducators} 
                    icon={<AcademicCapIcon className="w-8 h-8"/>} 
                    description={t('approvedEducators')}
                />
                <StatCard 
                    title={t('pendingRequests')}
                    value={stats.pendingRequests} 
                    icon={<UserCheckIcon className="w-8 h-8"/>} 
                    description={t('requestsAwaitingReview')}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">{t('recentProjects')}</h2>
                    <ul className="space-y-3">
                        {recentProjects.map(p => (
                            <li key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200">{p.title}</p>
                                    <p className="text-xs text-slate-500">{t(`status.${p.status}`)}</p>
                                </div>
                                <span className="font-mono text-sm font-bold text-green-600">{p.budget?.toLocaleString()} {t('sarCurrency')}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">{t('recentActivity')}</h2>
                    <ul className="space-y-4">
                        {activityFeed.map(activity => (
                            <li key={activity.id} onClick={() => activity.link && navigateTo(activity.link.view, activity.link.id)} className={`flex items-start gap-3 ${activity.link ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 -m-2 p-2 rounded-lg' : ''}`}>
                                <ActivityIcon type={activity.icon} />
                                <div className="flex-grow">
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                       <span className="font-semibold text-slate-800 dark:text-white">{activity.actorName}</span> {t(activity.messageKey, activity.messagePayload)}
                                    </p>
                                    <p className="text-xs text-slate-400">{activity.timestamp}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">{t('requestsForReview')}</h2>
                     <ul className="space-y-3">
                        {pendingRequests.map(r => (
                            <li key={r.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200">{r.title}</p>
                                    <p className="text-xs text-slate-500">{users.find(u => u.id === r.requesterId)?.name}</p>
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">{t(`status.${r.status}`)}</span>
                            </li>
                        ))}
                         {pendingRequests.length === 0 && <p className="text-center text-sm text-slate-400 py-8">{t('noPendingRequests')}</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
