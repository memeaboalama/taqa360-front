import React, { Component, ErrorInfo, ReactNode } from 'react';
import { goToLanding } from '../../core/utils/router';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State { return { hasError: true }; }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service here if available
    // Avoid exposing sensitive info
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-slate-950 p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center shadow-xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-primary shadow-glow-primary mx-auto mb-3">
              <svg className="w-7 h-7 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">حدث خطأ غير متوقع</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">نحاول إصلاح المشكلة. الرجاء إعادة تحميل الصفحة أو العودة لاحقاً.</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg">إعادة تحميل</button>
              <button onClick={() => goToLanding()} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg">العودة للرئيسية</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
