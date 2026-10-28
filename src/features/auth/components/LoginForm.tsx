import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ProjectsIcon, EnvelopeIcon, LockClosedIcon, UserCheckIcon, AcademicCapIcon } from '../../../shared/components/Icons';
import { Educator, LoginCredentials } from '../../../shared/types';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onNavigateToRegister: () => void;
  educators: Educator[];
}

interface AdminLoginFormData {
  email: string;
  password: string;
}

interface EducatorLoginFormData {
  educatorId: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onNavigateToRegister, educators }) => {
  const { t } = useLanguage();
  const { login, isLoginPending, loginError } = useAuth();
  const [role, setRole] = useState<'educator' | 'admin'>('admin');

  // Form for Admin Login
  const adminForm = useForm<AdminLoginFormData>({
    defaultValues: {
      email: 'admin@example.com',
      password: 'admin'
    }
  });

  // Form for Educator Login
  const educatorForm = useForm<EducatorLoginFormData>({
    defaultValues: {
      educatorId: educators[0]?.id || ''
    }
  });

  const handleAdminLogin = async (data: AdminLoginFormData) => {
    try {
      const loginData: LoginCredentials = {
        email: data.email,
        password: data.password
      };
      await login(loginData);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleEducatorLogin = async (data: EducatorLoginFormData) => {
    try {
      // For educator demo login, we can use a special endpoint or mock
      const loginData: LoginCredentials = {
        email: `educator-${data.educatorId}@demo.com`,
        password: 'educator-demo'
      };
      await login(loginData);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const RoleSelector = () => (
    <div className="flex w-full p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-6">
        <button
            type="button"
            onClick={() => setRole('educator')}
            className={`w-1/2 p-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors ${role === 'educator' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-md' : 'text-slate-500'}`}
        >
            <AcademicCapIcon className="w-5 h-5"/>
            {t('loginAsEducator')}
        </button>
        <button
            type="button"
            onClick={() => setRole('admin')}
            className={`w-1/2 p-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors ${role === 'admin' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-md' : 'text-slate-500'}`}
        >
            <UserCheckIcon className="w-5 h-5"/>
            {t('loginAsAdmin')}
        </button>
    </div>
  );

  const AdminLoginFields = () => {
    const { register, formState: { errors } } = adminForm;
    
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('adminEmail')}
          </label>
          <EnvelopeIcon className="absolute top-10 start-3 w-5 h-5 text-slate-400"/>
          <input 
            type="email" 
            {...register('email', {
              required: t('emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('emailInvalid')
              }
            })}
            className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-lg text-sm p-2.5 ps-10 ${
              errors.email 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-slate-300 dark:border-slate-600'
            }`}
            placeholder="admin@example.com" 
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('adminPassword')}
          </label>
          <LockClosedIcon className="absolute top-10 start-3 w-5 h-5 text-slate-400"/>
          <input 
            type="password" 
            {...register('password', {
              required: t('passwordRequired'),
              minLength: {
                value: 3,
                message: t('passwordMinLength')
              }
            })}
            className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-lg text-sm p-2.5 ps-10 ${
              errors.password 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-slate-300 dark:border-slate-600'
            }`}
            placeholder="••••••••" 
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>
    );
  };

  const EducatorLoginFields = () => {
    const { register, formState: { errors } } = educatorForm;
    
    return (
      <div className="space-y-4 animate-fade-in">
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('selectEducatorAccount')}
          </label>
          <select 
            {...register('educatorId', {
              required: t('educatorRequired')
            })}
            className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-lg text-sm p-2.5 ${
              errors.educatorId 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {educators.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} - ({e.discipline})
              </option>
            ))}
            <option value="pending-id" disabled>
              {t('pendingEducatorExample')}
            </option>
          </select>
          {errors.educatorId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.educatorId.message}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
            <div className="bg-brand-primary p-3 rounded-xl shadow-lg shadow-brand-primary/20">
                <ProjectsIcon className="h-8 w-8 text-white" />
            </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          {t('loginTitle')}
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mt-2 mb-8">
          {t('loginSubtitle')}
        </p>
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-6">
          <RoleSelector />

          {/* Error Message */}
          {loginError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {loginError.message || t('loginErrorGeneric')}
              </p>
            </div>
          )}

          {role === 'admin' ? (
            <form onSubmit={adminForm.handleSubmit(handleAdminLogin)} className="space-y-6">
              <AdminLoginFields />
              <button 
                type="submit" 
                disabled={isLoginPending}
                className="w-full py-3 px-5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoginPending ? t('loggingIn') : t('login')}
              </button>
            </form>
          ) : (
            <form onSubmit={educatorForm.handleSubmit(handleEducatorLogin)} className="space-y-6">
              <EducatorLoginFields />
              <button 
                type="submit" 
                disabled={isLoginPending}
                className="w-full py-3 px-5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoginPending ? t('loggingIn') : t('login')}
              </button>
            </form>
          )}
          
          <p className="text-sm text-center text-slate-500 dark:text-slate-400">
            {t('noAccount')}{' '}
            <button 
              type="button" 
              onClick={onNavigateToRegister} 
              className="font-semibold text-brand-primary dark:text-brand-accent hover:underline"
            >
              {t('createNewAccount')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
