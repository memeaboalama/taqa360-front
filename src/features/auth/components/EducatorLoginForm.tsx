import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EnvelopeIcon, LockClosedIcon } from '../../../shared/components/Icons';
import BrandLogo from '../../../shared/components/BrandLogo';
import LanguageSwitcher from '../../../shared/components/LanguageSwitcher';
import { LoginCredentials } from '../../../shared/types';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useEducatorAuth } from '../hooks/useEducatorAuth';
import { useFormPersistence } from '../../../shared/hooks/useFormPersistence';

interface EducatorLoginFormProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onSwitchToAdmin: () => void;
  onBackToLanding?: () => void;
}

interface EducatorLoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const EducatorLoginForm: React.FC<EducatorLoginFormProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onSwitchToAdmin,
  onBackToLanding
}) => {
  const { t, language } = useLanguage();
  const { login, isLoginPending, loginError } = useEducatorAuth();

  const form = useForm<EducatorLoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });
  const { register, handleSubmit, formState: { errors } } = form;
  useFormPersistence('educator-login', form);

  const onSubmit = async (data: EducatorLoginFormData) => {
    try {
      const loginData: LoginCredentials = {
        email: data.email,
        password: data.password
      };
      await login(loginData);
    } catch (error) {
      console.error('Educator login failed:', error);
    }
  };

  return (
    <div>
      <style>{`
        body { font-family: 'Cairo', sans-serif; background-color: var(--light-bg-color); color: var(--dark-text-color); }

        /* Mobile-first Flutter-like sizing */
        .form-input { width: 100%; height: 44px; padding: 0 0.875rem; border: 1px solid #e6e6e6; border-radius: 10px; font-size: 0.95rem; outline: none; transition: all 0.18s; background-color: #fff; color: var(--dark-text-color); }
        .form-input:focus { border-color: var(--primary-color); box-shadow: 0 6px 18px rgba(var(--primary-rgb), 0.08); }
        .form-label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--dark-text-color); margin-bottom: 0.5rem; }
        .btn-primary { width: 100%; background-color: var(--primary-color); color: #fff; height: 48px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; outline: none; transition: transform 0.12s, background-color 0.2s; border: none; cursor: pointer; }
        .btn-primary:active { transform: translateY(1px); }
        .btn-primary:hover { background-color: var(--primary-hover); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .register-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 20px); background: var(--light-bg-color); }
        .card { background-color: white; padding: 16px; border-radius: 12px; box-shadow: 0 12px 30px rgba(16,24,40,0.06); width: 100%; max-width: 380px; }

        .form-error { margin-bottom: 0.75rem; padding: 0.6rem 0.75rem; background: #fff4f4; border-radius: 12px; color: #b91c1c; font-size: 0.9rem; }
        .login-icon-badge { display: inline-flex; align-items:center; justify-content:center; background: var(--primary-color); padding: 10px; border-radius: 12px; width:48px; height:48px; }

        .small-link { font-size: 0.9rem; color: var(--primary-color); }

        @media (min-width: 768px) {
          .card { padding: 20px; max-width: 440px; }
          .form-input { height: 48px; }
          .btn-primary { height: 52px; }
        }
      `}</style>

      <div className="register-container">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <LanguageSwitcher variant="compact" />
        </div>
        <div className="card">
          <div className="text-center mb-4">
            <BrandLogo className="h-20 w-auto mx-auto" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-6">{language === 'ar' ? 'مهام وإدارة المتخصصين' : 'Tasks and Manage Specialists'}</h2>

          {loginError && (
            <div className="form-error">{loginError.message || 'فشل في تسجيل الدخول'}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="form-label">{t('expertEmail')} *</label>
              <input
                type="email"
                {...register('email', {
                  required: t('modals.fieldRequired') as any,
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('toasts.cannotAddDuplicate') as any }
                })}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder={t('expertEmail')}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{(errors.email as any).message}</p>}
            </div>

            <div>
              <label className="form-label">{t('expertPassword')} *</label>
              <input
                type="password"
                {...register('password', { required: t('modals.fieldRequired') as any, minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                placeholder={t('expertPassword')}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{(errors.password as any).message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3">
                <input type="checkbox" {...register('rememberMe')} className="h-4 w-4 mr-1" />
                <span className="text-sm">{language === 'ar' ? 'تذكرني' : 'Remember me'}</span>
              </label>

              <button type="button" onClick={onNavigateToForgotPassword} className="small-link hover:underline">{language === 'ar' ? 'نسيت كلمة المرور' : 'Forgot password?'}</button>
            </div>

            <button type="submit" disabled={isLoginPending} className="btn-primary">
              {isLoginPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('login')}...
                </div>
              ) : t('login')}
            </button>

            <div className="text-center mt-2">
              <p className="text-sm">{t('noAccount')} <button type="button" onClick={onNavigateToRegister} className="small-link font-medium">{t('createNewAccount')}</button></p>
            </div>

            {onBackToLanding && (
              <div className="text-center mt-2">
                <button type="button" onClick={onBackToLanding} className="text-sm text-gray-600 hover:underline">← {t('back')}</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EducatorLoginForm;
