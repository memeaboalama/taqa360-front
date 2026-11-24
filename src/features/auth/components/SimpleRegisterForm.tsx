import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import BrandLogo from '../../../shared/components/BrandLogo';
import LanguageSwitcher from '../../../shared/components/LanguageSwitcher';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useEducatorAuth } from '../hooks/useEducatorAuth';
import { AdminService } from '../../admin/services/AdminService';
import { apiClient } from '../../../core/api/client';
import { API_BASE_URL } from '../../../core/api/config';

interface SimpleRegisterFormProps {
  onNavigateToLogin: () => void;
  onNavigateToEmailVerification: (email: string) => void;
}

interface SimpleRegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  agreeToTerms: boolean;
}

interface InvitationFormData {
  name: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
}

interface FooterLegalLinksResponse {
  terms_url: string | null;
  privacy_url: string | null;
}

function resolveFooterLegalUrl(value: unknown, language: 'ar' | 'en'): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;

  const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const url = new URL(value, baseUrl);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Footer legal links must use HTTP or HTTPS.');
  }

  const platformOrigin = new URL(baseUrl).origin;
  const hasLocalePrefix = /^\/(?:ar|en)(?:\/|$)/.test(url.pathname);

  if (url.origin === platformOrigin && !hasLocalePrefix) {
    url.pathname = `/${language}${url.pathname === '/' ? '/' : url.pathname}`;
  }

  return url.toString();
}

