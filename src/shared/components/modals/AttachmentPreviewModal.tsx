import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url: string;
  type?: string;
}

const isImage = (url: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
const isPdf = (url: string) => /\.pdf$/i.test(url);

const AttachmentPreviewModal: React.FC<Props> = ({ isOpen, onClose, title, url, type }) => {
  if (!isOpen) return null;
  const image = isImage(url) || (type ? /image\//.test(type) : false);
  const pdf = isPdf(url) || (type ? /pdf/.test(type) : false);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">{title || 'معاينة المرفق'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">إغلاق</button>
        </div>
        <div className="p-2 sm:p-4 overflow-auto bg-gray-50 dark:bg-slate-900/50">
          {image ? (
            <img src={url} alt={title || 'attachment'} className="max-h-[75vh] mx-auto rounded" />
          ) : pdf ? (
            <iframe title={title || 'attachment'} src={url} className="w-full h-[75vh] rounded bg-white" />
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">لا يمكن عرض هذا النوع من الملفات داخل الصفحة.</p>
              <a href={url} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-brand-primary text-white rounded-lg">تحميل الملف</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentPreviewModal;
