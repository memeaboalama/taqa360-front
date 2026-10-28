import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EducatorService } from '../../../features/educators/services/EducatorService';
import { Skill } from '../../types';
import SelectWithCreate from '../../../features/educator/components/shared/SelectWithCreate';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import LoadingButton from '../LoadingButton';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { id?: string; skill_id?: string | null; custom_name?: string | null; is_custom: boolean; level: number }) => void | Promise<void>;
  existing?: Skill | null;
  currentSkills?: Skill[];
  addToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose, onSubmit, existing, currentSkills = [], addToast }) => {
  const { language, t } = useLanguage();
  const { data, isLoading } = useQuery({ queryKey: ['admin-skills'], queryFn: () => EducatorService.getAdminSkills() });

  const options = useMemo(() => {
    const list = Array.isArray(data) && data.length > 0 ? data : [];
    return list.map((s) => ({ value: s.id, label: (language === 'ar' ? (s.name.ar || s.name.en) : (s.name.en || s.name.ar)) || '' }));
  }, [data, language]);

  const [selected, setSelected] = useState<{ value: string; label: string } | null>(null);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [level, setLevel] = useState<number>(existing ? Number(existing.level) || 3 : 3);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (existing) {
      const matched = options.find(o => o.label === existing.name);
      if (matched) {
        setSelected(matched);
        setIsCustom(false);
      } else {
        setSelected(null);
        setIsCustom(Boolean(existing.isCustom));
        setCustomName(existing.name || '');
      }
      setLevel(Number(existing.level) || 3);
    } else {
      setSelected(null);
      setIsCustom(false);
      setCustomName('');
      setLevel(3);
    }
  }, [existing, options]);

  if (!isOpen) return null;

  const handleChange = (opts: { value: string; label: string }[]) => {
    const item = opts?.[0];
    if (item) {
      setSelected(item);
      setCustomName('');
      setIsCustom(false);
    }
  };

  const handleCreate = (label: string) => {
    setSelected(null);
    setIsCustom(true);
    setCustomName(label);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const nameToCheck = (selected?.label || customName || '').trim().toLowerCase();
    const dup = currentSkills.some(s => (s.name || '').trim().toLowerCase() === nameToCheck);
    if (!existing && dup) {
      addToast ? addToast(t('toasts.cannotAddDuplicate'), 'error') : alert(t('toasts.cannotAddDuplicate'));
      return;
    }
    const payload = {
      id: (existing as any)?.id,
      skill_id: isCustom ? null : (selected?.value || null),
      custom_name: isCustom ? (customName || selected?.label || '') : null,
      is_custom: Boolean(isCustom),
      level: Math.min(5, Math.max(1, Number(level) || 3)),
    };
    setSaving(true);
    try {
      await Promise.resolve(onSubmit(payload));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const Stars: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
    return (
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} className={`w-6 h-6 rounded-full ${n <= value ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></button>
        ))}
        <span className="ms-2 text-xs font-semibold text-slate-600 dark:text-slate-300">{value}/5</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={saving ? undefined : onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b dark:border-slate-700">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{existing ? 'تعديل مهارة' : 'إضافة مهارة'}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">المهارة</label>
            <SelectWithCreate
              label=""
              options={options}
              value={selected ? [selected] : []}
              onChange={(opts) => handleChange(opts as any)}
              onCreate={handleCreate}
              isLoading={isLoading}
              placeholder={language === 'ar' ? 'ابحث أو أضف مهارة' : 'Search or add a skill'}
            />
            {isCustom && (
              <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder={language === 'ar' ? 'اسم المهارة' : 'Skill name'} className="mt-2 w-full bg-slate-50 dark:bg-slate-700/50 border rounded-lg text-sm p-2.5"/>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">المستوى</label>
            <Stars value={level} onChange={setLevel} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-slate-200/70 dark:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed">إلغاء</button>
            <LoadingButton type="submit" loading={saving} variant="brand">{existing ? 'حفظ' : 'إضافة'}</LoadingButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddSkillModal;
