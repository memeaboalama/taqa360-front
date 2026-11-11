import React, { useState } from 'react';
import { Bid, Project, Educator, Task, PricedBidTask, BidStatus } from '../../../shared/types';
import { EducatorViewType } from '../../../shared/types';
import { ArrowLeftIcon, ArrowRightIcon, BriefcaseIcon, ClockIcon, DollarSignIcon, FileTextIcon, LinkIcon, PaperclipIcon, StarIcon, CheckCircleIcon, XCircleIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { isBidUpdatable } from '../../../shared/utils';
import { useRequestBidModification } from '../../../core/hooks/useEducatorQueries';

// FIX: Added interface definition for props.
interface BidDetailViewProps {
    bid: Bid;
    project: Project;
    educator: Educator;
    navigateTo: (view: EducatorViewType, data?: any) => void;
    addToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
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

export const BidDetailView: React.FC<BidDetailViewProps> = ({ bid, project, educator, navigateTo, addToast }) => {
    const { t, language } = useLanguage();
    const requestModification = useRequestBidModification();
    const [isModificationModalOpen, setModificationModalOpen] = useState(false);
    const [requestedProposal, setRequestedProposal] = useState(bid.proposal);
    const [requestedDeliveryDays, setRequestedDeliveryDays] = useState(String(bid.deliveryDays));
    const [requestedAmounts, setRequestedAmounts] = useState<Record<string, string>>({});
    const [modificationError, setModificationError] = useState('');
    const BackIcon = language === 'ar' ? ArrowRightIcon : ArrowLeftIcon;
    const totalAmount = bid.bidTasks.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const canEditBid = isBidUpdatable(bid.bidTasks);
    const statuses = bid.bidTasks.map((task) => String(task.status).toUpperCase());
    const canRequestModification = statuses.includes(BidStatus.APPROVED)
        && statuses.every((status) => status === BidStatus.PENDING || status === BidStatus.APPROVED);
    const hasPendingModification = bid.modificationRequests?.some((request) => request.status === 'PENDING') ?? false;

    const openModificationRequest = () => {
        setRequestedProposal(bid.proposal);
        setRequestedDeliveryDays(String(bid.deliveryDays));
        setRequestedAmounts(Object.fromEntries(bid.bidTasks.map((task) => [task.taskId, String(task.amount)])));
        setModificationError('');
        setModificationModalOpen(true);
    };

    const submitModificationRequest = async (event: React.FormEvent) => {
        event.preventDefault();
        setModificationError('');
        try {
            await requestModification.mutateAsync({
                id: bid.id,
                data: {
                    proposal: requestedProposal,
                    delivery_days: Number(requestedDeliveryDays),
                    bid_tasks: bid.bidTasks.map((task) => ({
                        task_id: task.taskId,
                        amount: Number(requestedAmounts[task.taskId]),
                    })),
                },
            });
            setModificationModalOpen(false);
            addToast?.('تم إرسال طلب تعديل الاتفاق إلى الإدارة.', 'success');
        } catch (error: any) {
            const message = error?.message || 'تعذر إرسال طلب تعديل الاتفاق.';
            setModificationError(message);
            addToast?.(message, 'error');
        }
    };

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
                                 {canRequestModification && (
                                    <button
                                      type="button"
                                      onClick={openModificationRequest}
                                      disabled={hasPendingModification}
                                      className="w-full p-2.5 text-sm font-bold border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary/10 disabled:opacity-50"
                                    >
                                      {hasPendingModification ? 'طلب تعديل قيد المراجعة' : 'طلب تعديل الاتفاق'}
                                    </button>
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

            {(bid.modificationRequests?.length ?? 0) > 0 && (
                <section className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6">
                    <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">سجل طلبات تعديل الاتفاق</h2>
                    <div className="space-y-3">
                        {bid.modificationRequests!.map((request) => (
                            <div key={request.id} className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-sm">
                                <p className="font-bold">
                                    {request.status === 'PENDING' ? 'قيد مراجعة الإدارة' : request.status === 'APPROVED' ? 'معتمد' : 'مرفوض'}
                                    <span className="ms-2 text-xs font-normal text-slate-500">{request.createdAt ? new Date(request.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en') : ''}</span>
                                </p>
                                <p className="mt-2"><span className="font-semibold">الشروط قبل التعديل:</span> {request.previousValues.proposal}</p>
                                <p><span className="font-semibold">الشروط المطلوبة:</span> {request.requestedValues.proposal}</p>
                                <p><span className="font-semibold">مدة التنفيذ:</span> {request.previousValues.deliveryDays} ← {request.requestedValues.deliveryDays} يوم</p>
                                <ul className="list-disc ps-5">
                                    {request.requestedValues.tasks.map((requestedTask) => {
                                        const previousTask = request.previousValues.tasks.find((task) => task.task_id === requestedTask.task_id);
                                        const task = project.tasks.find((candidate) => candidate.id === requestedTask.task_id);
                                        return <li key={requestedTask.task_id}>{task?.title || requestedTask.task_id}: {Number(previousTask?.amount ?? 0).toLocaleString()} ← {Number(requestedTask.amount).toLocaleString()} {t('sarCurrency')}</li>;
                                    })}
                                </ul>
                                {request.decidedAt && <p className="text-xs text-slate-500">تاريخ القرار: {new Date(request.decidedAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en')}</p>}
                                {request.decisionNote && <p className="mt-1 text-slate-600 dark:text-slate-300">ملاحظة الإدارة: {request.decisionNote}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {isModificationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <form onSubmit={submitModificationRequest} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 p-5 space-y-4">
                        <div>
                            <h2 className="text-xl font-bold">طلب تعديل الاتفاق</h2>
                            <p className="mt-1 text-sm text-slate-500">لن تتغير الأسعار أو الشروط الحالية إلا بعد اعتماد الإدارة. لا يمكن تغيير نطاق المهام بعد الاتفاق.</p>
                        </div>
                        <label className="block text-sm font-semibold">
                            شروط العرض
                            <textarea value={requestedProposal} onChange={(event) => setRequestedProposal(event.target.value)} rows={4} required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 font-normal" />
                        </label>
                        <label className="block text-sm font-semibold">
                            مدة التنفيذ بالأيام
                            <input type="number" min={1} value={requestedDeliveryDays} onChange={(event) => setRequestedDeliveryDays(event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 font-normal" />
                        </label>
                        <div className="space-y-2">
                            {bid.bidTasks.map((taskBid) => {
                                const task = project.tasks.find((candidate) => candidate.id === taskBid.taskId);
                                return (
                                    <label key={taskBid.taskId} className="block text-sm font-semibold">
                                        السعر — {task?.title || taskBid.taskId}
                                        <input type="number" min={0} step="0.01" value={requestedAmounts[taskBid.taskId] ?? taskBid.amount} onChange={(event) => setRequestedAmounts((current) => ({ ...current, [taskBid.taskId]: event.target.value }))} required className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 font-normal" />
                                    </label>
                                );
                            })}
                        </div>
                        {modificationError && <p className="text-sm text-red-600">{modificationError}</p>}
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setModificationModalOpen(false)} className="rounded-lg bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm">إلغاء</button>
                            <button type="submit" disabled={requestModification.isPending} className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                                {requestModification.isPending ? 'جارٍ الإرسال...' : 'إرسال للإدارة'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
