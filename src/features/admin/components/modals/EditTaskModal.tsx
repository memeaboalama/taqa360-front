
import React, { useState } from 'react';
import { Task } from '../../../../shared/types';
import { useLanguage } from '../../../../app/providers/LanguageProvider';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onSave: (taskData: Partial<Task>) => Promise<void>;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, onSave }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [deadline, setDeadline] = useState(task.deadline);
    const [budget, setBudget] = useState<string>(task.budget ? String(task.budget) : '');
    const [isPublic, setIsPublic] = useState(task.isPublic);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                title,
                description,
                deadline,
                budget: budget ? Number(budget) : null,
                isPublic,
            });
            onClose();
        } catch {
            // error handled by parent (toast)
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (!isSaving) onClose();
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('modals.editTaskTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="task-title-edit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('modals.taskTitle')}</label>
                        <input 
                            type="text" 
                            id="task-title-edit" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            disabled={isSaving}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-50" 
                            required 
                        />
                    </div>
                     <div>
                        <label htmlFor="task-description-edit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('modals.description')} ({t('optional')})</label>
                        <textarea 
                            id="task-description-edit" 
                            rows={3}
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            disabled={isSaving}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-50" 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="task-deadline-edit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('modals.deadline')}</label>
                            <input 
                                type="date" 
                                id="task-deadline-edit" 
                                value={deadline} 
                                onChange={e => setDeadline(e.target.value)} 
                                disabled={isSaving}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 disabled:opacity-50"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="task-budget-edit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('modals.taskBudget')} ({t('optional')})</label>
                            <input 
                                type="number" 
                                id="task-budget-edit" 
                                value={budget} 
                                onChange={e => setBudget(e.target.value)} 
                                disabled={isSaving}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 disabled:opacity-50"
                            />
                        </div>
                    </div>
                     <div className="flex items-center">
                        <input id="is-public-checkbox-edit" type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} disabled={isSaving} className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50" />
                        <label htmlFor="is-public-checkbox-edit" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{t('modals.openForBidding')}</label>
                    </div>
                    <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-4">
                        <button type="button" onClick={handleClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 inline-flex items-center gap-2">
                            {isSaving && (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {t('modals.editTask')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTaskModal;