import React, { useState } from 'react';
import { SocialLink } from '../../types';
import { PlusIcon, TrashIcon, LinkIcon, LinkedinIcon, TwitterIcon, GithubIcon, WebsiteIcon } from '../Icons';
import ConfirmationModal from './ConfirmationModal';
import LoadingButton from '../LoadingButton';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface EditSocialLinksModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (links: SocialLink[]) => void | Promise<void>;
    currentLinks: SocialLink[];
}

const EditSocialLinksModal: React.FC<EditSocialLinksModalProps> = ({ isOpen, onClose, onSubmit, currentLinks }) => {
    const { t } = useLanguage();
    const [links, setLinks] = useState<SocialLink[]>(currentLinks);
    const [saving, setSaving] = useState(false);
    const [confirmState, setConfirmState] = useState<{ open: boolean; index?: number }>({ open: false });

    const platformOptions: { value: SocialLink['platform'], label: string, icon: React.ReactNode }[] = [
        { value: 'linkedin', label: 'LinkedIn', icon: <LinkedinIcon className="w-5 h-5 text-[#0A66C2]"/> },
        { value: 'twitter', label: 'Twitter / X', icon: <TwitterIcon className="w-5 h-5 text-[#1DA1F2]"/> },
        { value: 'github', label: 'GitHub', icon: <GithubIcon className="w-5 h-5"/> },
        { value: 'website', label: t('profile.personalWebsite'), icon: <WebsiteIcon className="w-5 h-5"/> },
    ];

    const detectPlatform = (url: string): SocialLink['platform'] => {
        const u = url.toLowerCase();
        if (u.includes('linkedin.com')) return 'linkedin';
        if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
        if (u.includes('github.com')) return 'github';
        return 'website';
    };

    const ensureHttp = (url: string) => {
        if (!url.trim()) return '';
        if (/^https?:\/\//i.test(url)) return url;
        return `https://${url}`;
    };

    if (!isOpen) return null;

    const handleLinkChange = (index: number, field: keyof SocialLink, value: string) => {
        const newLinks = [...links];
        const next = { ...newLinks[index], [field]: value } as any;
        if (field === 'url') {
            next.url = value;
            next.platform = detectPlatform(value);
        }
        newLinks[index] = next;
        setLinks(newLinks);
    };

    const addLink = () => {
        setLinks([...links, { id: `link-${Date.now()}`, platform: 'website', url: '' } as any]);
    };

    const removeLink = (index: number) => {
        setConfirmState({ open: true, index });
    };

    const confirmRemove = () => {
        if (typeof confirmState.index === 'number') {
            setLinks(links.filter((_, i) => i !== confirmState.index));
        }
        setConfirmState({ open: false });
    };

    const cancelRemove = () => setConfirmState({ open: false });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        const cleaned = links
            .map(l => ({ ...l, url: ensureHttp(l.url.trim()), platform: detectPlatform(l.url) }))
            .filter(l => l.url !== '');
        setSaving(true);
        try {
            await Promise.resolve(onSubmit(cleaned as any));
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('profile.editSocialLinks')}</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {links.map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="relative w-1/3">
                                <select value={link.platform} onChange={e => handleLinkChange(index, 'platform', e.target.value)} className="w-full appearance-none bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5 ps-8 pe-3">
                                    {platformOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                <div className="absolute inset-y-0 left-2 rtl:left-auto rtl:right-2 flex items-center pointer-events-none">
                                    {platformOptions.find(p => p.value === link.platform)?.icon}
                                </div>
                            </div>
                            <div className="relative w-2/3">
                                <div className="absolute inset-y-0 left-3 rtl:left-auto rtl:right-3 flex items-center text-slate-400">
                                    <LinkIcon className="w-4 h-4"/>
                                </div>
                                <input type="url" value={link.url} onChange={e => handleLinkChange(index, 'url', e.target.value)} placeholder="https://..." className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm ps-8 pe-3 py-2.5" required pattern="^https?:\/\/.*$"/>
                            </div>
                            <button type="button" onClick={() => removeLink(index)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
                 <button type="button" onClick={addLink} className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-dark bg-brand-primary/20 hover:bg-brand-primary/30 rounded-lg px-3 py-2">
                    <PlusIcon className="w-5 h-5"/> {t('profile.addAnotherLink')}
                </button>
                 <div className="mt-6 flex justify-end items-center gap-3 border-t dark:border-slate-700 pt-4">
                    <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200/70 rounded-lg hover:bg-slate-300/70 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed">{t('cancel')}</button>
                    <LoadingButton type="submit" loading={saving} variant="primary">{t('modals.saveChanges')}</LoadingButton>
                 </div>
            </form>
         </div>

            <ConfirmationModal
                isOpen={confirmState.open}
                onClose={cancelRemove}
                onConfirm={() => { confirmRemove(); }}
                title="حذف الرابط"
                message="يرجى تأكيد حذف هذا الرابط"
                confirmText="حذف"
                icon={<TrashIcon className="w-6 h-6" />}
            />
        </>
    );
};

export default EditSocialLinksModal;
