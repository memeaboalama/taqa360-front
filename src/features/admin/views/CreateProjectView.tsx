import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Project, ProjectCreationType, EducationalRequest, ViewType, Attachment } from '../../../shared/types';
import { FileTextIcon, ProjectsIcon, UserCheckIcon, CheckIcon, ArrowRightIcon, TagIcon, UploadCloudIcon, XCircleIcon, ArrowLeftIcon, SearchIcon, ChevronDownIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

type AttachmentInput = { id?: string; title: string; file?: File; source: 'request' | 'new'; url?: string; status?: 'loading' | 'ready' | 'error' };

type CreateProjectPayload = {
    title: string;
    description: string;
    creationType: ProjectCreationType;
    educationalRequestId: string | null;
    requesterName?: string;
    tags: string[];
    attachments?: AttachmentInput[];
};

interface CreateProjectViewProps {
    navigateTo: (view: ViewType, id?: string) => void;
    onAddProject: (projectData: CreateProjectPayload) => void;
    educationalRequests: EducationalRequest[];
    selectedRequestId: string | null;
    searchTerm?: string;
    onSearchChange?: (v: string) => void;
    isRequestsFetching?: boolean;
    isPending?: boolean;
}

const TypeCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ icon, title, description, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 relative ${
            isSelected ? 'border-brand-primary bg-yellow-50 dark:bg-yellow-900/20 shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-brand-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
    >
        <div className="flex items-center">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-brand-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-brand-primary'}`}>
                {icon}
            </div>
            <div className="ms-4">
                <h3 className="text-md font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </div>
            {isSelected && <div className="absolute top-2 start-2 w-5 h-5 bg-brand-primary text-white rounded-full flex items-center justify-center"><CheckIcon className="w-3 h-3"/></div>}
        </div>
    </div>
);

const TagInput: React.FC<{
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ tags, setTags }) => {
    const { t } = useLanguage();
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags(prev => [...prev, newTag]);
                setInputValue('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-2 flex-wrap gap-2">
                <TagIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                {tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1 bg-yellow-50 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                            <XCircleIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('createProject.addTagPlaceholder')}
                    className="flex-grow bg-transparent outline-none p-1 text-sm"
                />
            </div>
        </div>
    );
};

