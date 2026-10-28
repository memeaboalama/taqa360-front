import React, { useState, useEffect, useRef } from 'react';
import { EnvelopeIcon, ArrowLeftIcon, ArrowRightIcon } from '../../../shared/components/Icons';
import LanguageSwitcher from '../../../shared/components/LanguageSwitcher';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../../../app/providers/DataProvider';

interface ForgotPasswordVerificationFormProps {
  email: string;
  onVerificationSuccess: (token: string) => void;
  onGoBack: () => void;
  onResendCode: () => Promise<void>;
}

const ForgotPasswordVerificationForm: React.FC<ForgotPasswordVerificationFormProps> = ({
  email,
  onVerificationSuccess,
  onGoBack,
  onResendCode
}) => {
  const { t, language } = useLanguage();
  const { verifyResetCode, isVerifyResetCodePending, verifyResetCodeError } = useAuth();
  const { addToast } = useData();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit.length > 0)) {
      handleVerification(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setCode(newCode);
      if (pastedData.length === 6) {
        handleVerification(pastedData);
      }
    }
  };

  const handleVerification = async (verificationCode: string) => {
    if (verificationCode.length !== 6) {
      setError(t('verification.codeError'));
      return;
    }

    setError(null);

    try {
      const result = await verifyResetCode(email, verificationCode);
      // The service returns {message, token} directly from response.data
      const resetToken = (result as any)?.token || (result as any)?.data?.token || `reset_${Date.now()}`;
      onVerificationSuccess(resetToken);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || t('verification.verifyError');
      setError(message);
      addToast(message, 'error');
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError(null);

    try {
      await onResendCode();
      setResendTimer(120);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError(t('verification.resendError'));
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <style>{`
        :root { --primary-color: #306FAA; --primary-hover: #245C8E; --light-bg-color: #F2F2F3; --dark-text-color: #333333; --primary-rgb: 48, 111, 170; }
        body { font-family: 'Cairo', sans-serif; background-color: var(--light-bg-color); color: var(--dark-text-color); }
        .register-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 20px); background: var(--light-bg-color); }
        .card { background-color: white; padding: 16px; border-radius: 12px; box-shadow: 0 12px 30px rgba(16,24,40,0.06); width: 100%; max-width: 380px; }
        @media (min-width: 768px) { .card { padding: 20px; max-width: 440px; } }
      `}</style>

      <div className="register-container">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <LanguageSwitcher variant="compact" />
        </div>
        <div className="w-full max-w-md">
          <div className="card">
            <div className="flex justify-center mb-4">
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-color)', padding: '10px', borderRadius: '10px', width: '44px', height: '44px' }}>
                <EnvelopeIcon className="h-7 w-7 text-white" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-2">
              {t('verification.title')}
            </h1>
            <p className="text-sm text-gray-600 text-center mb-6">
              {t('verification.subtitle')}<br />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
            </p>
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block mb-4 text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                {t('verification.codeLabel')}
              </label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none"
                    style={{ '--tw-ring-color': 'var(--primary-color)' } as React.CSSProperties}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.boxShadow = '0 0 0 2px var(--primary-color)' }}
                    onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }}
                    maxLength={1}
                    disabled={isVerifyResetCodePending}
                  />
                ))}
              </div>
            </div>

            <div className="text-center mb-6">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-sm font-medium hover:underline disabled:opacity-50"
                  style={{ color: '#306FAA' }}
                >
                  {isResending ? t('verification.resending') : t('verification.resend')}
                </button>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('verification.resendIn')}{' '}
                  <span className="font-mono font-semibold">{formatTime(resendTimer)}</span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleVerification(code.join(''))}
              disabled={isVerifyResetCodePending || code.some(digit => !digit)}
              className="w-full py-3 px-5 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              style={{ backgroundColor: 'var(--primary-color)', boxShadow: '0 4px 6px -1px rgba(48, 111, 170, 0.2)' }}
            >
              {isVerifyResetCodePending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('verification.verifying')}
                </div>
              ) : (
                t('verification.verify')
              )}
            </button>

            <button
              type="button"
              onClick={onGoBack}
              className="w-full py-3 px-5 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              {language === 'ar' ? <ArrowRightIcon className="w-4 h-4" /> : <ArrowLeftIcon className="w-4 h-4" />}
              {t('verification.back')}
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('verification.helpText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordVerificationForm;