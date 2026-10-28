import React, { useMemo, useState } from 'react';
import { Educator, EducatorStatus, ViewType } from '../../../shared/types';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import Avatar from '../../../shared/components/Avatar';
import { StarIcon, SearchIcon, ViewGridIcon, ViewListIcon } from '../../../shared/components/Icons';
import { useAdminEducators } from '../../../core/hooks/useAdminQueries';
import { env } from '../../../core/config/env';

interface RegistrationRequestsViewProps {
  navigateTo: (view: ViewType, id?: any) => void;
}

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} filled={i < Math.round(rating)} />
      ))}
      <span className="text-xs text-slate-500 ms-1.5 font-medium">({rating.toFixed(1)})</span>
    </div>
  );
};

const RequestCard: React.FC<{ educator: Educator; navigateTo: (view: ViewType, id?: any) => void }> = ({ educator, navigateTo }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-gray-100 dark:border-gray-700">
      <Avatar src={educator.avatarUrl} name={educator.name} size={72} className="rounded-full ring-4 ring-white dark:ring-gray-800" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg text-brand-dark dark:text-white truncate">{educator.name}</h3>
        <p className="text-sm text-slate-500 truncate">{educator.discipline} • {educator.country}</p>
        <div className="mt-2 flex items-center gap-3">
          <RatingStars rating={educator.rating} />
          <span className="text-xs text-slate-500">{educator.yearsOfExperience ? `${educator.yearsOfExperience} ${'سنوات خبرة'}` : ''}</span>
        </div>
        <p className="mt-3 text-sm text-slate-600 line-clamp-2">{educator.bio || ''}</p>
      </div>
      <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 text-center">قيد المراجعة</span>
        <button onClick={() => navigateTo('educatorApplicationDetail', educator.applicationId || educator.id)} className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:shadow-glow-primary">عرض الملف</button>
      </div>
    </div>
  );
};

const RegistrationRequestsView: React.FC<RegistrationRequestsViewProps> = ({ navigateTo }) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('compact');
  const [query, setQuery] = useState('');
  const educatorsQuery = useAdminEducators({ paginated: 'true' as const, per_page: env.DEFAULT_PAGE_SIZE });
  const educators = Array.isArray(educatorsQuery.data) ? (educatorsQuery.data as Educator[]) : ((educatorsQuery.data as any)?.educators || []) as Educator[];

  const pending = useMemo(() => (educators || []).map((e: any) => ({
    ...e,
    status: (e.status || '').toString().toUpperCase()
  })).filter(e => ['PENDING_REVIEW', 'PENDING', 'SUBMITTED'].includes(e.status)), [educators]);

  const filtered = useMemo(() => {
    if (!query.trim()) return pending;
    const q = query.trim().toLowerCase();
    return pending.filter(e => [e.name, e.discipline, e.email, e.country].filter(Boolean).join(' ').toLowerCase().includes(q));
  }, [pending, query]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark">طلبات التسجيل</h1>
          <p className="text-sm text-slate-500">المتخصصون الذين قدموا طلبات التسجيل ({pending.length})</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 shadow-sm w-full max-w-md">
            <SearchIcon className="w-4 h-4 text-slate-400 me-2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('modals.searchByNameOrEmail')} className="w-full bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200" />
          </div>
          <div className="inline-flex items-center gap-2">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800'}`} aria-label="Grid view"><ViewGridIcon className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800'}`} aria-label="List view"><ViewListIcon className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('compact')} className={`p-2 rounded-lg ${viewMode === 'compact' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800'}`} aria-label="Compact view"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6zm0 5h12v2H3v-2zm0 5h8v2H3v-2z"/></svg></button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border dark:border-gray-700">
            <p className="text-slate-500">لا توجد طلبات تسجيل حالياً.</p>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(ed => <RequestCard key={ed.id} educator={{ ...ed, applicationId: ed.id }} navigateTo={navigateTo} />)}
          </div>
        )}

        {viewMode === 'compact' && (
          <div className="space-y-2">
            {filtered.map(ed => (
              <button key={ed.id} onClick={() => navigateTo('educatorApplicationDetail', ed.id)} className="w-full text-start bg-white dark:bg-slate-800 border dark:border-gray-700 rounded-xl p-3 flex items-center gap-3 hover:shadow-sm active:scale-[.995] transition">
                <Avatar src={ed.avatarUrl} name={ed.name} size={44} className="rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-brand-dark dark:text-white truncate">{ed.name}</div>
                      <div className="text-xs text-slate-500 truncate">{ed.discipline} • {ed.country}</div>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] rounded-full bg-yellow-100 text-yellow-800">قيد المراجعة</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-3">
            {filtered.map(ed => (
              <div key={ed.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 flex items-center justify-between border dark:border-gray-700">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={ed.avatarUrl} name={ed.name} size={48} className="rounded-full" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-brand-dark dark:text-white truncate">{ed.name}</span>
                      <span className="text-xs text-slate-500">{ed.discipline}</span>
                    </div>
                    <div className="text-sm text-slate-500 truncate">{ed.email} • {ed.country}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigateTo('educatorApplicationDetail', ed.id)} className="px-3 py-2 bg-brand-primary text-white rounded-lg">عرض الملف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationRequestsView;
