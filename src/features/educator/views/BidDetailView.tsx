import React from 'react';
import { Bid, Project, Educator, Task, PricedBidTask, BidStatus } from '../../../shared/types';
import { EducatorViewType } from '../../../shared/types';
import { ArrowLeftIcon, ArrowRightIcon, BriefcaseIcon, ClockIcon, DollarSignIcon, FileTextIcon, LinkIcon, PaperclipIcon, StarIcon, CheckCircleIcon, XCircleIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { isBidUpdatable } from '../../../shared/utils';

// FIX: Added interface definition for props.
interface BidDetailViewProps {
    bid: Bid;
    project: Project;
    educator: Educator;
    navigateTo: (view: EducatorViewType, data?: any) => void;
}

const getStatusInfo = (status: BidStatus, t: (key: string) => string) => {
    const statusText = t(`status.${status}`);
    switch (status) {
        case BidStatus.ASSIGNED: return { text: statusText, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: <CheckCircleIcon className="w-4 h-4" /> };
        case BidStatus.APPROVED: return { text: statusText, color: 'bg-yellow-50 text-yellow-800', icon: <CheckCircleIcon className="w-4 h-4" /> };
        case BidStatus.REJECTED: return { text: statusText, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: <XCircleIcon className="w-4 h-4" /> };
        default: return { text: statusText, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: <ClockIcon className="w-4 h-4" /> };
    }
}

export const BidDetailView: React.FC<BidDetailViewProps> = ({ bid, project, educator, navigateTo }) => {
    const { t, language } = useLanguage();
    const BackIcon = language === 'ar' ? ArrowRightIcon : ArrowLeftIcon;
    const totalAmount = bid.bidTasks.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const canEditBid = isBidUpdatable(bid.bidTasks);

    const bidTasksWithDetails = bid.bidTasks.map(bt => {
        const task = project.tasks.find(t => t.id === bt.taskId);
        return { ...bt, task };
    });

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <button onClick={() => navigateTo('proposals')} className="flex items-center text-sm text-brand-primary dark:text-brand-accent hover:underline mb-2"><BackIcon className="w-4 h-4 me-1" /> {t('proposals.backToBids')}</button>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('proposals.bidDetails')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('proposals.bidForProject')}: {project.title}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                        <h2 className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white"><FileTextIcon className="w-5 h-5 me-2"/>{t('proposals.proposal')}</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{bid.proposal}</p>
                        {bid.attachments.length > 0 && (
                             <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-200">{t('proposals.attachments')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {bid.attachments.map(att => (
                                        <a href={att.url} key={att.id} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-700 p-1 px-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">
                                            <PaperclipIcon className="w-4 h-4"/> {att.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                         {bid.links.length > 0 && (
                             <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-200">{t('proposals.links')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {bid.links.map(link => (
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" key={link.id} className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-700 p-1 px-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-brand-primary dark:text-brand-accent">
                                            <LinkIcon className="w-4 h-4"/> {link.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                     <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                        <h2 className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white"><BriefcaseIcon className="w-5 h-5 me-2"/>{t('proposals.taskDetailsAndPricing')}</h2>
                        <div className="space-y-3">
                            {bidTasksWithDetails.map(({task, ...bt}) => {
                                const statusInfo = getStatusInfo(bt.status, t);
                                return (
                                    <div key={bt.taskId} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{task?.title ?? t('taskDetail.noData')}</p>
                                            <span className={`px-2 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                {statusInfo.text}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end mt-2 text-sm">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('proposals.yourPrice')}: <strong className="font-mono text-base text-green-600 dark:text-green-400">{(Number(bt.amount) || 0).toLocaleString()} {t('sarCurrency')}</strong></p>
                                            <p className="text-xs text-slate-500">{t('proposals.adminBudget')}: {task?.budget != null ? task.budget.toLocaleString() + ' ' + t('sarCurrency') : t('proposals.notSet')}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                     <div className="sticky top-24 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                             <h2 className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white"><DollarSignIcon className="w-5 h-5 me-2"/>{t('proposals.bidSummary')}</h2>
                             <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400">{t('proposals.deliveryTime')}</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{bid.deliveryDays} {t('day')}</span>
                                </div>
                                 <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                                     <span className="text-slate-600 dark:text-slate-300 font-semibold">{t('proposals.total')}</span>
                                     <span className="font-bold text-2xl text-green-600 dark:text-green-400">{totalAmount.toLocaleString()} {t('sarCurrency')}</span>
                                 </div>
                             </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                          <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">{t('proposals.projectInfo')}</h2>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 dark:text-slate-400">{t('proposals.projectBudget')}</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{project.budget != null ? project.budget.toLocaleString?.() + ' ' + t('sarCurrency') : t('proposals.notSet')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 dark:text-slate-400">{t('proposals.tasksCount')}</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{project.tasks?.length || 0}</span>
                            </div>
                          </div>
                        </div>

                        {(() => {
                          const availableAdditionalTasks = (project.tasks || []).filter(t => t.biddingStatus === 'OPEN' && !bid.bidTasks.some(bt => bt.taskId === t.id));
                          return (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                              <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">{t('proposals.manage')}</h2>
                              <div className="space-y-3">
                                 {canEditBid ? (
                                 <button
                                   onClick={() => navigateTo('createBid', { projectId: project.id, bidId: bid.id })}
                                   className="w-full p-2.5 text-sm font-bold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                                 >
                                   {t('proposals.updateBid')}
                                 </button>
                                 ) : (
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{t('proposals.bidLocked')}</p>
                                 )}
                                 {canEditBid && availableAdditionalTasks.length > 0 && (
                                  <div className="text-xs text-slate-600 dark:text-slate-300">
                                    توجد مهام متاحة لم تقدّم لها بعد.
                                    <button
                                      onClick={() => navigateTo('createBid', { projectId: project.id, bidId: bid.id })}
                                      className="ms-2 underline text-brand-primary dark:text-brand-accent"
                                    >
                                      {t('proposals.addTaskToBid')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                     </div>
                </div>
            </div>
        </div>
    );
};
