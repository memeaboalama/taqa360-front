import React from 'react';
import { Attachment } from '../../../shared/types';
import { EyeIcon, PaperclipIcon, TrashIcon, EditIcon, PlusIcon, CheckIcon, XCircleIcon } from '../../../shared/components/Icons';
import AttachmentPreviewModal from '../../../shared/components/modals/AttachmentPreviewModal';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { useProjectAttachments, useCreateProjectAttachment, useUpdateProjectAttachment, useDeleteProjectAttachment } from '../../../core/hooks/useAdminQueries';
import { useData } from '../../../app/providers/DataProvider';

interface Props {
  projectId: string;
}

const formatSize = (s: string) => {
  const num = Number(String(s).replace(/[^\d.]/g, ''));
  if (!isFinite(num)) return s || '';
  if (num < 1) return `${(num * 1024).toFixed(0)} KB`;
  return `${num.toFixed(2)} MB`;
};

const isImageFile = (url: string, type?: string): boolean => {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(url) || (type ? /image\//.test(type) : false);
};

const AttachmentItemDisplay: React.FC<{
  attachment: Attachment;
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  editFile: File | null;
  editFilePreview: string | null;
  onEditChange: (field: 'title' | 'description' | 'file', value: string | File | null) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onPreview: () => void;
  onDelete: () => void;
  isUpdating: boolean;
  serverErrors: Record<string, string[]> | null;
}> = ({
  attachment,
  isEditing,
  editTitle,
  editDescription,
  editFile,
  editFilePreview,
  onEditChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onPreview,
  onDelete,
  isUpdating,
  serverErrors,
}) => {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-brand-primary dark:hover:border-yellow-600 transition-colors">
      {isEditing ? (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">العنوان<span className="text-red-500"> *</span></label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => onEditChange('title', e.target.value)}
                  placeholder="أدخل عنوان المرفق"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                {serverErrors?.title?.[0] && <p className="text-xs text-red-600 mt-1">{serverErrors.title[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">الوصف <span className="text-gray-400">(اختياري)</span></label>
                <textarea
                  value={editDescription}
                  onChange={(e) => onEditChange('description', e.target.value)}
                  placeholder="أضف وصفاً للمرفق"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                {serverErrors?.description?.[0] && <p className="text-xs text-red-600 mt-1">{serverErrors.description[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">الملف <span className="text-gray-400">(اختياري - للتعديل فقط)</span></label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                    onChange={(e) => onEditChange('file', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary dark:file:bg-brand-primary/20/20 dark:file:text-brand-accent"
                  />
                </div>
                {editFile && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ تم اختيار ملف جديد: <span className="font-medium">{editFile.name}</span>
                  </p>
                )}
                {serverErrors?.attachment?.[0] && <p className="text-xs text-red-600 mt-1">{serverErrors.attachment[0]}</p>}
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">معاينة المرفق</label>
              <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[200px]">
                {editFilePreview && isImageFile(editFilePreview) ? (
                  <img src={editFilePreview} alt="preview" className="max-w-full max-h-[180px] rounded-lg" />
                ) : editFilePreview ? (
                  <div className="text-center">
                    <PaperclipIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">{editFile?.name || 'ملف محدث'}</p>
                  </div>
                ) : isImageFile(attachment.url, attachment.type) ? (
                  <img src={attachment.url} alt="preview" className="max-w-full max-h-[180px] rounded-lg" />
                ) : (
                  <div className="text-center">
                    <PaperclipIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">{attachment.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onSaveEdit}
              disabled={isUpdating || !editTitle.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-primary text-white rounded-lg font-medium text-sm hover:bg-brand-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <CheckIcon className="w-4 h-4" /> حفظ
            </button>
            <button
              onClick={onCancelEdit}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <XCircleIcon className="w-4 h-4" /> إلغاء
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{attachment.title || attachment.name}</h4>
              <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">{formatSize(attachment.size)}</span>
            </div>
            {attachment.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{attachment.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
              {('uploadedAt' in (attachment as any)) && (attachment as any).uploadedAt && (
                <span>{(attachment as any).uploadedAt}</span>
              )}
              {attachment.uploadedBy && (
                <span>• {attachment.uploadedBy === 'admin' ? 'الإدارة' : 'متخصص'}</span>
              )}
            </div>
          </div>
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-brand-primary dark:text-yellow-500 hover:underline truncate ms-2 flex-shrink-0"
            title={attachment.name}
          >
            {attachment.name}
          </a>
          <div className="flex items-center gap-1.5 flex-shrink-0 ms-2">
            <button
              onClick={onPreview}
              title="عرض المرفق"
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-brand-primary dark:hover:text-yellow-500 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onStartEdit}
              title="تعديل المرفق"
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-brand-primary dark:hover:text-yellow-500 transition-colors"
            >
              <EditIcon className="w-4 h-4" />
            </button>
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              title="تحميل الملف"
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-brand-primary dark:hover:text-yellow-500 transition-colors"
            >
              <UploadIcon className="w-4 h-4" />
            </a>
            <button
              onClick={onDelete}
              title="حذف المرفق"
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const UploadIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ProjectAttachmentsTab: React.FC<Props> = ({ projectId }) => {
  const { addToast } = useData();
  const attachmentsQuery = useProjectAttachments(projectId);
  const createMutation = useCreateProjectAttachment();
  const updateMutation = useUpdateProjectAttachment();
  const deleteMutation = useDeleteProjectAttachment();

  const [preview, setPreview] = React.useState<Attachment | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [editFile, setEditFile] = React.useState<File | null>(null);
  const [editFilePreview, setEditFilePreview] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<Attachment | null>(null);
  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]> | null>(null);

  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [addTitle, setAddTitle] = React.useState('');
  const [addDescription, setAddDescription] = React.useState('');
  const [addFile, setAddFile] = React.useState<File | undefined>();
  const [addFilePreview, setAddFilePreview] = React.useState<string | null>(null);
  const [addTouched, setAddTouched] = React.useState(false);

  const list: Attachment[] = Array.isArray(attachmentsQuery.data) ? attachmentsQuery.data : ((attachmentsQuery.data as any)?.data?.attachments || []);

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setAddTitle('');
    setAddDescription('');
    setAddFile(undefined);
    setAddTouched(false);
    setServerErrors(null);
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setAddTitle('');
    setAddDescription('');
    setAddFile(undefined);
    setAddFilePreview(null);
    setAddTouched(false);
    setServerErrors(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddTouched(true);
    setServerErrors(null);
    if (!addTitle.trim() || !addFile) return;
    createMutation.mutate(
      { projectId, title: addTitle.trim(), description: addDescription?.trim() || null, file: addFile },
      {
        onSuccess: () => {
          setAddTitle('');
          setAddDescription('');
          setAddFile(undefined);
          setAddFilePreview(null);
          setIsAddingNew(false);
          setAddTouched(false);
          addToast('تمت إضافة المرفق بنجاح.');
        },
        onError: (e: any) => {
          setServerErrors((e?.errors as any) || null);
          addToast(e?.message || 'فشلت عملية الإضافة', 'error');
        }
      }
    );
  };

  const handleStartEdit = (att: Attachment) => {
    setEditingId(att.id);
    setEditTitle(att.title || '');
    setEditDescription((att as any)?.description || '');
    setEditFile(null);
    setEditFilePreview(null);
    setServerErrors(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditFile(null);
    setEditFilePreview(null);
    setServerErrors(null);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setServerErrors(null);
    if (!editTitle.trim()) return;
    updateMutation.mutate(
      {
        projectId,
        attachmentId: editingId,
        title: editTitle.trim(),
        description: editDescription?.trim() || null,
        file: editFile || undefined
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditTitle('');
          setEditDescription('');
          setEditFile(null);
          setEditFilePreview(null);
          addToast('تم تحديث المرفق بنجاح.');
        },
        onError: (e: any) => {
          setServerErrors((e?.errors as any) || null);
          addToast(e?.message || 'فشلت عملية التحديث', 'error');
        }
      }
    );
  };

  const handleDelete = (att: Attachment) => {
    deleteMutation.mutate(
      { projectId, attachmentId: att.id },
      {
        onSuccess: () => {
          setConfirmDelete(null);
          addToast('تم حذف المرفق.', 'info');
        },
        onError: (e: any) => {
          addToast(e?.message || 'فشل حذف المرفق', 'error');
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg flex items-center text-gray-900 dark:text-white mb-4">
          <PaperclipIcon className="w-5 h-5 me-2 text-brand-primary" />
          إدارة المرفقات
        </h3>
      </div>

      {isAddingNew ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-brand-primary" />
            إضافة مرفق جديد
          </h4>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    العنوان <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="أدخل عنوان المرفق"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  {addTouched && !addTitle.trim() && <p className="text-xs text-red-600 mt-1">العنوان مطلوب</p>}
                  {serverErrors?.title?.[0] && <p className="text-xs text-red-600 mt-1">{serverErrors.title[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    الوصف <span className="text-gray-400">(اختياري)</span>
                  </label>
                  <textarea
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    placeholder="أضف وصفاً للمرفق"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  {serverErrors?.description?.[0] && <p className="text-xs text-red-600 mt-1">{serverErrors.description[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    الملف <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setAddFile(file);
                        if (file && isImageFile(file.type)) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setAddFilePreview(event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setAddFilePreview(null);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary dark:file:bg-brand-primary/20/20 dark:file:text-brand-accent"
                    />
                  </div>
                  {addFile && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ تم اختيار: <span className="font-medium">{addFile.name}</span>
                    </p>
                  )}
                  {addTouched && !addFile && <p className="text-xs text-red-600 mt-1">الملف مطلوب</p>}
                  {serverErrors?.attachment?.[0] && <p className="text-xs text-red-600 mt-1">{serverErrors.attachment[0]}</p>}
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">معاينة</label>
                <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[200px]">
                  {addFilePreview ? (
                    <img src={addFilePreview} alt="preview" className="max-w-full max-h-[180px] rounded-lg" />
                  ) : addFile ? (
                    <div className="text-center">
                      <PaperclipIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">{addFile.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <PaperclipIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 dark:text-gray-500">اختر ملفاً لعرض المعاينة</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="submit"
                disabled={createMutation.isPending || !addTitle.trim() || !addFile}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <PlusIcon className="w-4 h-4" /> {createMutation.isPending ? 'جاري الإضافة...' : 'إضافة المرفق'}
              </button>
              <button
                type="button"
                onClick={handleCancelAdd}
                disabled={createMutation.isPending}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={handleStartAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-brand-primary hover:bg-brand-primary/5 dark:hover:border-brand-accent dark:hover:bg-brand-primary/90/5 font-semibold transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          إضافة مرفق جديد
        </button>
      )}

      <div>
        {attachmentsQuery.isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">جارِ التحميل...</p>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <PaperclipIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-gray-500 dark:text-gray-400">لا توجد مرفقات لهذا المشروع.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">ابدأ بإضافة مرفق جديد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((att) => (
              <AttachmentItemDisplay
                key={att.id}
                attachment={att}
                isEditing={editingId === att.id}
                editTitle={editTitle}
                editDescription={editDescription}
                editFile={editFile}
                editFilePreview={editFilePreview}
                onEditChange={(field, value) => {
                  if (field === 'title') setEditTitle(value as string);
                  else if (field === 'description') setEditDescription(value as string);
                  else if (field === 'file') {
                    const file = value as File | null;
                    setEditFile(file);
                    if (file && isImageFile(file.type)) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setEditFilePreview(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setEditFilePreview(null);
                    }
                  }
                }}
                onStartEdit={() => handleStartEdit(att)}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onPreview={() => setPreview(att)}
                onDelete={() => setConfirmDelete(att)}
                isUpdating={updateMutation.isPending}
                serverErrors={editingId === att.id ? serverErrors : null}
              />
            ))}
          </div>
        )}
      </div>

      <AttachmentPreviewModal isOpen={!!preview} onClose={() => setPreview(null)} title={preview?.title || preview?.name} url={preview?.url || ''} type={preview?.type} />

      {confirmDelete && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
          title="تأكيد حذف المرفق"
          message="هل أنت متأكد من حذف هذا المرفق؟ لا يمكن التراجع عن هذا الإجراء."
          icon={<TrashIcon className="w-8 h-8" />}
          isReasonRequired={false}
        />
      )}
    </div>
  );
};

export default ProjectAttachmentsTab;
