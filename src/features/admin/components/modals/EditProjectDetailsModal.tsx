import React, { useState } from 'react';
import { Project } from '../../../../shared/types';
import { useLanguage } from '../../../../app/providers/LanguageProvider';

interface EditProjectDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    isSaving?: boolean;
    onSave: (details: Partial<Project> & { newAttachments?: File[]; removedAttachmentIds?: string[] }) => Promise<void> | void;
}

const EditProjectDetailsModal: React.FC<EditProjectDetailsModalProps> = ({ isOpen, onClose, project, onSave, isSaving }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description);
    const [budget, setBudget] = useState(project.budget ? String(project.budget) : '');
    const [deadline, setDeadline] = useState(project.deadline || '');


    if (!isOpen) return null;




    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            title,
            description,
            budget: budget ? Number(budget) : null,
            deadline: deadline || null,
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fade-in"
            onClick={isSaving ? undefined : onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-2xl p-6 lg:p-8 m-4 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">تعديل بيانات المشروع</h2>
                 <p className="text-gray-500 dark:text-gray-400 mb-6">قم بتحديث بيانات المشروع</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="project-title-edit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">العنوان</label>
                        <input type="text" id="project-title-edit" value={title} onChange={e => setTitle(e.target.value)} disabled={isSaving} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"/>
                    </div>
                     <div>
                        <label htmlFor="project-desc-edit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">الوصف</label>
                        <textarea id="project-desc-edit" rows={4} value={description} onChange={e => setDescription(e.target.value)} disabled={isSaving} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="project-budget" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">الميزانية</label>
                            <input 
                                type="number" 
                                id="project-budget" 
                                value={budget} 
                                onChange={e => setBudget(e.target.value)} 
                                disabled={isSaving}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                                placeholder="ميزانية المشروع"
                            />
                        </div>
                         <div>
                            <label htmlFor="project-deadline" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">الموعد النهائي</label>
                            <input 
                                type="date" 
                                id="project-deadline" 
                                value={deadline} 
                                onChange={e => setDeadline(e.target.value)} 
                                disabled={isSaving}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>



                    <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            إلغاء
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
                            {isSaving && (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            حفظ التغييرات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProjectDetailsModal;
