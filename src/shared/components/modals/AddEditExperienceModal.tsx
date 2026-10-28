import React, { useState } from 'react';
import LoadingButton from '../LoadingButton';
import { WorkExperience, Certification, VerificationStatus } from '../../types';
import { UploadCloudIcon, XCircleIcon } from '../Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface AddEditExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<WorkExperience> | Partial<Certification>, type: 'experience' | 'certification') => void | Promise<void>;
    item?: WorkExperience | Certification | null;
    initialType?: 'experience' | 'certification';
}

const AddEditExperienceModal: React.FC<AddEditExperienceModalProps> = ({ isOpen, onClose, onSubmit, item, initialType = 'experience' }) => {
    const { t } = useLanguage();
    const isEditing = !!item;
    const [activeTab, setActiveTab] = useState<'experience' | 'certification'>(initialType);
    
    const [expData, setExpData] = useState({
        title: (item as WorkExperience)?.title || '',
        organization: (item as WorkExperience)?.organization || '',
        startDate: (item as WorkExperience)?.startDate || '',
        endDate: (item as WorkExperience)?.endDate || '',
        description: (item as WorkExperience)?.description || '',
    });
    const [certData, setCertData] = useState({
        title: (item as Certification)?.title || '',
        issuingAuthority: (item as Certification)?.issuingAuthority || '',
        issueDate: (item as Certification)?.issueDate || '',
        description: (item as Certification)?.description || '',
    });
    
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(item?.documentUrl || null);
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setDocumentFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeFile = () => {
        setDocumentFile(null);
        setPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const finalDocumentUrl = documentFile ? preview! : item?.documentUrl;
            if (activeTab === 'experience') {
                await Promise.resolve(onSubmit({
                    id: item?.id || `new-exp-${Date.now()}`,
                    ...expData,
                    documentUrl: finalDocumentUrl,
                    verificationStatus: VerificationStatus.PENDING
                }, 'experience'));
            } else {
                await Promise.resolve(onSubmit({
                    id: item?.id || `new-cert-${Date.now()}`,
                    ...certData,
                    documentUrl: finalDocumentUrl,
                    verificationStatus: VerificationStatus.PENDING
                }, 'certification'));
            }
            onClose();
        } finally {
            setSaving(false);
        }
    };
    
    const handleExpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setExpData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
     const handleCertChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCertData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const TabButton: React.FC<{ type: 'experience' | 'certification', label: string }> = ({ type, label }) => (
        <button type="button" disabled={isEditing} onClick={() => setActiveTab(type)} className={`w-1/2 p-3 text-sm font-bold rounded-t-lg ${activeTab === type ? 'bg-white dark:bg-slate-800 border-b-2 text-black' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`} style={activeTab === type ? { borderBottomColor: 'var(--primary-color)', color: 'var(--primary-color)' } : {}}>
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-2xl animate-fade-in-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0">
                     <div className="flex">
                        <TabButton type="experience" label={t('profile.workExperience')} />
                        <TabButton type="certification" label={t('profile.certificateCourse')} />
                    </div>
                </div>
                <div className="flex-grow p-6 bg-white dark:bg-slate-800 rounded-b-2xl overflow-y-auto">
                    {activeTab === 'experience' ? (
                        <div className="space-y-4">
                            <input name="title" value={expData.title} onChange={handleExpChange} placeholder={t('profile.jobTitle')} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
                            <input name="organization" value={expData.organization} onChange={handleExpChange} placeholder={t('profile.company')} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="startDate" type="date" value={expData.startDate} onChange={handleExpChange} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
                                <input name="endDate" type="date" value={expData.endDate} onChange={handleExpChange} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
                            </div>
                            <textarea name="description" value={expData.description} onChange={handleExpChange} placeholder={`${t('modals.description')} (${t('optional')})`} rows={3} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5"/>
                        </div>
                    ) : (
                         <div className="space-y-4">
                            <input name="title" value={certData.title} onChange={handleCertChange} placeholder={t('profile.certificateName')} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
                            <input name="issuingAuthority" value={certData.issuingAuthority} onChange={handleCertChange} placeholder={t('profile.issuingAuthority')} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
                            <input name="issueDate" type="date" value={certData.issueDate} onChange={handleCertChange} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
                            <textarea name="description" value={certData.description} onChange={handleCertChange} placeholder={`${t('modals.description')} (${t('optional')})`} rows={3} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5"/>
                        </div>
                    )}
                     <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.attachProof')} ({t('optional')})</label>
                        {preview ? (
                            <div className="relative group">
                                <img src={preview} alt="معاينة" className="w-full h-48 object-contain rounded-lg bg-slate-100 dark:bg-slate-700 p-2"/>
                                <button type="button" onClick={removeFile} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><XCircleIcon className="w-5 h-5"/></button>
                            </div>
                        ) : (
                            <label htmlFor="exp-doc-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"><UploadCloudIcon className="w-8 h-8 text-slate-500" /><p className="text-sm text-slate-500">{t('profile.clickToUpload')}</p><input id="exp-doc-upload" type="file" className="hidden" onChange={handleFileChange}/></label>
                        )}
                    </div>
                </div>
                 <div className="flex-shrink-0 mt-6 flex justify-end items-center gap-3 p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700 rounded-b-2xl">
                    <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200/70 rounded-lg hover:bg-slate-300/70 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed">{t('cancel')}</button>
                    <LoadingButton type="submit" loading={saving} variant="primary">{t('save')}</LoadingButton>
                 </div>
            </form>
        </div>
    );
};

export default AddEditExperienceModal;
