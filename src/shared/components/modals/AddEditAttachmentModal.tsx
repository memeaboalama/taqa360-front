import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string | null; file?: File }) => void;
  initial?: { title?: string; description?: string | null };
  mode?: 'add' | 'edit';
  submitting?: boolean;
  serverErrors?: Record<string, string[]> | null;
}

const AddEditAttachmentModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initial, mode = 'add', submitting, serverErrors }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [file, setFile] = useState<File | undefined>();
  const [touched, setTouched] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!title.trim()) return;
    if (mode === 'add' && !file) return;
    onSubmit({ title: title.trim(), description: description?.trim() || null, file });
  };

  const fieldError = (key: string) => serverErrors?.[key]?.[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white">{mode === 'add' ? 'إضافة مرفق' : 'تعديل المرفق'}</h3>
          <p className="text-xs text-gray-500 mt-1">الرجاء تعبئة الحقول بدقة.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">العنوان<span className="text-red-500"> *</span></label>
            <input className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-slate-700/50 dark:border-slate-600" value={title} onChange={e => setTitle(e.target.value)} />
            {touched && !title.trim() && <p className="text-xs text-red-600 mt-1">العنوان مطلوب</p>}
            {fieldError('title') && <p className="text-xs text-red-600 mt-1">{fieldError('title')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <textarea className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-slate-700/50 dark:border-slate-600" rows={3} value={description || ''} onChange={e => setDescription(e.target.value)} />
            {fieldError('description') && <p className="text-xs text-red-600 mt-1">{fieldError('description')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الملف{mode === 'add' && <span className="text-red-500"> *</span>}</label>
            <input type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip" onChange={e => setFile(e.target.files ? e.target.files[0] : undefined)} />
            {touched && mode === 'add' && !file && <p className="text-xs text-red-600 mt-1">الملف مطلوب</p>}
            {fieldError('attachment') && <p className="text-xs text-red-600 mt-1">{fieldError('attachment')}</p>}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200" onClick={onClose} disabled={submitting}>إلغاء</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-brand-primary text-white disabled:opacity-60" disabled={submitting}>{submitting ? 'جاري الحفظ...' : (mode === 'add' ? 'إضافة' : 'حفظ')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditAttachmentModal;
