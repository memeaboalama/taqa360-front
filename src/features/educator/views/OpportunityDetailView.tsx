import React from 'react';
import { Project, Task } from '../../../shared/types';
import { EducatorViewType } from '../../../shared/types';
import { ArrowLeftIcon, ArrowRightIcon, BriefcaseIcon, FileTextIcon, BidsIcon, PaperclipIcon, DollarSignIcon, ClockIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface OpportunityDetailViewProps {
    project: Project;
    navigateTo: (view: EducatorViewType, data?: any) => void;
    isApproved: boolean;
}

const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === '-0001-11-30' || dateStr === '0000-00-00') return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-CA');
};

const pluralizeDays = (count: number, t: (key: string, vars?: any) => string, lang: string): string => {
    if (lang === 'ar') {
        if (count >= 3 && count <= 10) return t('days.pluralFew');
        if (count >= 11) return t('days.pluralMany');
        return t('days.singular');
    }
    return count === 1 ? t('days.singular') : t('days.pluralMany');
};

const formatBudget = (value: any, t: (key: string, vars?: any) => string) => {
    if (value == null || value === '') return t('projectsView.notSet');
    const num = typeof value === 'number' ? value : (Number(value) || 0);
    return `${num.toLocaleString()} ${t('sarCurrency')}`;
};

