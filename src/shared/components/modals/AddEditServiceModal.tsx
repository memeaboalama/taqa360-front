import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SelectWithCreate from '../../../features/educator/components/shared/SelectWithCreate';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import LoadingButton from '../LoadingButton';
import { EducatorService } from '../../../features/educators/services/EducatorService';
import { Service } from '../../types';

interface AddEditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { id?: string; service_id?: string | null; service_name?: string; custom_name?: string | null; custom_description?: string | null; is_custom: boolean }) => void | Promise<void>;
  service?: Service | null;
}

const AddEditServiceModal: React.FC<AddEditServiceModalProps> = ({ isOpen, onClose, onSubmit, service }) => {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({ queryKey: ['admin-services'], queryFn: () => EducatorService.getAdminServices() });

  const options = useMemo(() => {
    const list = Array.isArray(data) && data.length > 0 ? data : [];
    return list.map((s) => ({ value: s.id, label: s.name }));
  }, [data]);

  const [selected, setSelected] = useState<{ value: string; label: string } | null>(null);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (service) {
      const matched = options.find(o => o.label === service.name);
      if (matched) {
        setSelected(matched);
        setIsCustom(false);
        setCustomName('');
      } else {
        setSelected(null);
        setIsCustom(Boolean(service.isCustom));
        setCustomName(service.name || '');
      }
      setDescription(service.description || '');
    } else {
      setSelected(null);
      setIsCustom(false);
      setCustomName('');
      setDescription('');
    }
  }, [service, options]);

  if (!isOpen) return null;

  const handleChange = (opts: { value: string; label: string }[]) => {
    const item = opts?.[0];
    if (item) {
      setSelected(item);
      setIsCustom(false);
      setCustomName('');
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
    const payload = {
      id: service?.id,
      service_id: isCustom ? null : (selected?.value || null),
      service_name: isCustom ? undefined : (selected?.label || undefined),
      custom_name: isCustom ? (customName || selected?.label || '') : null,
      custom_description: (description || null),
      is_custom: Boolean(isCustom),
    };
    setSaving(true);
    try {
      await Promise.resolve(onSubmit(payload));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={saving ? undefined : onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b dark:border-slate-700">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{service ? t('profile.editService') : t('profile.addService')}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t('profile.serviceName')}</label>
            <SelectWithCreate
              label=""
              options={options}
              value={selected ? [selected] : []}
              onChange={(opts) => handleChange(opts as any)}
              onCreate={handleCreate}
              isLoading={isLoading}
              placeholder={t('profile.selectOrAddService')}
            />
            {isCustom && (
              <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder={t('profile.serviceName')} className="mt-2 w-full bg-slate-50 dark:bg-slate-700/50 border rounded-lg text-sm p-2.5"/>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t('modals.description')} ({t('optional')})</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5"/>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-slate-200/70 dark:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed">{t('cancel')}</button>
            <LoadingButton type="submit" loading={saving} variant="brand">{t('profile.saveService')}</LoadingButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditServiceModal;
