import React, { useState } from 'react';
import LoadingButton from '../LoadingButton';
import { AcademicMajor, VerificationStatus } from '../../types';
import { UploadCloudIcon, DocumentTextIcon, XCircleIcon } from '../Icons';
import SelectWithCreate from '../../../features/educator/components/shared/SelectWithCreate';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface AddEditAcademicMajorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AcademicMajor) => void | Promise<void>;
    major?: AcademicMajor | null;
    predefinedMajors: string[];
}

const AddEditAcademicMajorModal: React.FC<AddEditAcademicMajorModalProps> = ({ isOpen, onClose, onSubmit, major, predefinedMajors }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Omit<AcademicMajor, 'id' | 'verificationStatus' | 'rejectionReason'>>({
        degree: major?.degree || '',
        majorName: major?.majorName || '',
        institution: major?.institution || '',
        graduationYear: major?.graduationYear || '',
        documentUrl: major?.documentUrl || '',
        isCustom: major?.isCustom || false,
    });
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(major?.documentUrl || null);
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMajorChange = (selectedOptions: { value: string; label: string }[]) => {
        const selected = selectedOptions[0]; // Assuming single selection for this field
        if (selected) {
            setFormData(prev => ({ ...prev, majorName: selected.label, isCustom: !predefinedMajors.includes(selected.label) }));
        }
    };

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
        setFormData(prev => ({ ...prev, documentUrl: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const finalDocumentUrl = documentFile ? preview! : formData.documentUrl;
            await Promise.resolve(onSubmit({
                id: major?.id || `new-${Date.now()}`,
                ...formData,
                documentUrl: finalDocumentUrl,
                verificationStatus: VerificationStatus.PENDING,
            }));
            onClose();
        } finally {
            setSaving(false);
        }
    };
    
    const majorOptions = predefinedMajors.map(m => ({ value: m, label: m }));
    const currentMajorValue = formData.majorName ? [{ value: formData.majorName, label: formData.majorName }] : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-2xl p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{major ? t('profile.editQualification') : t('profile.addQualification')}</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <SelectWithCreate
                            label={t('profile.discipline')}
                            options={majorOptions}
                            value={currentMajorValue}
                            onChange={handleMajorChange}
                            onCreate={(label) => handleMajorChange([{ value: label, label }])}
                            placeholder={t('profile.selectOrAddDiscipline')}
                        />
                        <select name="degree" value={formData.degree} onChange={handleChange} className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required>
                            <option value="">{t('profile.degreePlaceholder')}</option>
                            {/* <option value="highschool">ثانوية عامة</option> */}
                            <option value="diploma">دبلوم</option>
                            <option value="bachelor">بكالوريوس</option>
                            <option value="master">ماجستير</option>
                            <option value="phd">دكتوراه</option>
                        </select>
                        <input name="institution" value={formData.institution} onChange={handleChange} placeholder={t('profile.institutionPlaceholder')} className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
                        <input name="graduationYear" value={formData.graduationYear} onChange={handleChange} placeholder={t('profile.graduationYear')} type="number" className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.attachCertificate')} ({t('optional')})</label>
                        {preview ? (
                             <div className="relative group">
                                <img src={preview} alt={t('profile.certificatePreview')} className="w-full h-48 object-contain rounded-lg bg-slate-100 dark:bg-slate-700 p-2"/>
                                <button type="button" onClick={removeFile} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XCircleIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="doc-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-700/50 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-slate-500">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloudIcon className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">{t('profile.clickToUpload')}</span></p>
                                    </div>
                                    <input id="doc-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf"/>
                                </label>
                            </div> 
                        )}
                    </div>
                </div>
                 <div className="mt-6 flex justify-end items-center gap-3">
                    <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200/70 rounded-lg hover:bg-slate-300/70 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed">{t('cancel')}</button>
                    <LoadingButton type="submit" loading={saving} variant="primary">{t('profile.saveQualification')}</LoadingButton>
                 </div>
            </form>
        </div>
    );
};

export default AddEditAcademicMajorModal;