const TaskCard: React.FC<{ task: Task, onNavigate: () => void }> = ({ task, onNavigate }) => {
    const { t } = useLanguage();
    return (
        <button onClick={onNavigate} className="w-full text-right p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 transition-all">
            <div className="flex justify-between items-start gap-3">
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{task.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {task.biddingStatus === 'OPEN' ? (
                      <span className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md">
                          {t('opportunityDetail.availableForBids')}
                      </span>
                  ) : (
                      <span className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300 rounded-md">
                          {t('opportunityDetail.closed')}
                      </span>
                  )}
                  {task.hasEducatorBidForTask && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      <BidsIcon className="w-3 h-3"/> {t('opportunityDetail.youHavePreviousBid')}{task.bidDetailForTask?.status_label ? ` • ${task.bidDetailForTask.status_label}` : ''}
                    </span>
                  )}
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400"><DollarSignIcon className="w-4 h-4" />{t('opportunityDetail.budget')}:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{formatBudget(task.budget, t)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><ClockIcon className="w-4 h-4" />{t('opportunityDetail.deadline')}:</span>
                    <span className="text-slate-700 dark:text-slate-300">{formatDate(task.deadline)}</span>
                </div>
                {(task.attachments && task.attachments.length > 0) && (
                    <div className="pt-2">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('opportunityDetail.attachments')}:</p>
                        {(task.attachments || []).map(att => (
                            <div key={att.id} className="flex items-center gap-1 text-xs text-brand-primary dark:text-brand-accent">
                                <PaperclipIcon className="w-3 h-3"/> {(att as any).name || (att as any).title || (att as any).original_name}
                            </div>
                        ))}
                    </div>
                )}
                {Array.isArray((task as any).externalSubTasks) && (task as any).externalSubTasks.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('opportunityDetail.subTasks')}:</p>
                    <ul className="space-y-1">
                      {(task as any).externalSubTasks.map((st: any) => (
                        <li key={st.id} className="text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-medium">• {st.title}</span>
                          {Array.isArray(st.attachments) && st.attachments.length > 0 && (
                            <div className="mt-1 ps-3">
                              {st.attachments.map((att: any) => (
                                <div key={att.id} className="flex items-center gap-1 text-xs text-brand-primary dark:text-brand-accent">
                                  <PaperclipIcon className="w-3 h-3"/> {att.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
        </button>
    );
};

const OpportunityDetailView: React.FC<OpportunityDetailViewProps> = ({ project, navigateTo, isApproved }) => {
    const { t, language } = useLanguage();
    const BackIcon = language === 'ar' ? ArrowRightIcon : ArrowLeftIcon;
    const openTasks = (project.tasks || []).filter(tk => tk.isPublic && tk.biddingStatus === 'OPEN');
    const hasProjectBid = !!(project as any).hasEducatorBidForOpportunity;
    const existingBidId = (project as any).bid?.id as string | undefined;

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                 <button onClick={() => navigateTo('opportunities')} className="flex items-center text-sm text-brand-primary dark:text-brand-accent hover:underline mb-2">
                     <BackIcon className="w-4 h-4 me-1" /> {t('opportunityDetail.backToOpportunities')}
                 </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                    {(project.tags || []).map(tag => (
                        <span key={tag} className="text-xs font-medium px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{tag}</span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <main className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                        <h2 className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white">
                            <FileTextIcon className="w-5 h-5 me-2"/> {t('opportunityDetail.projectDescription')}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{project.description}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                        <h2 className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white">
                            <BriefcaseIcon className="w-5 h-5 me-2"/> {t('opportunityDetail.availableTasks')} ({openTasks.length})
                        </h2>
                        <div className="space-y-4">
                            {openTasks.map(task => (
                                <TaskCard key={task.id} task={task} onNavigate={() => navigateTo('opportunityTaskDetail', { projectId: project.id, taskId: task.id })} />
                            ))}
                            {openTasks.length === 0 && <p className="text-sm text-center text-slate-400 py-6">{t('opportunityDetail.noAvailableTasks')}</p>}
                        </div>
                    </div>
                    {hasProjectBid && (project as any).bid && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                        <h2 className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white">
                            <BidsIcon className="w-5 h-5 me-2"/> {t('opportunityDetail.youHavePreviousBid')}
                        </h2>
                        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">{t('proposals.total')}</span><span className="font-semibold">{formatBudget((project as any).bid.totalAmount, t)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">{t('proposals.deliveryTime')}</span><span className="font-semibold">{(project as any).bid.deliveryDays} {pluralizeDays(Number((project as any).bid.deliveryDays), t, language)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">{t('proposals.submissionDate')}</span><span className="font-semibold">{formatDate((project as any).bid.createdAt)}</span></div>
                          {(project as any).bid.proposal && (
                            <div className="pt-2">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('proposals.proposal')}</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{(project as any).bid.proposal}</p>
                            </div>
                          )}
                          {Array.isArray((project as any).bid.bidTasks) && (project as any).bid.bidTasks.length > 0 && (
                            <div className="pt-2">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('proposals.taskDetailsAndPricing')}</p>
                              <ul className="space-y-1">
                                {(project as any).bid.bidTasks.map((bt: any) => {
                                  const tk = (project.tasks || []).find(t => t.id === bt.taskId);
                                  return (
                                    <li key={bt.taskId} className="flex items-center justify-between">
                                      <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        {tk?.title || bt.taskId}
                                        {bt.status && (
                                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">{t(`status.${String(bt.status).toLowerCase()}`)}</span>
                                        )}
                                      </span>
                                      <span className="font-semibold">{Number(bt.amount || 0).toLocaleString()} {t('sarCurrency')}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                          {Array.isArray((project as any).bid.attachments) && (project as any).bid.attachments.length > 0 && (
                            <div className="pt-2">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('proposals.attachments')}</p>
                              {(project as any).bid.attachments.map((a: any) => (
                                a.url ? (
                                  <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-primary dark:text-brand-accent hover:underline"><PaperclipIcon className="w-3 h-3"/> {a.name}</a>
                                ) : (
                                  <div key={a.id} className="flex items-center gap-1 text-xs text-brand-primary dark:text-brand-accent"><PaperclipIcon className="w-3 h-3"/> {a.name}</div>
                                )
                              ))}
                            </div>
                          )}
                          {Array.isArray((project as any).bid.links) && (project as any).bid.links.length > 0 && (
                            <div className="pt-2">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('proposals.links')}</p>
                              <div className="flex flex-wrap gap-2">
                                {(project as any).bid.links.map((l: any) => (
                                  <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary dark:text-brand-accent underline">{l.title}</a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                 </main>
                 <aside className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                             <h2 className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white"><DollarSignIcon className="w-5 h-5 me-2"/>{t('opportunityDetail.projectSummary')}</h2>
                             <div className="space-y-3 text-sm">
                                 <div className="flex justify-between items-center">
                                     <span className="text-slate-500 dark:text-slate-400">{t('opportunityDetail.totalBudget')}</span>
                                     <span className="font-bold text-lg sm:text-xl text-green-600 dark:text-green-400">{formatBudget(project.budget, t)}</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                      <span className="text-slate-500 dark:text-slate-400">{t('opportunityDetail.totalTasks')}</span>
                                     <span className="font-semibold text-slate-800 dark:text-slate-200">{openTasks.length}</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                      <span className="text-slate-500 dark:text-slate-400">{t('opportunityDetail.creationDate')}</span>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(project.createdAt)}</span>
                                 </div>
                             </div>
                        </div>
                        <button
                            onClick={() => {
                                if (isApproved) {
                                  if (hasProjectBid && existingBidId) {
                                    navigateTo('createBid', { projectId: project.id, bidId: existingBidId });
                                  } else {
                                    navigateTo('createBid', { projectId: project.id });
                                  }
                                }
                            }}
                            disabled={openTasks.length === 0 || !isApproved}
                            className="w-full p-3 text-base sm:text-lg font-bold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            title={!isApproved ? t('opportunityDetail.accountInactive') : ''}
                        >
                            <BidsIcon className="w-6 h-6"/>
                            {isApproved ? (hasProjectBid ? t('opportunityDetail.updateBid') : t('opportunityDetail.submitBid')) : t('opportunityDetail.accountInactive')}
                        </button>
                    </div>
                 </aside>
            </div>
        </div>
    );
};

export default OpportunityDetailView;
