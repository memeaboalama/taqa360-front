import React from 'react';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { UserCheckIcon, AcademicCapIcon, ProjectsIcon, ArrowRightIcon } from '../../../shared/components/Icons';
import LanguageSwitcher from '../../../shared/components/LanguageSwitcher';

interface AuthLandingPageProps {
  onNavigateToAdmin: () => void;
  onNavigateToEducator: () => void;
}

const AuthLandingPage: React.FC<AuthLandingPageProps> = ({ onNavigateToAdmin, onNavigateToEducator }) => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher variant="compact" />
      </div>
      {/* Hero */}
      <header className="px-4 pt-16 pb-8 sm:pt-20 sm:pb-12 max-w-6xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-brand-primary/15 border border-brand-primary/30 shadow-glow-primary">
            <ProjectsIcon className="h-12 w-12 text-brand-primary" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-dark">
          {t('brandName')}
        </h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto">
          {language === 'ar' ? 'اختر نوع حسابك لبدء تجربة احترافية' : 'Choose your account type to get started'}
        </p>
      </header>

      {/* Cards */}
      <main className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Admin Card */}
          <article
            onClick={onNavigateToAdmin}
            className="group cursor-pointer rounded-2xl border border-brand-light bg-white shadow-xl hover:shadow-2xl hover:border-brand-primary transition-all duration-300"
          >
            <div className="p-6 sm:p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-xl bg-brand-primary/15 border border-brand-primary/30 group-hover:border-brand-primary/50 transition-colors">
                  <UserCheckIcon className="h-10 w-10 text-brand-dark" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-brand-dark text-center mb-2">
                {language === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
              </h2>
              <p className="text-center text-slate-600 mb-6">
                {language === 'ar' ? 'إدارة المنصة، الخبراء، والمشاريع' : 'Manage the platform, experts, and projects'}
              </p>
              <ul className="space-y-2 mb-8 text-sm">
                <li className="flex items-center text-slate-700"><span className="w-2 h-2 rounded-full bg-brand-primary ms-3"></span>{language === 'ar' ? 'إدارة الخبراء والمراجعات' : 'Manage experts and reviews'}</li>
                <li className="flex items-center text-slate-700"><span className="w-2 h-2 rounded-full bg-brand-primary ms-3"></span>{language === 'ar' ? 'مراقبة المشاريع والمهام' : 'Monitor projects and tasks'}</li>
                <li className="flex items-center text-slate-700"><span className="w-2 h-2 rounded-full bg-brand-primary ms-3"></span>{language === 'ar' ? 'إحصائيات شاملة للمنصة' : 'Comprehensive platform statistics'}</li>
              </ul>
              <button className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-brand-primary text-white hover:shadow-glow-primary">
                {language === 'ar' ? 'دخول الإدارة' : 'Admin Login'}
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </article>

          {/* Expert Card */}
          <article
            onClick={onNavigateToEducator}
            className="group cursor-pointer rounded-2xl border border-brand-light bg-white shadow-xl hover:shadow-2xl hover:border-brand-primary transition-all duration-300"
          >
            <div className="p-6 sm:p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-xl bg-brand-primary/15 border border-brand-primary/30 group-hover:border-brand-primary/50 transition-colors">
                  <AcademicCapIcon className="h-10 w-10 text-brand-dark" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-brand-dark text-center mb-2">
                {language === 'ar' ? 'منطقة الخبراء' : 'Experts Area'}
              </h2>
              <p className="text-center text-slate-600 mb-6">
                {language === 'ar' ? 'تقديم الخدمات والمشاركة في المشاريع' : 'Provide services and participate in projects'}
              </p>
              <ul className="space-y-2 mb-8 text-sm">
                <li className="flex items-center text-slate-700"><span className="w-2 h-2 rounded-full bg-brand-primary ms-3"></span>{language === 'ar' ? 'استعراض الفرص المتاحة' : 'Browse available opportunities'}</li>
                <li className="flex items-center text-slate-700"><span className="w-2 h-2 rounded-full bg-brand-primary ms-3"></span>{language === 'ar' ? 'تقديم العروض والمشاركة' : 'Submit proposals and participate'}</li>
                <li className="flex items-center text-slate-700"><span className="w-2 h-2 rounded-full bg-brand-primary ms-3"></span>{language === 'ar' ? 'إدارة الأرباح والسحوبات' : 'Manage earnings and withdrawals'}</li>
              </ul>
              <button className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-brand-primary text-white hover:shadow-glow-primary">
                {language === 'ar' ? 'دخول الخبراء' : 'Expert Login'}
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </article>
        </div>

        {/* Footer Note */}
        <p className="mt-10 text-center text-slate-600 text-sm">جديد على المنصة؟ ابدأ كمتخصص وانضم إلى مجتمعنا التعليمي</p>
      </main>
    </div>
  );
};

export default AuthLandingPage;
