import React, { useMemo, useState } from 'react';
import { PlusIcon, EditIcon, CheckIcon, XIcon, TrashIcon } from '../../../shared/components/Icons';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useData } from '../../../app/providers/DataProvider';
import {
  useAdminAcademicMajors,
  useCreateAcademicMajor,
  useUpdateAcademicMajor,
  useToggleAcademicMajorStatus,
  useDeleteAcademicMajor,
} from '../hooks/useAdminQueries';

const getDisplayName = (m: any) => (m?.name?.ar || m?.name?.en || m?.name || '').trim();
const isActive = (m: any) => String(m?.status || '').toLowerCase() === 'active';

const SpecializationsView: React.FC = () => {
  const { t } = useLanguage();
  const { addToast } = useData();
  const [newItemName, setNewItemName] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [toDelete, setToDelete] = useState<any | null>(null);

  const majorsQuery = useAdminAcademicMajors();
  const createMutation = useCreateAcademicMajor({
    onSuccess: () => addToast(t('toasts.itemAdded')),
  });
  const updateMutation = useUpdateAcademicMajor({
    onSuccess: () => addToast(t('toasts.itemUpdated')),
  });
  const toggleMutation = useToggleAcademicMajorStatus();
  const deleteMutation = useDeleteAcademicMajor({
    onSuccess: () => addToast(t('toasts.itemDeleted'), 'info'),
  });

  const items = useMemo(() => Array.isArray(majorsQuery.data) ? majorsQuery.data : [], [majorsQuery.data]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;
    if (items.some((i: any) => getDisplayName(i).toLowerCase() === name.toLowerCase())) {
      addToast(t('toasts.cannotAddDuplicate'), 'error');
      return;
    }
    createMutation.mutate({ ar: name, en: name });
    setNewItemName('');
  };

  const handleToggleActive = (id: string) => {
    toggleMutation.mutate(id);
  };

  const handleUpdateItem = () => {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) return;
    updateMutation.mutate({ id: editing.id, name: { ar: name, en: name } });
    setEditing(null);
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(String(toDelete.id));
    setToDelete(null);
  };

  return (
    <div className="animate-fade-in">
      {toDelete && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={t('specializations.confirmDeleteTitle')}
          message={t('specializations.confirmDeleteMessage', { name: getDisplayName(toDelete) })}
          icon={<TrashIcon className="w-8 h-8"/>}
          isReasonRequired={false}
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('specializations.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('specializations.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 p-6">
        <form onSubmit={handleAddItem} className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            placeholder={t('specializations.addPlaceholder')}
            className="w-full bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-md text-sm p-2"
          />
          <button type="submit" className="p-2 text-white rounded-md flex-shrink-0" disabled={createMutation.isPending} style={{ backgroundColor: 'var(--primary-color)' }}>
            <PlusIcon className="w-5 h-5" />
          </button>
        </form>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">{t('specializations.name')}</th>
                <th scope="col" className="px-6 py-3 text-left">{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item: any) => (
                <tr key={String(item.id)} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/30">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {editing?.id === String(item.id) ? (
                      <input
                        type="text"
                        value={editing.name}
                        onChange={e => setEditing({ id: String(item.id), name: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md text-sm p-1"
                        autoFocus
                      />
                    ) : (
                      getDisplayName(item)
                    )}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-end gap-4">
                      {editing?.id === String(item.id) ? (
                        <>
                          <button onClick={handleUpdateItem} className="p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50" title={t('save')}>
                            <CheckIcon className="w-5 h-5 text-green-500"/>
                          </button>
                          <button onClick={() => setEditing(null)} className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title={t('cancel')}>
                            <XIcon className="w-5 h-5 text-red-500"/>
                          </button>
                        </>
                      ) : (
                        <>
                          <div title={isActive(item) ? t('specializations.deactivate') : t('specializations.activate')}>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={isActive(item)} onChange={() => handleToggleActive(String(item.id))} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600" style={isActive(item) ? { backgroundColor: 'var(--primary-color)' } : {}}></div>
                            </label>
                          </div>
                          <button onClick={() => setEditing({ id: String(item.id), name: getDisplayName(item) })} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title={t('edit')}>
                            <EditIcon className="w-5 h-5 text-gray-500"/>
                          </button>
                          <button onClick={() => setToDelete(item)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title={t('delete')}>
                            <TrashIcon className="w-5 h-5 text-gray-500 hover:text-red-500"/>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !majorsQuery.isLoading && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={2}>—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpecializationsView;
