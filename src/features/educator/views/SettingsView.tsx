import React from 'react';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useTheme } from '../../../app/providers/ThemeProvider';

const SettingsView: React.FC = () => {
    const { t } = useLanguage();
    const { theme, setTheme, toggleTheme } = useTheme();
    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('settings')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{t('settings.educatorSubtitle')}</p>

            <div className="mt-6 grid gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">المظهر</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">الوضع الداكن</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">الوضع الافتراضي فاتح دائماً، يمكنك التبديل هنا.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setTheme('light')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${theme === 'light' ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>فاتح</button>
                            <button onClick={() => setTheme('dark')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${theme === 'dark' ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>داكن</button>
                            <button onClick={toggleTheme} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-200/70 dark:bg-slate-700 dark:text-slate-200">تبديل</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
