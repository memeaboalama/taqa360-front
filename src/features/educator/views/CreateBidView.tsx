import React, { useMemo, useState, useEffect } from 'react';
import { Project, Task, Attachment, Bid } from '../../../shared/types';
import { EducatorViewType } from '../../../shared/types';
import { ArrowLeftIcon, ArrowRightIcon, BriefcaseIcon, DollarSignIcon, PaperclipIcon, LinkIcon, XCircleIcon, UploadCloudIcon, AlertCircleIcon, PlusIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { isBidUpdatable } from '../../../shared/utils';

interface CreateBidViewProps {
    project: Project;
    existingBid?: Bid;
    onCreateBid: (bidData: Omit<Bid, 'id' | 'educatorId' | 'createdAt'>) => void;
    onUpdateBid?: (bidId: string, bidData: Omit<Bid, 'id' | 'educatorId' | 'createdAt'>) => void;
    navigateTo: (view: EducatorViewType, data?: any) => void;
    isApproved: boolean;
    preselectTaskId?: string;
    isSubmitting?: boolean;
}

const CreateBidView: React.FC<CreateBidViewProps> = ({ project, existingBid, onCreateBid, onUpdateBid, navigateTo, isApproved, preselectTaskId, isSubmitting: externalSubmitting }) => {
    const { t, language } = useLanguage();
    const BackIcon = language === 'ar' ? ArrowRightIcon : ArrowLeftIcon;
    const isEditing = !!existingBid;
    const bidLocked = isEditing && !isBidUpdatable(existingBid!.bidTasks);

    const [selectedTasks, setSelectedTasks] = useState<Map<string, string>>(() => {
        if (isEditing && existingBid) {
            const initialMap = new Map<string, string>();
            existingBid.bidTasks.forEach(bt => {
                initialMap.set(bt.taskId, bt.amount.toString());
            });
            return initialMap;
        }
        return new Map();
    });
    
    const [proposal, setProposal] = useState(existingBid?.proposal || '');
    const [deliveryDays, setDeliveryDays] = useState(existingBid?.deliveryDays?.toString() || '');
    const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(existingBid?.attachments || []);
    const [newAttachments, setNewAttachments] = useState<Attachment[]>([]);
    const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([]);
    const [newAttachmentTitle, setNewAttachmentTitle] = useState('');
    const [existingLinks, setExistingLinks] = useState<{ id?: string; title: string; url: string }[]>(existingBid?.links || []);
    const [newLinks, setNewLinks] = useState<{ title: string; url: string }[]>([]);
    const [deletedLinkIds, setDeletedLinkIds] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [internalSubmitting, setInternalSubmitting] = useState(false);

    const isSubmitting = externalSubmitting ?? internalSubmitting;

    const availableTasks = project.tasks.filter(t => t.biddingStatus === 'OPEN');

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (selectedTasks.size === 0) newErrors.tasks = t('createBid.selectAtLeastOneTask');
        if (!deliveryDays || Number(deliveryDays) <= 0) newErrors.deliveryDays = t('createBid.enterDeliveryDays');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleTaskSelect = (taskId: string, isSelected: boolean) => {
        const newSelected = new Map(selectedTasks);
        const task = availableTasks.find(t => t.id === taskId);
        if (isSelected) {
            newSelected.set(taskId, task?.budget?.toString() ?? '');
        } else {
            newSelected.delete(taskId);
        }
        setSelectedTasks(newSelected);
        if (newSelected.size > 0) setErrors(prev => { const { tasks, ...rest } = prev; return rest; });
    };

    const handlePriceChange = (taskId: string, price: string) => {
        setSelectedTasks(new Map(selectedTasks.set(taskId, price)));
    };

    const totalAmount = useMemo(() => {
        return Array.from(selectedTasks.entries()).reduce((sum, [, price]) => sum + (Number(price) || 0), 0);
    }, [selectedTasks]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (bidLocked) {
            alert(t('proposals.bidLocked'));
            return;
        }
        if (!validate()) return;
        if (!isApproved) {
             alert(t('createBid.accountInactive'));
             return;
        }

        setInternalSubmitting(true);

        const bidTasksToSend = Array.from(selectedTasks.entries()).reduce(
            (arr, [taskId, amountStr]) => {
                const amount = Number(amountStr);
                const existing = isEditing && existingBid ? existingBid.bidTasks.find(bt => bt.taskId === taskId) : undefined;
                if (!existing) {
                    arr.push({ taskId, amount });
                } else if (Number(existing.amount) !== amount) {
                    arr.push({ taskId, amount });
                }
                return arr;
            },
            [] as { taskId: string; amount: number }[]
        );

        const bidData: any = {
            projectId: project.id,
            bidTasks: bidTasksToSend,
            deliveryDays: Number(deliveryDays),
            proposal,
        };

        if (newAttachments.length > 0) {
            bidData.attachments = newAttachments
              .filter(a => a.file)
              .map(a => ({ title: a.title || a.name, file: a.file }));
        }
        if (deletedAttachmentIds.length > 0) {
            bidData.deleted_attachments = deletedAttachmentIds;
        }
        if (newLinks.length > 0) {
            bidData.links = newLinks.map((l) => ({ title: l.title, url: l.url }));
        }
        if (deletedLinkIds.length > 0) {
            bidData.deleted_links = deletedLinkIds;
        }

        try {
            if (isEditing && onUpdateBid && existingBid) {
                await onUpdateBid(existingBid.id, bidData);
            } else {
                await onCreateBid(bidData);
            }
        } catch {
        } finally {
            setInternalSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const att: Attachment = {
                id: `file-${Date.now()}-${Math.random()}`,
                title: newAttachmentTitle || file.name,
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                type: file.type,
                url: '#',
                file,
            };
            setNewAttachments(prev => [...prev, att]);
            setNewAttachmentTitle('');
            e.currentTarget.value = '';
        }
    };
    const updateNewAttachmentTitle = (id: string, title: string) => {
        setNewAttachments(prev => prev.map(att => att.id === id ? { ...att, title } : att));
    };
    const removeAttachment = (id: string) => {
        const existing = existingAttachments.find(att => att.id === id);
        if (existing && existing.id) {
            setDeletedAttachmentIds(prev => [...prev, existing.id]);
            setExistingAttachments(prev => prev.filter(a => a.id !== id));
        } else {
            setNewAttachments(prev => prev.filter(f => f.id !== id));
        }
    };
    
    useEffect(() => {
        if (!preselectTaskId) return;
        if (selectedTasks.has(preselectTaskId)) return;
        const task = availableTasks.find(t => t.id === preselectTaskId);
        if (task) {
            const price = task.budget?.toString() ?? '';
            setSelectedTasks(prev => new Map(prev).set(preselectTaskId, price));
        }
    }, [preselectTaskId]);

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <button onClick={() => isEditing ? navigateTo('proposals') : navigateTo('opportunityDetail', { projectId: project.id })} className="flex items-center text-sm text-brand-primary dark:text-brand-accent hover:underline mb-2">
                    <BackIcon className="w-4 h-4 me-1" /> {isEditing ? t('proposals.backToBids') : t('createBid.backToProjectDetail')}
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{isEditing ? t('createBid.editYourBid') : t('createBid.bidForProject')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{project.title}</p>
            </div>
            {bidLocked ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{t('proposals.bidLocked')}</p>
                    <button
                        type="button"
                        onClick={() => navigateTo('proposals')}
                        className="mt-4 p-2.5 text-sm font-bold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                    >
                        {t('proposals.backToBids')}
                    </button>
                </div>
            ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                         <h2 className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white">
                             <BriefcaseIcon className="w-5 h-5 me-2"/>
                             {t('createBid.taskDetailsAndPricing')} <span className="text-red-500 ms-1">*</span>
                         </h2>
                         <div className="space-y-4">
                            {availableTasks.map(task => {
                                const isSelected = selectedTasks.has(task.id);
                                const price = selectedTasks.get(task.id) ?? '';
                                const isOverBudget = task.budget && price && Number(price) > task.budget;
                                return (
                                    <div key={task.id} className={`p-4 rounded-lg border-2 transition-all ${isSelected ? 'border-brand-primary bg-yellow-50 dark:bg-slate-700' : 'border-slate-200 dark:border-slate-700'}`}>
                                        <div className="flex items-start gap-4">
                                            <input type="checkbox" checked={isSelected} onChange={e => handleTaskSelect(task.id, e.target.checked)} className="mt-1.5 h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-brand-primary focus:ring-brand-primary"/>
                                            <div className="flex-grow">
                                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{task.description}</p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">{t('createBid.yourPrice')} <span className="text-red-500">*</span></label>
                                                    {task.budget && <span className="text-xs text-slate-500 dark:text-slate-400">{t('createBid.adminBudget')}: {task.budget.toLocaleString()} {t('createBid.sarCurrency')}</span>}
                                                </div>
                                                <div className="relative">
                                                     <input type="number" value={price} onChange={e => handlePriceChange(task.id, e.target.value)} className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-slate-900 dark:text-white" placeholder={t('createBid.taskBudgetPlaceholder')} required/>
                                                </div>
                                                {isOverBudget && <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1.5 flex items-center gap-1"><AlertCircleIcon className="w-4 h-4"/>{t('createBid.overBudget')}</p>}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                         </div>
                         {errors.tasks && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircleIcon className="w-4 h-4"/>{errors.tasks}</p>}
                    </div>

                    {/* Proposal & Attachments & Links */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                        <label className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white"><PaperclipIcon className="w-5 h-5 me-2"/>{t('createBid.proposal')} & {t('createBid.attachments')}</label>
                        <textarea value={proposal} onChange={e => setProposal(e.target.value)} rows={6} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-3 text-slate-800 dark:text-slate-200" placeholder={t('createBid.proposal')} required></textarea>
                        
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">{t('createBid.attachFilesOptional')}</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={newAttachmentTitle}
                                  onChange={(e) => setNewAttachmentTitle(e.target.value)}
                                  placeholder={t('createBid.attachmentTitle')}
                                  className="w-1/2 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2 text-slate-800 dark:text-slate-200"
                                />
                                <input
                                  type="file"
                                  onChange={handleFileChange}
                                  className="block w-1/2 text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 dark:file:bg-brand-primary/20 file:text-brand-primary dark:file:text-brand-accent hover:file:bg-brand-primary/20 dark:hover:file:bg-brand-primary/30"
                                />
                            </div>
                            <div className="space-y-2 mt-2">
                                {existingAttachments.map(file => (
                                    <div key={file.id} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 p-2 rounded-lg">
                                        <span className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">{file.title || file.name}</span>
                                        <button type="button" onClick={() => removeAttachment(file.id)} className="shrink-0"><XCircleIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"/></button>
                                    </div>
                                ))}
                                {newAttachments.map(file => (
                                    <div key={file.id} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 p-2 rounded-lg">
                                        <input
                                          type="text"
                                          value={file.title || ''}
                                          onChange={(e) => updateNewAttachmentTitle(file.id, e.target.value)}
                                          placeholder={t('createBid.attachmentTitle')}
                                          className="flex-1 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded-md p-1.5 text-xs text-slate-800 dark:text-slate-200"
                                        />
                                        <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[40%]">{file.name}</span>
                                        <button type="button" onClick={() => removeAttachment(file.id)} className="shrink-0"><XCircleIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">{t('createBid.addLinksOptional')}</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder={t('createBid.linkTitle')} id="link-title" className="w-1/3 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2 text-slate-800 dark:text-slate-200"/>
                                <input type="url" placeholder="https://example.com" id="link-url" className="w-2/3 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2 text-slate-800 dark:text-slate-200"/>
                                <button type="button" onClick={() => {
                                    const title = (document.getElementById('link-title') as HTMLInputElement).value;
                                    const url = (document.getElementById('link-url') as HTMLInputElement).value;
                                    if(title && url) setNewLinks(prev => [...prev, {title, url}]);
                                }} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg"><PlusIcon className="w-5 h-5 text-slate-600 dark:text-slate-300"/></button>
                            </div>
                             <div className="flex flex-wrap gap-2 mt-2">
                                {existingLinks.map((link) => (
                                    <div key={link.id || `${link.title}-${link.url}`} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-xs p-1 px-2 rounded-full">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary dark:text-brand-accent">{link.title}</a>
                                        {link.id && (
                                            <button type="button" onClick={() => { setDeletedLinkIds(prev => [...prev, String(link.id)]); setExistingLinks(prev => prev.filter(l => l !== link)); }}><XCircleIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"/></button>
                                        )}
                                    </div>
                                ))}
                                {newLinks.map((link, i) => (
                                    <div key={`${link.title}-${i}`} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-xs p-1 px-2 rounded-full">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary dark:text-brand-accent">{link.title}</a>
                                        <button type="button" onClick={() => setNewLinks(prev => prev.filter((_, idx) => idx !== i))}><XCircleIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                             <h2 className="font-bold text-lg mb-4 flex items-center text-slate-900 dark:text-white"><DollarSignIcon className="w-5 h-5 me-2"/>{t('createBid.bidSummary')}</h2>
                             <div className="space-y-3">
                                 <div className="flex justify-between items-center text-sm">
                                     <span className="text-slate-500 dark:text-slate-400">{t('createBid.selectedTasksCount')}</span>
                                     <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTasks.size}</span>
                                 </div>
                                 <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                                     <span className="text-slate-600 dark:text-slate-300 font-semibold">{t('createBid.total')}</span>
                                     <span className="font-bold text-2xl text-green-600 dark:text-green-400">{totalAmount.toLocaleString()} {t('createBid.sarCurrency')}</span>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">
                                        {t('createBid.deliveryTime')} <span className="text-red-500">*</span>
                                    </label>
                                    <input type="number" value={deliveryDays} onChange={e => { setDeliveryDays(e.target.value); if (e.target.value && Number(e.target.value) > 0) setErrors(prev => { const { deliveryDays, ...rest } = prev; return rest; }); }} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5 text-slate-800 dark:text-slate-200" placeholder={t('createBid.deliveryTimeExample')} required/>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('createBid.deliveryTimeHint')}</p>
                                    {errors.deliveryDays && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircleIcon className="w-4 h-4"/>{errors.deliveryDays}</p>}
                                 </div>
                             </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || selectedTasks.size === 0 || !isApproved}
                            className="w-full p-3 text-base sm:text-lg font-bold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            title={!isApproved ? t('createBid.accountMustBeApproved') : ''}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {t('createBid.saving')}
                                </>
                            ) : (
                                isEditing ? t('createBid.saveChanges') : t('createBid.submit')
                            )}
                        </button>
                    </div>
                </div>
            </form>
            )}
        </div>
    );
};

export default CreateBidView;
