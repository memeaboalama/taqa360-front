
import React, { useState } from 'react';
import { Task } from '../../../../shared/types';
import { PlusIcon } from '../../../../shared/components/Icons';
import { useLanguage } from '../../../../app/providers/LanguageProvider';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTask: (taskData: Omit<Task, 'id' | 'status' | 'assignments' | 'biddingStatus' | 'subTasks' | 'notes' | 'attachments' | 'activityLog' | 'creationDate' | 'deliverables'>) => Promise<void>;
}

const getTodayStr = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [budget, setBudget] = useState<string>('');
    const [isPublic, setIsPublic] = useState(true);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const todayStr = getTodayStr();

    const handleDeadlineChange = (value: string) => {
        setDeadline(value);
        if (value && value < todayStr) {
            setFormError('لا يمكن اختيار تاريخ قبل اليوم أو تاريخ قديم.');
        } else {
            setFormError('');
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!title || !deadline) {
            setFormError(t('common.fillRequiredFields'));
            return;
        }
        if (deadline < todayStr) {
            setFormError('لا يمكن اختيار تاريخ قبل اليوم أو تاريخ قديم.');
            return;
        }
        setIsSubmitting(true);
        setFormError('');
        try {
            await onAddTask({ title, description, deadline, budget: budget ? Number(budget) : null, isPublic });
            // Reset fields
            setTitle('');
            setDescription('');
            setDeadline('');
            setBudget('');
            setIsPublic(true);
            onClose();
        } catch (err) {
            // Keep modal open on failure; error toast is shown by the caller
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fade-in"
            onClick={handleClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg p-6 lg:p-8 m-4 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('modals.addTaskTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="task-title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('modals.taskTitle')}</label>
                        <input 
                            type="text" 
                            id="task-title" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                            placeholder={t('modals.taskTitlePlaceholder')} required />
                    </div>
                     <div>
                        <label htmlFor="task-description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('modals.description')} ({t('optional')})</label>
                        <textarea 
                            id="task-description" 
                            rows={3}
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                            placeholder={t('modals.descriptionPlaceholder')}></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="task-deadline" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('modals.deadline')}</label>
                            <input 
                                type="date" 
                                id="task-deadline" 
                                value={deadline} 
                                min={todayStr}
                                onChange={e => handleDeadlineChange(e.target.value)} 
                                className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 ${formError ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {formError && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{formError}</p>}
                        </div>
                         <div>
                            <label htmlFor="task-budget" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('modals.taskBudget')} ({t('optional')})</label>
                            <input 
                                type="number" 
                                id="task-budget" 
                                value={budget} 
                                onChange={e => setBudget(e.target.value)} 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600"
                                placeholder={t('modals.taskBudgetPlaceholder')}
                            />
                        </div>
                    </div>
                     <div className="flex items-center">
                        <input id="is-public-checkbox" type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label htmlFor="is-public-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{t('modals.openForBidding')}</label>
                    </div>
                    <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-4">
                        <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting && <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>}
                            {t('modals.addTask')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;