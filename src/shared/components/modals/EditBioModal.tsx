import React, { useState } from 'react';
import LoadingButton from '../LoadingButton';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface EditBioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (bio: string) => void | Promise<void>;
    currentBio: string;
}

const EditBioModal: React.FC<EditBioModalProps> = ({ isOpen, onClose, onSubmit, currentBio }) => {
    const { t } = useLanguage();
    const [bio, setBio] = useState(currentBio);
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            await Promise.resolve(onSubmit(bio));
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <form 
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-lg p-6 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('profile.editBio')}</h2>
                
                <textarea 
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-3 text-slate-800 dark:text-slate-200"
                    placeholder={t('profile.bioPlaceholder')}
                ></textarea>
                
                 <div className="mt-6 flex justify-end items-center gap-3">
                    <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200/70 rounded-lg hover:bg-slate-300/70 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed">
                        {t('cancel')}
                    </button>
                    <LoadingButton type="submit" loading={saving} variant="primary" disabled={saving}>
                        {t('modals.saveChanges')}
                    </LoadingButton>
                 </div>
            </form>
        </div>
    );
};

export default EditBioModal;
