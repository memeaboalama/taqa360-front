import React, { useState, useEffect, useRef } from 'react';
import { EnvelopeIcon, CheckCircleIcon, ArrowLeftIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useEducatorAuth } from '../hooks/useEducatorAuth';

interface EmailVerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
  onGoBack: () => void;
  onResendCode: () => Promise<void>;
}

interface VerificationFormData {
  code: string;
}

const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({
  email,
  onVerificationSuccess,
  onGoBack,
  onResendCode
}) => {
  const { t, language } = useLanguage();
  const { verifyEmailCode } = useEducatorAuth();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
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
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all digits are entered
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
    if (isVerifying) return;

    if (verificationCode.length !== 6) {
      setError(language === 'ar' ? 'الرمز يجب أن يكون 6 أرقام' : 'Code must be 6 digits');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // POST /educator/verify-email-code { email, code } — the backend
      // rejects wrong/expired codes, so a success here means the account is
      // really flagged as verified in the database.
      await verifyEmailCode(email, verificationCode);
      onVerificationSuccess();
    } catch (err: any) {
      const message = err?.message
        || (language === 'ar' ? 'رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.' : 'Invalid verification code. Please try again.');
      setError(message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
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
    } catch (err: any) {
      setError(err?.message
        || (language === 'ar' ? 'فشل في إرسال الرمز. يرجى المحاولة مرة أخرى.' : 'Failed to send code. Please try again.'));
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-green-600 p-3 rounded-xl shadow-lg shadow-green-600/20">
            <EnvelopeIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">
          {language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Verify Your Email'}
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
          {language === 'ar' ? 'أرسلنا رمز التحقق المكون من 6 أرقام إلى' : 'We sent a 6-digit verification code to'}<br />
          <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
        </p>
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Verification Code Input */}
          <div className="mb-6">
            <label className="block mb-4 text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
              أدخل رمز التحقق
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
                  className="w-12 h-12 text-center text-xl font-bold bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400"
                  maxLength={1}
                  disabled={isVerifying}
                />
              ))}
            </div>
          </div>

          {/* Resend Code */}
          <div className="text-center mb-6">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
              >
                {isResending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
              </button>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                يمكنك إعادة إرسال الرمز خلال{' '}
                <span className="font-mono font-semibold">{formatTime(resendTimer)}</span>
              </p>
            )}
          </div>

          {/* Manual Verify Button */}
          <button
            type="button"
            onClick={() => handleVerification(code.join(''))}
            disabled={isVerifying || code.some(digit => !digit)}
            className="w-full py-3 px-5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md shadow-green-600/20 hover:shadow-lg hover:shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isVerifying ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري التحقق...
              </div>
            ) : (
              'تحقق من الرمز'
            )}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={onGoBack}
            className="w-full py-3 px-5 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            العودة إلى التسجيل
          </button>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              لم تتلق الرمز، تحقق من مجلد الرسائل المهملة أو أعد إرسال الرمز
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationForm;
