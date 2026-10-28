import React, { useState } from 'react';
import AdminLoginForm from './AdminLoginForm';
import EducatorLoginForm from './EducatorLoginForm';
import SimpleRegisterForm from './SimpleRegisterForm';
import EmailVerificationForm from './EmailVerificationForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ForgotPasswordVerificationForm from './ForgotPasswordVerificationForm';
import PasswordResetForm from './PasswordResetForm';
import { useAuth } from '../hooks/useAuth';

type AuthView = 
  | 'admin-login'
  | 'educator-login' 
  | 'register'
  | 'email-verification'
  | 'forgot-password'
  | 'forgot-password-verification'
  | 'password-reset';

interface AuthFlowState {
  view: AuthView;
  email?: string;
  resetToken?: string;
}

const AuthFlowContainer: React.FC = () => {
  const [authState, setAuthState] = useState<AuthFlowState>({
    view: 'educator-login'
  });

  const { resendVerificationCode, resendResetCode } = useAuth();

  // Navigation functions
  const goToAdminLogin = () => setAuthState({ view: 'admin-login' });
  const goToEducatorLogin = () => setAuthState({ view: 'educator-login' });
  const goToRegister = () => setAuthState({ view: 'register' });
  const goToEmailVerification = (email: string) => setAuthState({ view: 'email-verification', email });
  const goToForgotPassword = () => setAuthState({ view: 'forgot-password' });
  const goToForgotPasswordVerification = (email: string) => setAuthState({ view: 'forgot-password-verification', email });
  const goToPasswordReset = (email: string, resetToken: string) => setAuthState({ view: 'password-reset', email, resetToken });

  // Success handlers
  const handleEmailVerificationSuccess = () => {
    goToEducatorLogin();
  };

  const handlePasswordResetSuccess = () => {
    goToEducatorLogin();
  };

  // Resend functions - call the real APIs
  const handleResendEmailVerification = async (): Promise<void> => {
    if (authState.email) {
      await resendVerificationCode(authState.email);
    }
  };

  const handleResendResetCode = async (): Promise<void> => {
    if (authState.email) {
      await resendResetCode(authState.email);
    }
  };

  const handleResetCodeVerification = (resetToken: string) => {
    if (authState.email) {
      goToPasswordReset(authState.email, resetToken);
    }
  };

  // Render current view
  const renderCurrentView = () => {
    switch (authState.view) {
      case 'admin-login':
        return (
          <AdminLoginForm
            onNavigateToForgotPassword={goToForgotPassword}
            onSwitchToEducator={goToEducatorLogin}
          />
        );

      case 'educator-login':
        return (
          <EducatorLoginForm
            onNavigateToRegister={goToRegister}
            onNavigateToForgotPassword={goToForgotPassword}
            onSwitchToAdmin={goToAdminLogin}
          />
        );

      case 'register':
        return (
          <SimpleRegisterForm
            onNavigateToLogin={goToEducatorLogin}
            onNavigateToEmailVerification={goToEmailVerification}
          />
        );

      case 'email-verification':
        return (
          <EmailVerificationForm
            email={authState.email || ''}
            onVerificationSuccess={handleEmailVerificationSuccess}
            onGoBack={goToRegister}
            onResendCode={handleResendEmailVerification}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onGoBack={goToEducatorLogin}
            onNavigateToVerification={goToForgotPasswordVerification}
          />
        );

      case 'forgot-password-verification':
        return (
          <ForgotPasswordVerificationForm
            email={authState.email || ''}
            onVerificationSuccess={handleResetCodeVerification}
            onGoBack={goToForgotPassword}
            onResendCode={handleResendResetCode}
          />
        );

      case 'password-reset':
        return (
          <PasswordResetForm
            email={authState.email || ''}
            verificationToken={authState.resetToken || ''}
            onSuccess={handlePasswordResetSuccess}
            onGoBack={goToForgotPasswordVerification}
          />
        );

      default:
        return (
          <EducatorLoginForm
            onNavigateToRegister={goToRegister}
            onNavigateToForgotPassword={goToForgotPassword}
            onSwitchToAdmin={goToAdminLogin}
          />
        );
    }
  };

  return <>{renderCurrentView()}</>;
};

export default AuthFlowContainer;
