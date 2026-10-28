import React from 'react';
import { Project, Task } from '../../../shared/types';
import { EducatorViewType } from '../../../shared/types';
import { ArrowLeftIcon, ArrowRightIcon, BriefcaseIcon, FileTextIcon, PaperclipIcon, DollarSignIcon, ClockIcon, BidsIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface OpportunityTaskDetailViewProps {
    project: Project;
    task: Task;
    navigateTo: (view: EducatorViewType, data?: any) => void;
    isApproved: boolean;
}

const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === '-0001-11-30' || dateStr === '0000-00-00') return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-CA');
};

const InfoCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white">{icon} {title}</h2>
        {children}
    </div>
);


const OpportunityTaskDetailView: React.FC<OpportunityTaskDetailViewProps> = ({ project, task, navigateTo, isApproved }) => {
    const { t, language } = useLanguage();
    const BackIcon = language === 'ar' ? ArrowRightIcon : ArrowLeftIcon;

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                 <button onClick={() => navigateTo('opportunityDetail', { projectId: project.id })} className="flex items-center text-sm text-brand-primary dark:text-brand-accent hover:underline mb-2">
                    <BackIcon className="w-4 h-4 me-1" /> {t('opportunityDetail.backToOpportunities')}
                </button>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{task.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('opportunityDetail.partOfProject')}: {project.title}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <main className="lg:col-span-2 space-y-6">
                    <InfoCard title={t('opportunityDetail.taskDescription')} icon={<FileTextIcon className="w-5 h-5 me-2"/>}>
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{task.description}</p>
                    </InfoCard>
                    <InfoCard title={t('opportunityDetail.adminAttachments')} icon={<PaperclipIcon className="w-5 h-5 me-2"/>}>
                        {task.attachments.length > 0 ? (
                            <ul className="space-y-2">
                               {task.attachments.map(att => (
                                   <li key={att.id}>
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-primary dark:text-brand-accent hover:underline p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <PaperclipIcon className="w-4 h-4" /> 
                                            {att.name} ({att.size})
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-center text-slate-400 py-6">{t('opportunityDetail.noAttachments')}</p>}
                    </InfoCard>
                 </main>
                 <aside className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <InfoCard title={t('opportunityDetail.basicInfo')} icon={<BriefcaseIcon className="w-5 h-5 me-2"/>}>
                             <div className="space-y-3 text-sm">
                                 <div className="flex justify-between items-center">
                                     <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><DollarSignIcon className="w-4 h-4"/> {t('opportunityDetail.budget')}</span>
                                     <span className="font-bold text-lg text-green-600 dark:text-green-400">{task.budget ? `${task.budget.toLocaleString()} ${t('sarCurrency')}` : t('projectsView.notSet')}</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                     <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2"><ClockIcon className="w-4 h-4"/> {t('opportunityDetail.deadline')}</span>
                                     <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(task.deadline)}</span>
                                 </div>
                             </div>
                        </InfoCard>
                        <button
                           onClick={() => {
                                if (isApproved) {
                                    const hasProjectBid = !!(project as any).hasEducatorBidForOpportunity;
                                    const existingBidId = (project as any).bid?.id as string | undefined;
                                    if (hasProjectBid && existingBidId) {
                                        navigateTo('createBid', { projectId: project.id, bidId: existingBidId, taskId: task.id });
                                    } else {
                                        navigateTo('createBid', { projectId: project.id, taskId: task.id });
                                    }
                                } else {
                                    alert(t('opportunityDetail.accountInactiveHint'))
                                }
                            }}
                            disabled={task.biddingStatus !== 'OPEN' || !isApproved}
                            className="w-full p-3 text-lg font-bold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            title={!isApproved ? t('opportunityDetail.accountInactiveHint') : ''}
                        >
                            <BidsIcon className="w-6 h-6"/>
                            {(project as any).hasEducatorBidForOpportunity ? t('opportunityDetail.addTaskToBid') : t('opportunityDetail.submitBid')}
                        </button>
                    </div>
                 </aside>
            </div>
        </div>
    );
};

export default OpportunityTaskDetailView;
