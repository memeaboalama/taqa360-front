import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Project, ProjectStatus, ViewType, ProjectCreationType } from '../../../shared/types';
import { PlusIcon, SearchIcon, FilterIcon, EyeIcon, TrashIcon, LockOpenIcon, LockClosedIcon, ViewGridIcon, ViewListIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../shared/components/Icons';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useAdminProjects, usePublishProject, useUnpublishProject, useDeleteProject, useAdminEducators } from '../../../core/hooks/useAdminQueries';
import { env } from '../../../core/config/env';
import Avatar from '../../../shared/components/Avatar';
import { PaginatedRequestParams } from '../../../core/api/types';
import { resolveProjectTeam } from '../../../shared/utils';

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Pagination helper to render compact page list with ellipsis
const buildPageList = (current: number, last: number, maxVisible = 7) => {
  if (!last || last <= 1) return [];
  const pages: (number | string)[] = [];
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(last, current + half);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, Math.min(start, last - maxVisible + 1));
    end = Math.min(last, start + maxVisible - 1);
  }
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < last) {
    if (end < last - 1) pages.push('...');
    pages.push(last);
  }
  return pages;
};

interface ProjectsViewProps {
    navigateTo: (view: ViewType, projectId?: string) => void;
}

const getStatusBadge = (status: string | undefined, t: (key: string) => string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'canceled':
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
};

const ProjectCard: React.FC<{
  project: any; // Using any to handle API response structure
  educators: any[];
  onViewDetails: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}> = ({ project, educators, onViewDetails, onDelete, onTogglePublish }) => {
    const { t } = useLanguage();

    const completedTasksCount = project.completedTasksCount || 0;
    const totalTasks = project.tasksCount || (project.tasks ? project.tasks.length : 0);
    const progress = project.progress || (totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0);

    // Same helper as the project detail team card, so the two screens can never
    // disagree. It also filters to ACCEPTED assignments, which the previous
    // inline version here did not do, and dedupes an educator assigned to
    // several tasks.
    const team = useMemo(() => resolveProjectTeam(project, educators), [project, educators]);
    const assignedEducatorsCount = team.length;

    const requesterName = project.requesterName || (project.createdBy && typeof project.createdBy === 'object' ? project.createdBy.name : project.createdBy) || 'Unknown';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border dark:border-gray-700 p-4 sm:p-6 flex flex-col transition-all duration-200 hover:shadow-lg active:scale-[.995] overflow-hidden min-w-0">
            <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                    <h2 onClick={onViewDetails} className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white cursor-pointer truncate" title={project.title}>{project.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{t('projectsView.by')}: {requesterName}</p>
                </div>
                <span className={`flex-shrink-0 whitespace-nowrap px-2.5 py-1 text-[11px] font-bold rounded-full ${getStatusBadge(project.status?.toLowerCase(), t)}`}>
                    {t(`status.${project.status?.toLowerCase() || 'pending'}`)}
                </span>
            </div>

            <div className="my-3">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <span>{t('projectsView.progress')}</span>
                    <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200/70 rounded-full h-2.5 dark:bg-slate-700">
                    <div className="h-2.5 rounded-full" style={{ width: `${progress}%`, backgroundColor: 'var(--primary-color)' }}></div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center my-3 text-xs sm:text-sm">
                 <div className="min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 truncate">{t('projectsView.budget')}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">{project.budget ? `${project.budget.toLocaleString()} ${t('sarCurrency')}` : 'N/A'}</p>
                </div>
                <div className="border-x border-slate-100 dark:border-slate-700 min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 truncate">{t('projectsView.tasks')}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">{totalTasks}</p>
                </div>
                <div className="min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 truncate">{t('projectsView.type')}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">{t(`projectType.${project.creationType?.toLowerCase() || 'public'}`)}</p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={onViewDetails} className="px-3 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--primary-color)' }}>{t('viewDetails')}</button>
                    <button onClick={onDelete} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title={t('delete')}>
                        <TrashIcon className="w-4 h-4" />
                    </button>
                    {(project.creationType?.toLowerCase() === 'public' || project.creationType === 'PUBLIC') && (
                        <button onClick={onTogglePublish} className="p-2 rounded-lg text-yellow-600 hover:bg-brand-primary/10 dark:hover:bg-yellow-900/30 transition-colors" title={project.isPublished ? t('unpublish') : t('publish')}>
                            {project.isPublished ? <LockOpenIcon className="w-4 h-4"/> : <LockClosedIcon className="w-4 h-4"/>}
                        </button>
                    )}
                </div>
                <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden flex-shrink-0">
                    {team.slice(0, 1).map((e, index) => (
                        <Avatar key={e?.id || index} src={e?.avatarUrl} name={e?.name} size={36} className="inline-block rounded-full ring-2 ring-white dark:ring-slate-800" />
                    ))}
                    {assignedEducatorsCount > 1 && (
                        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">+{assignedEducatorsCount - 1}</div>
                    )}
                </div>
            </div>
        </div>
    );
};