const SimpleRegisterForm: React.FC<SimpleRegisterFormProps> = ({ 
  onNavigateToLogin,
  onNavigateToEmailVerification 
}) => {
  const { t, language } = useLanguage();
  const { register: registerUser, isRegisterPending, registerError } = useEducatorAuth();
  const [footerLegalLinks, setFooterLegalLinks] = useState<{ termsUrl: string | null; privacyUrl: string | null }>({
    termsUrl: null,
    privacyUrl: null,
  });
  const [areFooterLegalLinksLoading, setAreFooterLegalLinksLoading] = useState(true);
  const [footerLegalLinksError, setFooterLegalLinksError] = useState<string | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setFooterLegalLinks({ termsUrl: null, privacyUrl: null });
    setAreFooterLegalLinksLoading(true);
    setFooterLegalLinksError(null);

    const loadFooterLegalLinks = async () => {
      try {
        const response = await apiClient.get<FooterLegalLinksResponse>('/ecommerce/footer-legal-links');
        const links = response.data?.data;
        const termsUrl = resolveFooterLegalUrl(links?.terms_url, language);
        const privacyUrl = resolveFooterLegalUrl(links?.privacy_url, language);

        if (!response.data?.status || !termsUrl || !privacyUrl) {
          throw new Error(response.data?.message || 'Footer legal links are not configured.');
        }

        if (isMounted) {
          setFooterLegalLinks({ termsUrl, privacyUrl });
          setFooterLegalLinksError(null);
        }
      } catch (error) {
        console.error('Failed to load footer legal links from site footer settings', error);
        if (isMounted) {
          setFooterLegalLinksError(language === 'ar'
            ? 'تعذر تحميل روابط الشروط والخصوصية من إعدادات فوتر الموقع.'
            : 'Could not load the terms and privacy links from the site footer settings.');
        }
      } finally {
        if (isMounted) setAreFooterLegalLinksLoading(false);
      }
    };

    void loadFooterLegalLinks();

    return () => {
      isMounted = false;
    };
  }, [language]);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<SimpleRegistrationFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      agreeToTerms: false
    }
  });

  const password = watch('password');

  const onSubmit = async (data: SimpleRegistrationFormData) => {
    if (token) return; // Should use invitation form
    try {
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
        agree_terms: data.agreeToTerms,
        platform: 'web',
        device_token: null
      };

      await registerUser(payload as any);
      onNavigateToEmailVerification(data.email);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleInviteSubmit = async (data: InvitationFormData) => {
    if (!token) return;
    setIsCompleting(true);
    setCompleteError(null);
    try {
      await AdminService.completeRegistration({
        token,
        name: data.name,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
      });
      window.history.replaceState({}, '', window.location.pathname);
      onNavigateToLogin();
    } catch (err: any) {
      setCompleteError(err?.message || (language === 'ar' ? 'فشل إكمال التسجيل' : 'Failed to complete registration'));
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div>
      <style>{`
        body { font-family: 'Cairo', sans-serif; background-color: var(--light-bg-color); color: var(--dark-text-color); }
        .form-input { width: 100%; height: 44px; padding: 0 0.875rem; border: 1px solid #e6e6e6; border-radius: 10px; font-size: 0.95rem; outline: none; transition: all 0.18s; background-color: #fff; color: var(--dark-text-color); }
        .form-input:focus { border-color: var(--primary-color); box-shadow: 0 6px 18px rgba(var(--primary-rgb), 0.08); }
        .form-label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--dark-text-color); margin-bottom: 0.5rem; }
        .btn-primary { width: 100%; background-color: var(--primary-color); color: #fff; height: 48px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; outline: none; transition: transform 0.12s, background-color 0.2s; border: none; cursor: pointer; }
        .btn-primary:active { transform: translateY(1px); }
        .btn-primary:hover { background-color: var(--primary-hover); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .legal-link { color: var(--primary-color); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
        .legal-link:hover { color: var(--primary-hover); }
        .register-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 20px); background: var(--light-bg-color); }
        .card { background-color: white; padding: 16px; border-radius: 12px; box-shadow: 0 12px 30px rgba(16,24,40,0.06); width: 100%; max-width: 380px; }
        @media (min-width: 768px) { .card { padding: 20px; max-width: 440px; } .form-input { height: 48px; } .btn-primary{height:52px;} }
      `}</style>

      <div className="register-container">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <LanguageSwitcher variant="compact" />
        </div>
        <div className="card">
          <div className="text-center mb-4">
            <BrandLogo className="h-20 w-auto mx-auto" />
          </div>

          {token ? (
            <>
              <h2 className="text-3xl font-bold text-center">{language === 'ar' ? 'إكمال التسجيل' : 'Complete Registration'}</h2>
              <p className="text-gray-600 text-center mb-4">{language === 'ar' ? 'قم بإنشاء حسابك لإكمال عملية التسجيل' : 'Create your account to complete registration'}</p>

              {completeError && (
                <div style={{marginBottom: 12, padding: 12, background: '#ffecec', borderRadius: 8}}>{completeError}</div>
              )}

              <form onSubmit={handleSubmit(handleInviteSubmit)} className="space-y-3">
                <div>
                  <label className="form-label">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                  <input type="text" {...register('name' as any, { required: language === 'ar' ? 'الاسم مطلوب' : 'Name is required' })} className="form-input" placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'} />
                </div>
                <div>
                  <label className="form-label">{language === 'ar' ? 'رقم الجوال' : 'Phone Number'}</label>
                  <input type="tel" {...register('phone' as any, { required: language === 'ar' ? 'رقم الجوال مطلوب' : 'Phone is required' })} className="form-input" placeholder="05xxxxxxxx" />
                </div>
                <div>
                  <label className="form-label">{t('adminPassword')}</label>
                  <input type="password" {...register('password' as any, { required: language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required' })} className="form-input" placeholder={t('adminPassword')} />
                </div>
                <div>
                  <label className="form-label">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                  <input type="password" {...register('passwordConfirmation' as any, {
                    required: language === 'ar' ? 'تأكيد كلمة المرور مطلوب' : 'Password confirmation is required',
                    validate: (value: string) => value === watch('password') || (language === 'ar' ? 'كلمة المرور غير متطابقة' : 'Passwords do not match')
                  })} className="form-input" placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} />
                </div>
                <button type="submit" disabled={isCompleting} className="btn-primary">
                  {isCompleting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {language === 'ar' ? 'جاري الإكمال...' : 'Completing...'}
                    </div>
                  ) : (language === 'ar' ? 'إكمال التسجيل' : 'Complete Registration')}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center">{language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}</h2>
              <p className="text-gray-600 text-center mb-4">{t('register.subtitle')}</p>

              {registerError && (
                <div style={{marginBottom: 12, padding: 12, background: '#ffecec', borderRadius: 8}}>{registerError.message || (language === 'ar' ? 'فشل في إنشاء الحساب' : 'Failed to create account')}</div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">{language === 'ar' ? 'الاسم الأول' : 'First Name'}</label>
                    <input type="text" {...register('firstName', { required: language === 'ar' ? 'الاسم الأول مطلوب' : 'First name is required' })} className="form-input" placeholder={language === 'ar' ? 'الاسم الأول' : 'First Name'} />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">{language === 'ar' ? 'الاسم الأخير' : 'Last Name'}</label>
                    <input type="text" {...register('lastName', { required: language === 'ar' ? 'الاسم الأخير مطلوب' : 'Last name is required' })} className="form-input" placeholder={language === 'ar' ? 'الاسم الأخير' : 'Last Name'} />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="form-label">{t('email')}</label>
                  <input type="email" {...register('email', { required: language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required' })} className="form-input" placeholder={t('email')} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="form-label">{t('adminPassword')}</label>
                  <input type="password" {...register('password', { required: language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required' })} className="form-input" placeholder={t('adminPassword')} />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="form-label">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                  <input type="password" {...register('passwordConfirmation', {
                    required: language === 'ar' ? 'تأكيد كلمة المرور مطلوب' : 'Password confirmation is required',
                    validate: (value: string) => value === watch('password') || (language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
                  })} className="form-input" placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} />
                  {errors.passwordConfirmation && <p className="text-red-500 text-xs mt-1">{errors.passwordConfirmation.message}</p>}
                </div>

                <div>
                  {footerLegalLinksError && (
                    <p role="alert" className="text-red-500 text-xs mb-2">{footerLegalLinksError}</p>
                  )}
                  <label className="flex items-center gap-3">
                    <input type="checkbox" {...register('agreeToTerms', { required: language === 'ar' ? 'يجب الموافقة على الشروط والأحكام وسياسة الخصوصية' : 'You must agree to the terms and conditions and privacy policy' })} className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {language === 'ar' ? 'أوافق على ' : 'I agree to '}
                      {footerLegalLinks.termsUrl ? (
                        <a className="legal-link" href={footerLegalLinks.termsUrl} target="_blank" rel="noopener noreferrer">{language === 'ar' ? 'الشروط والأحكام' : 'terms and conditions'}</a>
                      ) : (
                        <span>{language === 'ar' ? 'الشروط والأحكام' : 'terms and conditions'}</span>
                      )}
                      {language === 'ar' ? ' و' : ' and '}
                      {footerLegalLinks.privacyUrl ? (
                        <a className="legal-link" href={footerLegalLinks.privacyUrl} target="_blank" rel="noopener noreferrer">{language === 'ar' ? 'سياسة الخصوصية' : 'privacy policy'}</a>
                      ) : (
                        <span>{language === 'ar' ? 'سياسة الخصوصية' : 'privacy policy'}</span>
                      )}
                    </span>
                  </label>
                  {errors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isRegisterPending || areFooterLegalLinksLoading || !footerLegalLinks.termsUrl || !footerLegalLinks.privacyUrl}
                  className="btn-primary"
                >
                  {isRegisterPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}
                    </div>
                  ) : (language === 'ar' ? 'إنشاء الحساب' : 'Create Account')}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-sm">{language === 'ar' ? 'لديك حساب بالفعل' : 'Already have an account?'} <button type="button" onClick={onNavigateToLogin} className="font-medium" style={{ color: 'var(--primary-color)' }}>{t('login')}</button></p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleRegisterForm;