const CreateProjectView: React.FC<CreateProjectViewProps> = ({ navigateTo, onAddProject, educationalRequests, selectedRequestId: initialRequestId, searchTerm = '', onSearchChange, isRequestsFetching = false, isPending = false }) => {
    const { t, language } = useLanguage();
    const [creationType, setCreationType] = useState<ProjectCreationType>(initialRequestId ? ProjectCreationType.FROM_REQUEST : ProjectCreationType.PUBLIC);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<AttachmentInput[]>([]);
    const [errors, setErrors] = useState<{ title?: string; description?: string; request?: string }>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (initialRequestId && selectedRequestId !== initialRequestId) {
            const request = educationalRequests.find(r => r.id === initialRequestId);
            if (request) {
                setTitle(request.title || '');
                setDescription(request.description || '');
                setCreationType(ProjectCreationType.FROM_REQUEST);
                setSelectedRequestId(initialRequestId);
                const suggestedTags = [request.subject, request.educationLevel].filter(Boolean) as string[];
                setTags(suggestedTags);
                const reqAtts = (request.attachments || []) as Attachment[];
                setAttachments(reqAtts.map(a => ({ id: a.id, title: a.title || a.name || '', source: 'request', url: a.url, status: a.url ? 'ready' : 'ready' })));
            }
        }
    }, [initialRequestId, educationalRequests]);

    const applyRequestSelection = (reqId: string) => {
        const request = educationalRequests.find(r => r.id === reqId);
        setSelectedRequestId(reqId);
        if (request) {
            setTitle(request.title || '');
            setDescription(request.description);
            const suggestedTags = [request.subject, request.educationLevel].filter(Boolean) as string[];
            setTags(suggestedTags);
            const reqAtts = (request.attachments || []) as Attachment[];
            setAttachments(reqAtts.map(a => ({ id: a.id, title: a.title || a.name, source: 'request', url: a.url, status: a.url ? 'loading' : 'ready' })));
        }
    };

    useRequestAttachmentsLoader(selectedRequestId, educationalRequests, setAttachments);

    const validate = (): boolean => {
        const newErrors: { title?: string; description?: string; request?: string } = {};
        if (!title.trim()) newErrors.title = t('createProject.titleRequired');
        if (!description.trim()) newErrors.description = t('createProject.descRequired');
        if (creationType === ProjectCreationType.FROM_REQUEST && !selectedRequestId) {
            newErrors.request = t('createProject.requestRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (!validate()) return;

        onAddProject({
            title,
            description,
            creationType,
            educationalRequestId: creationType === ProjectCreationType.FROM_REQUEST ? selectedRequestId : null,
            requesterName: undefined,
            tags,
            attachments
        });
    };

    const creationTypes = [
        { type: ProjectCreationType.PUBLIC, icon: <ProjectsIcon className="w-6 h-6"/>, title: t('createProject.publicTitle'), description: t('createProject.publicDesc') },
        { type: ProjectCreationType.FROM_REQUEST, icon: <UserCheckIcon className="w-6 h-6"/>, title: t('createProject.fromRequestTitle'), description: t('createProject.fromRequestDesc') },
        { type: ProjectCreationType.STANDALONE, icon: <FileTextIcon className="w-6 h-6"/>, title: t('createProject.standaloneTitle'), description: t('createProject.standaloneDesc') },
    ];

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <button onClick={() => navigateTo('projects')} className="flex items-center text-sm text-brand-primary dark:text-yellow-500 hover:underline mb-2">
                    {language === 'ar' ? <ArrowRightIcon className="w-4 h-4 ms-1" /> : <ArrowLeftIcon className="w-4 h-4 me-1" />}
                    {t('createProject.backToProjects')}
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('createProject.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('createProject.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/3 bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700 p-6 lg:p-8 space-y-6">
                        <div>
                            <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                {t('createProject.projectTitleLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input type="text" id="title" value={title} onChange={e => { setTitle(e.target.value); if (submitted) validate(); }} className={`bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600`} placeholder={t('createProject.projectTitleLabel')} />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                {t('createProject.projectDescLabel')} <span className="text-red-500">*</span>
                            </label>
                            <textarea id="description" rows={8} value={description} onChange={e => { setDescription(e.target.value); if (submitted) validate(); }} className={`bg-gray-50 border ${errors.description ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600`} placeholder={t('createProject.projectDescLabel')}></textarea>
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('createProject.attachments')}</label>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700/50 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloudIcon className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">{t('createProject.clickToUpload')}</span></p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('createProject.fileTypes')}</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" multiple onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setAttachments(prev => ([...prev, ...files.map(f => ({ title: f.name, file: f, source: 'new' as const }))]));
                                        e.currentTarget.value = '';
                                    }} />
                                </label>
                            </div>
                            {attachments.length > 0 && (
                                <ul className="mt-3 space-y-2">
                                    {attachments.map((a, idx) => (
                                        <li key={(a.id || '') + '-' + idx} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-gray-600 rounded-md p-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <input type="text" value={a.title} onChange={e => setAttachments(prev => {
                                                const next = [...prev];
                                                next[idx] = { ...(next[idx] || {}), title: e.target.value };
                                                return next;
                                            })} className="text-sm bg-transparent border border-transparent focus:border-gray-300 rounded px-1 py-0.5 w-full" />
                                                {a.status === 'loading' && <span className="text-xs text-gray-400">جاري التحضير...</span>}
                                                {a.status === 'error' && <span className="text-xs text-red-500">تعذر التحميل</span>}
                                                {a.url && <a href={a.url} target="_blank" rel="noreferrer" className="text-xs hover:underline ms-2" style={{ color: 'var(--primary-color)' }}>عرض</a>}
                                            </div>
                                            <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-gray-500 hover:text-red-600">
                                                <XCircleIcon className="w-5 h-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700 p-6">
                            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('createProject.projectType')}</h3>
                            <div className="space-y-3">
                                {creationTypes.map(item => (
                                    <TypeCard
                                        key={item.type}
                                        icon={item.icon}
                                        title={item.title}
                                        description={item.description}
                                        isSelected={creationType === item.type}
                                        onClick={() => setCreationType(item.type)}
                                    />
                                ))}
                            </div>
                        </div>

                        {creationType === ProjectCreationType.FROM_REQUEST && (
                             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700 p-6 animate-fade-in">
                                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('createProject.selectRequest')} <span className="text-red-500">*</span></h3>
                                <RequestDropdown
                                    options={educationalRequests}
                                    value={selectedRequestId}
                                    onChange={(id) => { setSelectedRequestId(id); if (submitted) validate(); }}
                                    searchTerm={searchTerm}
                                    onSearchChange={onSearchChange}
                                    isLoading={isRequestsFetching}
                                    isOpenControlled
                                />
                                {errors.request && <p className="text-red-500 text-xs mt-1">{errors.request}</p>}
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700 p-6">
                             <TagInput tags={tags} setTags={setTags} />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-4">
                    <button type="button" onClick={() => navigateTo('projects')} disabled={isPending} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        {t('createProject.cancel')}
                    </button>
                    <button type="submit" disabled={isPending} className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 shadow-md focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2"></div>}
                        {t('createProject.createAndSetup')} {language === 'ar' ? <ArrowLeftIcon className="w-5 h-5 me-1" /> : <ArrowRightIcon className="w-5 h-5 ms-2" />}
                    </button>
                </div>
            </form>
        </div>
    );
};

const RequestDropdown: React.FC<{
    options: EducationalRequest[];
    value: string | null;
    onChange: (id: string) => void;
    searchTerm?: string;
    onSearchChange?: (v: string) => void;
    isLoading?: boolean;
}> = ({ options, value, onChange, searchTerm = '', onSearchChange, isLoading = false }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [localQuery, setLocalQuery] = useState(searchTerm);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setLocalQuery(searchTerm || ''); }, [searchTerm]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (onSearchChange) onSearchChange(localQuery);
    }, [localQuery, onSearchChange]);

    const selected = value ? options.find(o => o.id === value) : null;
    const filtered = useMemo(() => {
        const q = localQuery.trim().toLowerCase();
        if (!q) return options;
        return options.filter(o => o.title.toLowerCase().includes(q));
    }, [options, localQuery]);

    return (
        <div className="relative" ref={containerRef}>
            <button type="button" className="flex items-center justify-between w-full p-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-right focus:ring-2 focus:ring-brand-primary" onClick={() => setIsOpen(o => !o)}>
                <span className="text-gray-900 dark:text-white truncate">{selected ? selected.title : t('createProject.selectRequestPlaceholder')}</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border dark:border-gray-700 animate-fade-in-up">
                    <div className="p-2 relative">
                        <input
                            autoFocus
                            type="text"
                            value={localQuery}
                            onChange={e => setLocalQuery(e.target.value)}
                            placeholder={t('createProject.addTagPlaceholder')}
                            className="w-full p-2 text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 ps-9"
                        />
                        <SearchIcon className="absolute top-4 start-4 w-5 h-5 text-gray-400" />
                    </div>
                    <ul role="listbox" className="max-h-56 overflow-y-auto">
                        {isLoading && <li className="p-3 text-sm text-gray-500">جارِ التحميل...</li>}
                        {filtered.map(opt => (
                            <li key={opt.id} className="p-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => { onChange(opt.id); setIsOpen(false); }}>
                                <div className="font-medium truncate">{opt.title}</div>
                                {opt.code && <div className="text-xs text-gray-500">{opt.code}</div>}
                            </li>
                        ))}
                        {!isLoading && filtered.length === 0 && (
                            <li className="p-3 text-sm text-gray-500">لا توجد نتائج</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

const useRequestAttachmentsLoader = (
    selectedRequestId: string | null,
    educationalRequests: EducationalRequest[],
    setAttachments: React.Dispatch<React.SetStateAction<AttachmentInput[]>>
) => {
    useEffect(() => {
        if (!selectedRequestId) return;
        const req = educationalRequests.find(r => r.id === selectedRequestId);
        const items = (req?.attachments || []) as Attachment[];
        const mapped = items.map((att) => ({ id: att.id, title: att.title || att.name || '', source: 'request', url: att.url, status: att.url ? 'ready' : 'ready' }));
        setAttachments(mapped);
    }, [selectedRequestId, educationalRequests, setAttachments]);
};

export default CreateProjectView;