const ProjectRow: React.FC<{
  project: any; // Using any to handle API response structure
  onViewDetails: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}> = ({ project, onViewDetails, onDelete, onTogglePublish }) => {
    const { t } = useLanguage();
    const requesterName = project.requesterName || (project.createdBy && typeof project.createdBy === 'object' ? project.createdBy.name : project.createdBy) || 'Unknown';
    const statusClass = getStatusBadge(project.status?.toLowerCase(), t);

    return (
        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/30">
            <td className="px-6 py-4">
                <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{project.title}</p>
                <p className="text-xs text-gray-500">{t('projectsView.by')}: {requesterName}</p>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                    {t(`status.${project.status?.toLowerCase() || 'pending'}`)}
                </span>
            </td>
            <td className="px-6 py-4">{project.budget ? `${project.budget.toLocaleString()} ${t('sarCurrency')}` : t('projectsView.notSet')}</td>
            <td className="px-6 py-4">{project.tasks?.length || 0}</td>
            <td className="px-6 py-4">{project.deadline || t('projectsView.notSet')}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button onClick={onViewDetails} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title={t('viewDetails')}>
                        <EyeIcon className="w-5 h-5 text-gray-500"/>
                    </button>
                    {project.creationType === ProjectCreationType.PUBLIC && (
                         <button onClick={onTogglePublish} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title={project.isPublished ? t('unpublish') : t('publish')}>
                            {project.isPublished ? <LockOpenIcon className="w-5 h-5 text-yellow-500"/> : <LockClosedIcon className="w-5 h-5 text-gray-500"/>}
                        </button>
                    )}
                    <button onClick={onDelete} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title={t('delete')}>
                        <TrashIcon className="w-5 h-5 text-gray-500 hover:text-red-500"/>
                    </button>
                </div>
            </td>
        </tr>
    );
};


