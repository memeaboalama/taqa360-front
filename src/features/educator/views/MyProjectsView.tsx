
import React, { useState, useMemo } from 'react';
import { EducatorViewType, Project, Task, Assignment, AssignmentStatus, ProjectStatus, AssignmentType } from '../../../shared/types';
import { BriefcaseIcon, CheckCircleIcon, ClockIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface MyProjectsViewProps {
    navigateTo: (view: EducatorViewType, data: { projectId: string, taskId: string }) => void;
    projects: Project[];
    educatorId: string;
}

type ProjectTab = 'active' | 'completed';

const getAssignmentTypeBadge = (type: AssignmentType, t: (key: string) => string) => {
    switch(type) {
        case AssignmentType.INVITATION: return <span className="text-[10px] font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 px-1.5 py-0.5 rounded">{t('assignmentType.INVITATION')}</span>;
        case AssignmentType.DIRECT: return <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900 px-1.5 py-0.5 rounded">{t('assignmentType.DIRECT')}</span>;
        case AssignmentType.FROM_BID: return <span className="text-[10px] font-semibold text-yellow-800 bg-yellow-50 px-1.5 py-0.5 rounded">{t('assignmentType.FROM_BID')}</span>;
        default: return null;
    }
}

interface ProjectCardProps {
    project: Project;
    tasks: Task[];
    navigateTo: MyProjectsViewProps['navigateTo'];
    educatorId: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, tasks, navigateTo, educatorId }) => {
    const { t } = useLanguage();
    const completedTasksCount = tasks.filter(t => t.status === ProjectStatus.COMPLETED).length;
    const progress = tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0;
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-md sm:text-lg text-slate-900 dark:text-white">{project.title}</h3>
            <div className="my-3">
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <span>{t('myProjects.progress')}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${project.status === ProjectStatus.COMPLETED ? 'bg-green-500' : 'bg-brand-primary'}`} style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                 <h4 className="text-sm font-semibold mb-2 text-slate-600 dark:text-slate-300">{t('myProjects.yourTasks')}:</h4>
                 {tasks.map(task => {
                    const assignment = task.assignments.find(a => a.educatorId === educatorId);
                    return (
                         <button key={task.id} onClick={() => navigateTo('taskDetail', { projectId: project.id, taskId: task.id })} className="w-full text-right flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                            <div className="flex items-center gap-2">
                                {assignment && getAssignmentTypeBadge(assignment.type, t)}
                                <span className="text-sm text-slate-800 dark:text-slate-200">{task.title}</span>
                            </div>
                            {task.status === ProjectStatus.COMPLETED ? <CheckCircleIcon className="w-5 h-5 text-green-500"/> : <ClockIcon className="w-5 h-5 text-yellow-500"/>}
                         </button>
                    );
                 })}
            </div>
        </div>
    );
}

const MyProjectsView: React.FC<MyProjectsViewProps> = ({ navigateTo, projects, educatorId }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<ProjectTab>('active');

    const educatorProjects = useMemo(() => {
        const projectMap = new Map<string, { project: Project, tasks: Task[] }>();

        projects.forEach(p => {
            const assignedTasks = p.tasks.filter(t => t.assignments.some(a => a.educatorId === educatorId && a.status === AssignmentStatus.ACCEPTED));
            if (assignedTasks.length > 0) {
                projectMap.set(p.id, { project: p, tasks: assignedTasks });
            }
        });

        const allProjects = Array.from(projectMap.values());
        
        return {
            active: allProjects.filter(p => p.project.status === ProjectStatus.IN_PROGRESS),
            completed: allProjects.filter(p => p.project.status === ProjectStatus.COMPLETED),
        };
    }, [projects, educatorId]);

    const displayedProjects = educatorProjects[activeTab];

    return (
        <div className="animate-fade-in space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('myProjects')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('myProjects.subtitle')}</p>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex space-x-4 rtl:space-x-reverse -mb-px" aria-label="Tabs">
                    <button onClick={() => setActiveTab('active')} className={`flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'active' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}><ClockIcon className="w-5 h-5"/>{t('myProjects.active')} ({educatorProjects.active.length})</button>
                    <button onClick={() => setActiveTab('completed')} className={`flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'completed' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}><CheckCircleIcon className="w-5 h-5"/>{t('myProjects.completed')} ({educatorProjects.completed.length})</button>
                </nav>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProjects.map(({ project, tasks }) => (
                    <ProjectCard key={project.id} project={project} tasks={tasks} navigateTo={navigateTo} educatorId={educatorId} />
                ))}
            </div>

            {displayedProjects.length === 0 && (
                 <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                     <BriefcaseIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600" />
                     <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">{t('myProjects.noProjectsTitle')}</h3>
                     <p className="mt-1 text-sm text-slate-500">{t('myProjects.noProjectsMessage')}</p>
                 </div>
            )}
        </div>
    );
};

export default MyProjectsView;
