import React, { useState, useMemo } from 'react';
import { Skill, Language, SkillLevel, LanguageLevel } from '../../types';
import SelectWithCreate from '../../../features/educator/components/shared/SelectWithCreate';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import LoadingButton from '../LoadingButton';

interface AddEditSkillLanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Skill> | Partial<Language>, type: 'skill' | 'language') => void | Promise<void>;
    predefinedSkills: string[];
    initialType?: 'skill' | 'language';
    initialSkill?: Skill | null;
    initialLanguage?: Language | null;
}

const AddEditSkillLanguageModal: React.FC<AddEditSkillLanguageModalProps> = ({ isOpen, onClose, onSubmit, predefinedSkills, initialType, initialSkill, initialLanguage }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'skill' | 'language'>(initialType || 'skill');
    const [name, setName] = useState(initialSkill?.name || initialLanguage?.name || '');
    const [level, setLevel] = useState((initialSkill?.level as string) || (initialLanguage?.level as string) || 'INTERMEDIATE');
    const [isCustom, setIsCustom] = useState(Boolean((initialSkill as any)?.isCustom));
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const skillLevels: SkillLevel[] = [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.EXPERT];
    const languageLevels: LanguageLevel[] = [LanguageLevel.BASIC, LanguageLevel.INTERMEDIATE, LanguageLevel.ADVANCED, LanguageLevel.NATIVE];

    const handleSelectChange = (options: { value: string, label: string }[]) => {
        const selected = options[0];
        if (selected) {
            setName(selected.label);
            setIsCustom(!predefinedSkills.includes(selected.label));
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            if (activeTab === 'skill') {
                const skillData: Partial<Skill> = {
                    id: (initialSkill as any)?.id || `skill-${Date.now()}`,
                    name,
                    level: level as SkillLevel,
                    isCustom,
                } as any;
                await Promise.resolve(onSubmit(skillData, 'skill'));
            } else {
                const languageData: Partial<Language> = {
                    id: (initialLanguage as any)?.id || `lang-${Date.now()}`,
                    name,
                    level: level as LanguageLevel,
                } as any;
                await Promise.resolve(onSubmit(languageData, 'language'));
            }
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleTabChange = (type: 'skill' | 'language') => {
        setActiveTab(type);
        setName('');
        setLevel('INTERMEDIATE');
        setIsCustom(false);
    }

    const TabButton: React.FC<{ type: 'skill' | 'language', label: string }> = ({ type, label }) => (
        <button type="button" onClick={() => handleTabChange(type)} className={`w-1/2 p-3 text-sm font-bold rounded-t-lg ${activeTab === type ? 'bg-white dark:bg-slate-800 border-b-2 border-brand-primary text-brand-dark' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
            {label}
        </button>
    );
    
    const skillOptions = predefinedSkills.map(s => ({ value: s, label: s }));
    const currentSkillValue = name && activeTab === 'skill' ? [{ value: name, label: name }] : [];
    
    const LevelSelector: React.FC<{ options: (SkillLevel | LanguageLevel)[]; value: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => {
        const idx = useMemo(() => options.findIndex(o => o === value), [options, value]);
        return (
            <div className="flex items-center gap-2">
                {options.map((opt, i) => (
                    <button
                        type="button"
                        key={String(opt)}
                        onClick={() => onChange(String(opt))}
                        title={t(`skillLevel.${opt}`)}
                        className={`h-8 flex-1 rounded-md transition-colors ${i <= idx ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'} ${i === 0 ? 'rounded-s-md' : ''} ${i === options.length - 1 ? 'rounded-e-md' : ''}`}
                    />
                ))}
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ms-2">{t(`skillLevel.${value}`)}</span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
             <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex"><TabButton type="skill" label={t('profile.addSkill')} /><TabButton type="language" label={t('profile.addLanguage')} /></div>
                <div className="p-6 space-y-4">
                    {activeTab === 'skill' ? (
                        <SelectWithCreate
                            label={t('profile.skillName')}
                            options={skillOptions}
                            value={currentSkillValue}
                            onChange={handleSelectChange}
                            onCreate={(label) => handleSelectChange([{value: label, label}])}
                            placeholder={t('profile.searchOrAddSkill')}
                        />
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.languageNamePlaceholder')}</label>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder={t('profile.languageNamePlaceholder')} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.level')}</label>
                        <LevelSelector
                            options={(activeTab === 'skill' ? skillLevels : languageLevels)}
                            value={level}
                            onChange={setLevel as any}
                        />
                    </div>
                    <div className="flex justify-end items-center gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-slate-200/70 hover:bg-slate-300/70 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed">{t('cancel')}</button>
                        <LoadingButton type="submit" loading={saving} variant="brand">{t('add')}</LoadingButton>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddEditSkillLanguageModal;
