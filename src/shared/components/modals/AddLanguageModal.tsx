import React, { useMemo, useState, useEffect } from 'react';
import { useSupportedLanguages } from '../../../core/hooks/useEducatorQueries';
import { Language } from '../../types';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import LoadingButton from '../LoadingButton';
import SelectWithCreate from '../../../features/educator/components/shared/SelectWithCreate';

export type LanguageLevelApi = 'beginner' | 'intermediate' | 'advanced' | 'native';

const mapToApi = (val: string): LanguageLevelApi => {
  const v = String(val || '').toLowerCase();
  if (v === 'native') return 'native';
  if (v === 'advanced') return 'advanced';
  if (v === 'intermediate') return 'intermediate';
  return 'beginner';
};

const mapFromApi = (val?: string): string => {
  const v = String(val || '').toLowerCase();
  if (v === 'native') return 'NATIVE';
  if (v === 'advanced') return 'ADVANCED';
  if (v === 'intermediate') return 'INTERMEDIATE';
  if (v === 'beginner' || v === 'basic') return 'BASIC';
  return 'BASIC';
};

interface AddLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { id?: string; language_id: string; language_name: string; level: LanguageLevelApi; is_primary: boolean }) => void | Promise<void>;
  existing?: Language | null;
  currentLanguages?: Language[];
  addToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const LangLevelPills: React.FC<{ value: string; onChange: (v: string) => void; language: string }> = ({ value, onChange, language }) => {
  const opts = [
    { key: 'BASIC', label: language === 'ar' ? 'مبتدئ' : 'Beginner' },
    { key: 'INTERMEDIATE', label: language === 'ar' ? 'متوسط' : 'Intermediate' },
    { key: 'ADVANCED', label: language === 'ar' ? 'متقدم' : 'Advanced' },
    { key: 'NATIVE', label: language === 'ar' ? 'لغة أم' : 'Native' },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${value === o.key ? 'bg-brand-primary text-white border-brand-primary' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
        >{o.label}</button>
      ))}
    </div>
  );
};

const AddLanguageModal: React.FC<AddLanguageModalProps> = ({ isOpen, onClose, onSubmit, existing, currentLanguages = [], addToast }) => {
  const { t, language } = useLanguage();
  const { data: supported, isLoading } = useSupportedLanguages();

  const [languageId, setLanguageId] = useState<string>('');
  const [customLanguageName, setCustomLanguageName] = useState<string>('');
  const [level, setLevel] = useState<string>('BASIC');
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const options = useMemo(() => {
    const list: { id: string; title: string }[] = (supported?.data || supported) || [];
    return list;
  }, [supported]);

  const selectOptions = useMemo(() => options.map((l) => ({ value: String(l.id), label: String(l.title) })), [options]);
  const selectedValue = useMemo(() => selectOptions.filter(o => o.value === languageId), [selectOptions, languageId]);

  useEffect(() => {
    if (existing) {
      const match = options.find((l: any) => (l?.title ?? '').trim().toLowerCase().includes((existing?.name ?? '').trim().toLowerCase()));
      setLanguageId(match?.id || (existing as any)?.language_id || '');
      setLevel(mapFromApi(String((existing as any)?.level || existing.level)));
      setIsPrimary(Boolean((existing as any)?.isPrimary));
    } else {
      setLanguageId('');
      setCustomLanguageName('');
      setLevel('BASIC');
      setIsPrimary(false);
    }
  }, [existing, options]);

  const handleLevelChange = (newLevel: string) => {
    setLevel(newLevel);
    if (newLevel === 'NATIVE') {
      setIsPrimary(true);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!languageId) {
      addToast ? addToast(t('modals.fieldRequired'), 'error') : alert(t('modals.fieldRequired'));
      return;
    }
    const duplicate = currentLanguages.some((l) => String((l as any).language_id || '').toLowerCase() === languageId.toLowerCase() || String(l.name || '').trim() === String(options.find(o => o.id === languageId)?.title || '').trim());
    if (!existing && duplicate) {
      addToast ? addToast(t('toasts.cannotAddDuplicate'), 'error') : alert(t('toasts.cannotAddDuplicate'));
      return;
    }
    const selectedName = customLanguageName || options.find(o => o.id === languageId)?.title || '';
    setSaving(true);
    try {
      await Promise.resolve(onSubmit({ id: (existing as any)?.id, language_id: languageId, language_name: selectedName, level: mapToApi(level), is_primary: isPrimary }));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={saving ? undefined : onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b dark:border-slate-700">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{existing ? (language === 'ar' ? 'تعديل لغة' : 'Edit Language') : (language === 'ar' ? 'إضافة لغة' : 'Add Language')}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{language === 'ar' ? 'اللغة' : 'Language'}</label>
            <SelectWithCreate
              label=""
              options={selectOptions}
              value={selectedValue}
              onChange={(opts) => setLanguageId((opts?.[0]?.value) || '')}
              onCreate={(label) => {
                setCustomLanguageName(label);
                setLanguageId(label);
              }}
              isLoading={isLoading}
              placeholder={language === 'ar' ? 'ابحث أو أضف لغة' : 'Search or add a language'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{language === 'ar' ? 'المستوى' : 'Level'}</label>
            <LangLevelPills value={level} onChange={handleLevelChange} language={language} />
          </div>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} className="rounded text-brand-primary focus:ring-brand-primary"/>
            <span>{t('profile.primaryLanguage')}</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-slate-200/70 dark:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed">إلغاء</button>
            <LoadingButton type="submit" loading={saving} variant="brand">{existing ? 'حفظ' : 'إضافة'}</LoadingButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddLanguageModal;