const ProjectsView: React.FC<ProjectsViewProps> = ({ navigateTo }) => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [createdByFilter, setCreatedByFilter] = useState('');
  const [sortBy, setSortBy] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const debouncedSearch = useDebouncedValue(searchTerm, 400);
  const debouncedCreatedBy = useDebouncedValue(createdByFilter, 400);
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null);
  const [publishConfirm, setPublishConfirm] = useState<{ project: Project; action: 'publish' | 'unpublish' } | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Build filter parameters for API (memoized object to avoid redundant refetches)
  const projectsParams: PaginatedRequestParams = useMemo(() => {
    const params: any = {
      paginated: "true" as const,
      per_page: perPage,
      page: currentPage
    };

    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (statusFilter && statusFilter !== 'الكل') params.status = statusFilter;
    if (typeFilter && typeFilter !== 'الكل') params.creation_type = typeFilter;
    if (debouncedCreatedBy.trim()) params.created_by = debouncedCreatedBy.trim();
    if (sortBy.length > 0) params.sorting = sortBy;

    return params;
  }, [debouncedSearch, statusFilter, typeFilter, debouncedCreatedBy, sortBy, currentPage, perPage]);

  // Fetch data from real APIs with filters
  const projectsQuery = useAdminProjects(projectsParams);
  const educatorsParams = useMemo(() => ({ paginated: "true" as const, per_page: 20 }), []);
  const educatorsQuery = useAdminEducators(educatorsParams);
  const publishMutation = usePublishProject();
  const unpublishMutation = useUnpublishProject();
  const deleteMutation = useDeleteProject();

  const projects = projectsQuery.data || [];
  const pagination = (projectsQuery as any).pagination || projectsQuery.data?.pagination;
  const educators = educatorsQuery.data?.data?.educators || [];

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setCreatedByFilter('');
    setSortBy([]);
    setCurrentPage(1);
  }, []);

  // Handle pagination
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const goToPreviousPage = useCallback(() => {
    if (pagination?.meta.page.previous) {
      setCurrentPage(pagination.meta.page.previous);
    }
  }, [pagination]);

  const goToNextPage = useCallback(() => {
    if (pagination?.meta.page.next) {
      setCurrentPage(pagination.meta.page.next);
    }
  }, []);

  // Handle sorting
  const toggleSort = useCallback((field: string) => {
    setSortBy(prev => {
      if (prev.includes(field)) {
        return prev.filter(f => f !== field);
      } else {
        return [...prev, field];
      }
    });
    setCurrentPage(1);
  }, []);

  const handleDelete = (reason: string) => {
    if (deleteConfirm) {
      deleteMutation.mutate({ id: deleteConfirm.id, reason });
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      {deleteConfirm && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title={t('projectsView.confirmDeleteTitle')}
          message={t('projectsView.confirmDeleteMessage', { title: deleteConfirm.title })}
          icon={<TrashIcon className="w-8 h-8" />}
          isReasonRequired={false}
          reasonLabel={t('projectsView.deleteReason')}
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
      {publishConfirm && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setPublishConfirm(null)}
          onConfirm={() => {
            if (publishConfirm.action === 'publish') {
              publishMutation.mutate(publishConfirm.project.id);
            } else {
              unpublishMutation.mutate({ id: publishConfirm.project.id, reason: '' });
            }
            setPublishConfirm(null);
          }}
          title={
            publishConfirm.action === 'publish'
              ? t('projectsView.confirmPublishTitle')
              : t('projectsView.confirmUnpublishTitle')
          }
          message={
            publishConfirm.action === 'publish'
              ? t('projectsView.confirmPublishMessage')
              : t('projectsView.confirmUnpublishMessage')
          }
          confirmText={t('confirm')}
          icon={
            publishConfirm.action === 'publish' ? (
              <LockOpenIcon className="w-8 h-8" style={{ color: 'var(--primary-color)' }} />
            ) : (
              <LockClosedIcon className="w-8 h-8" style={{ color: 'var(--primary-color)' }} />
            )
          }
          isReasonRequired={false}
        />
      )}
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('projectsView.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {pagination ?
                t('projectsView.subtitle', { count: pagination.meta.page.total }) :
                t('projectsView.subtitle', { count: projects.length })
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}
              >
                <ViewListIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md ${viewMode === 'cards' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}
              >
                <ViewGridIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <button
              onClick={() => navigateTo('createProject')}
              className="flex items-center px-4 py-2 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <PlusIcon className="w-5 h-5 me-2" />
              {t('projectsView.createProject')}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-6 border dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <label className="text-xs text-slate-500 dark:text-slate-400">{t('search')}</label>
              <input
                type="text"
                value={searchTerm}
                placeholder={t('projectsView.searchPlaceholder')}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange();
                }}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md text-sm p-2 ps-10 mt-1"
              />
              <SearchIcon className="absolute top-8 start-3 w-5 h-5 text-slate-400" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">{t('projectsView.filterByStatus')}</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  handleFilterChange();
                }}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md text-sm p-2 mt-1"
              >
                <option value="">{t('all')}</option>
                <option value="pending">{t('status.pending')}</option>
                <option value="in_progress">{t('status.in_progress')}</option>
                <option value="completed">{t('status.completed')}</option>
                <option value="canceled">{t('status.canceled')}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">{t('projectsView.filterByType')}</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  handleFilterChange();
                }}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-md text-sm p-2 mt-1"
              >
                <option value="">{t('all')}</option>
                <option value="public">{t('projectType.public')}</option>
                <option value="standalone">{t('projectType.standalone')}</option>
                <option value="from_request">{t('projectType.from_request')}</option>
              </select>
            </div>
            <div className="flex items-end justify-end gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{t('projectsView.perPage')}:</label>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded text-sm py-1 px-2"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 dark:text-slate-400">{t('projectsView.sortBy')}:</label>
              <button
                onClick={() => toggleSort('status')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  sortBy.includes('status')
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300'
                    : 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                }`}
              >
                {t('status')}
              </button>
              <button
                onClick={() => toggleSort('creation_type')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  sortBy.includes('creation_type')
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300'
                    : 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                }`}
              >
                {t('projectsView.type')}
              </button>
              <button
                onClick={() => toggleSort('created_at')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  sortBy.includes('created_at')
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300'
                    : 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                }`}
              >
                {t('projectsView.createdAt')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 dark:text-slate-400">{t('projectsView.perPage')}:</label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded text-xs p-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="px-3 py-1 text-xs bg-red-100 border border-red-300 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-800"
            >
              {t('projectsView.resetFilters')}
            </button>
          </div> */}

          {projectsQuery.isLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6" style={{ borderBottom: '2px solid var(--primary-color)' }}></div>
              <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">{t('loading')}</span>
            </div>
          )}
        </div>

        {!projectsQuery.isLoading && (
          <>
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    educators={educators}
                    onViewDetails={() => navigateTo('projectDetail', project.id)}
                    onDelete={() => setDeleteConfirm(project)}
                    onTogglePublish={() =>
                      setPublishConfirm({ project, action: project.isPublished ? 'unpublish' : 'publish' })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 mb-6">
                <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        {t('projects')}
                      </th>
                      <th scope="col" className="px-6 py-3">
                        {t('status')}
                      </th>
                      <th scope="col" className="px-6 py-3">
                        {t('projectsView.budget')}
                      </th>
                      <th scope="col" className="px-6 py-3">
                        {t('projectsView.tasks')}
                      </th>
                      <th scope="col" className="px-6 py-3">
                        {t('modals.deadline')}
                      </th>
                      <th scope="col" className="px-6 py-3">
                        {t('action')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <ProjectRow
                        key={project.id}
                        project={project}
                        onViewDetails={() => navigateTo('projectDetail', project.id)}
                        onDelete={() => setDeleteConfirm(project)}
                        onTogglePublish={() =>
                          setPublishConfirm({ project, action: project.isPublished ? 'unpublish' : 'publish' })
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {projects.length === 0 && !projectsQuery.isLoading && (
              <div className="text-center py-20 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl mb-6">
                <h3 className="text-lg font-semibold">{t('projectsView.noProjectsTitle')}</h3>
                <p>{t('projectsView.noProjectsMessage')}</p>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.meta.page.total > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border dark:border-slate-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t('projectsView.showingResults', {
                      from: pagination.meta.page.from,
                      to: pagination.meta.page.to,
                      total: pagination.meta.page.total
                    })}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={goToPreviousPage}
                      disabled={!pagination.meta.page.isPrevious}
                      className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>

                    <div className="flex gap-2 items-center">
                      {(() => {
                        const last = pagination.meta.page.last;
                        const current = pagination.meta.page.current;
                        const pages = buildPageList(current, last, 7);
                        return pages.map((p, idx) => {
                          if (p === '...') return <div key={`dots-${idx}`} className="px-2">...</div>;
                          const page = Number(p);
                          const isActive = page === current;
                          return (
                            <button key={page} onClick={() => goToPage(page)} className={`px-3 py-2 text-sm rounded-lg ${isActive ? 'text-white' : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`} style={isActive ? { backgroundColor: 'var(--primary-color)' } : {}}>
                              {page}
                            </button>
                          );
                        });
                      })()}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={!pagination.meta.page.isNext}
                      className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ProjectsView;
