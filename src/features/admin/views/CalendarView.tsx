import React, { useState, useMemo } from 'react';
import { Project, ViewType } from '../../../shared/types';
import { ArrowLeftIcon, ArrowRightIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface CalendarViewProps {
    projects: Project[];
    navigateTo: (view: ViewType, id?: string | { projectId: string; taskId: string; } | null) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ projects, navigateTo }) => {
    const { t, language } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());

    const projectColors = [
        'bg-yellow-50 text-yellow-800 border-yellow-400',
        'bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 border-green-400',
        'bg-yellow-50 text-yellow-800 border-yellow-400',
        'bg-purple-100 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200 border-purple-400',
        'bg-pink-100 dark:bg-pink-800/50 text-pink-800 dark:text-pink-200 border-pink-400',
        'bg-amber-100 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 border-amber-400',
    ];

    const deadlines = useMemo(() => {
        const events: { date: Date, title: string, type: 'project' | 'task', id: string, projectId: string, color: string }[] = [];
        projects.forEach((project, index) => {
            const color = projectColors[index % projectColors.length];
            if (project.deadline) {
                events.push({
                    date: new Date(project.deadline),
                    title: `${t('adminCalendar.projectDeadline')}: ${project.title}`,
                    type: 'project',
                    id: project.id,
                    projectId: project.id,
                    color: color,
                });
            }
            project.tasks.forEach(task => {
                if (task.deadline) {
                    events.push({
                        date: new Date(task.deadline),
                        title: `${t('adminCalendar.taskDeadline')}: ${task.title}`,
                        type: 'task',
                        id: task.id,
                        projectId: project.id,
                        color: color,
                    });
                }
            });
        });
        return events;
    }, [projects, t]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay(); // 0 for Sunday, 1 for Monday...
    const daysInMonth = endOfMonth.getDate();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: language === 'ar' ? (startDay + 1) % 7 : startDay }, (_, i) => null);

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const getEventsForDay = (day: number) => {
        return deadlines.filter(event => 
            event.date.getFullYear() === currentDate.getFullYear() &&
            event.date.getMonth() === currentDate.getMonth() &&
            event.date.getDate() === day
        );
    }
    
    const dayNames = language === 'ar' 
        ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="animate-fade-in">
             <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminCalendar.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('adminCalendar.subtitle')}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">{language === 'ar' ? <ArrowRightIcon className="w-6 h-6"/> : <ArrowLeftIcon className="w-6 h-6"/>}</button>
                    <h2 className="text-xl font-bold">{currentDate.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">{language === 'ar' ? <ArrowLeftIcon className="w-6 h-6"/> : <ArrowRightIcon className="w-6 h-6"/>}</button>
                </div>
                <div className="grid grid-cols-7">
                    {dayNames.map(day => (
                        <div key={day} className="text-center font-semibold text-sm py-3 text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">{day}</div>
                    ))}
                    {blanks.map((_, i) => <div key={`blank-${i}`} className="border-e border-b dark:border-gray-700"></div>)}
                    {days.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                        return (
                            <div key={day} className="h-40 border-e border-b dark:border-gray-700 p-2 flex flex-col overflow-y-auto">
                                <span className={`font-bold text-xs ${isToday ? 'bg-brand-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>{day}</span>
                                <div className="mt-1 space-y-1">
                                    {dayEvents.map(event => (
                                        <div 
                                            key={event.id} 
                                            title={event.title}
                                            className={`p-1 text-[10px] rounded-md border-s-4 truncate cursor-pointer ${event.color}`}
                                            onClick={() => navigateTo(event.type === 'project' ? 'projectDetail' : 'taskDetail', event.type === 'project' ? event.id : { projectId: event.projectId, taskId: event.id })}
                                        >
                                            <p className="font-bold">{event.title}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;