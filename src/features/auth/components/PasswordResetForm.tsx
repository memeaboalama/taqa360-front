import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LockClosedIcon, CheckCircleIcon, ArrowLeftIcon, ArrowRightIcon } from '../../../shared/components/Icons';
import LanguageSwitcher from '../../../shared/components/LanguageSwitcher';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useAuth } from '../hooks/useAuth';

interface PasswordResetFormProps {
  email: string;
  verificationToken: string;
  onSuccess: () => void;
  onGoBack: () => void;
}

interface PasswordResetFormData {
  password: string;
  passwordConfirmation: string;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  email,
  verificationToken,
  onSuccess,
  onGoBack
}) => {
  const { t, language } = useLanguage();
  const { resetPassword, isResetPasswordPending, resetPasswordError } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<PasswordResetFormData>({
    defaultValues: {
      password: '',
      passwordConfirmation: ''
    }
  });

  const password = watch('password');

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      await resetPassword({
        token: verificationToken,
        email: email,
        password: data.password,
        password_confirmation: data.passwordConfirmation
      });
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  if (isSuccess) {
    return (
      <div>
        <style>{`
          :root { --primary-color: #306FAA; --light-bg-color: #F2F2F3; --dark-text-color: #333333; --primary-rgb: 48, 111, 170; }
          body { font-family: 'Cairo', sans-serif; background-color: var(--light-bg-color); color: var(--dark-text-color); }
          .register-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 20px); background: var(--light-bg-color); }
          .card { background-color: white; padding: 16px; border-radius: 12px; box-shadow: 0 12px 30px rgba(16,24,40,0.06); width: 100%; max-width: 380px; }
        `}</style>
        <div className="register-container">
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <LanguageSwitcher variant="compact" />
          </div>
          <div className="w-full max-w-md">
            <div className="card text-center p-8">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">{t('passwordReset.successTitle')}</h2>
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">{t('passwordReset.successMessage')}</p>
                <p className="text-green-600 dark:text-green-400 font-medium text-sm">{t('passwordReset.redirecting')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        :root { --primary-color: #306FAA; --primary-hover: #245C8E; --light-bg-color: #F2F2F3; --dark-text-color: #333333; --primary-rgb: 48, 111, 170; }
        body { font-family: 'Cairo', sans-serif; background-color: var(--light-bg-color); color: var(--dark-text-color); }
        .form-input { width: 100%; height: 44px; padding: 0 0.875rem; border: 1px solid #e6e6e6; border-radius: 10px; font-size: 0.95rem; outline: none; transition: all 0.18s; background-color: #fff; color: var(--dark-text-color); }
        .form-input:focus { border-color: var(--primary-color); box-shadow: 0 6px 18px rgba(var(--primary-rgb), 0.08); }
        .form-label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--dark-text-color); margin-bottom: 0.4rem; }
        .btn-primary { width: 100%; background-color: var(--primary-color); color: #fff; height: 48px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; outline: none; transition: transform 0.12s, background-color 0.2s; border: none; cursor: pointer; }
        .btn-primary:active { transform: translateY(1px); }
        .btn-primary:hover { background-color: var(--primary-hover); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .register-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 20px); background: var(--light-bg-color); }
        .card { background-color: white; padding: 16px; border-radius: 12px; box-shadow: 0 12px 30px rgba(16,24,40,0.06); width: 100%; max-width: 380px; }
        @media (min-width: 768px) { .card { padding: 20px; max-width: 440px; } .form-input { height: 48px; } .btn-primary{height:52px;} }
      `}</style>

      <div className="register-container">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <LanguageSwitcher variant="compact" />
        </div>
        <div className="w-full max-w-md">
          <div className="card">
            <div className="flex justify-center mb-4">
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-color)', padding: '10px', borderRadius: '10px', width: '44px', height: '44px' }}>
                <LockClosedIcon className="h-7 w-7 text-white" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-2">
              {t('passwordReset.title')}
            </h1>
            <p className="text-sm text-gray-600 text-center mb-6">
              {t('passwordReset.subtitle')}
            </p>
            {resetPasswordError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {resetPasswordError.message || t('passwordReset.error')}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="form-label">{t('passwordReset.newPassword')} *</label>
                <div className="relative">
                  <LockClosedIcon className="absolute top-3 end-3 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    {...register('password', {
                      required: t('passwordReset.fieldRequired') as any,
                      minLength: {
                        value: 8,
                        message: t('passwordReset.minLengthError')
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: t('passwordReset.patternError')
                      }
                    })}
                    className={`form-input pe-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder={t('passwordReset.newPassword')}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">{t('passwordReset.confirmPassword')} *</label>
                <div className="relative">
                  <LockClosedIcon className="absolute top-3 end-3 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    {...register('passwordConfirmation', {
                      required: t('passwordReset.confirmRequired') as any,
                      validate: (value) =>
                        value === password || t('passwordReset.notMatch')
                    })}
                    className={`form-input pe-10 ${errors.passwordConfirmation ? 'border-red-500' : ''}`}
                    placeholder={t('passwordReset.confirmPassword')}
                  />
                </div>
                {errors.passwordConfirmation && (
                  <p className="text-red-500 text-xs mt-1">{errors.passwordConfirmation.message}</p>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('passwordReset.passwordRequirements')}
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <li className={`${password && password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                    • {t('passwordReset.minLength')}
                  </li>
                  <li className={`${password && /[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                    • {t('passwordReset.uppercase')}
                  </li>
                  <li className={`${password && /[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                    • {t('passwordReset.lowercase')}
                  </li>
                  <li className={`${password && /\d/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                    • {t('passwordReset.number')}
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isResetPasswordPending}
                className="btn-primary"
              >
                {isResetPasswordPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('passwordReset.submitting')}
                  </div>
                ) : t('passwordReset.submit')}
              </button>

              <button
                type="button"
                onClick={onGoBack}
                disabled={isResetPasswordPending}
                className="w-full py-3 px-5 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'ar' ? <ArrowRightIcon className="w-4 h-4" /> : <ArrowLeftIcon className="w-4 h-4" />}
                {t('passwordReset.back')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetForm;