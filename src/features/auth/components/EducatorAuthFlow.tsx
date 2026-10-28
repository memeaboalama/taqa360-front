import React, { useState } from 'react';
import EducatorLoginForm from './EducatorLoginForm';
import SimpleRegisterForm from './SimpleRegisterForm';
import EmailVerificationForm from './EmailVerificationForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ForgotPasswordVerificationForm from './ForgotPasswordVerificationForm';
import PasswordResetForm from './PasswordResetForm';
import { useEducatorAuth } from '../hooks/useEducatorAuth';

type EducatorAuthView =
  | 'educator-login'
  | 'register'
  | 'email-verification'
  | 'forgot-password'
  | 'forgot-password-verification'
  | 'password-reset';

interface EducatorAuthFlowState {
  view: EducatorAuthView;
  email?: string;
  resetToken?: string;
}

interface EducatorAuthFlowProps {
  onSwitchToAdmin: () => void;
  onBackToLanding: () => void;
  startOnView?: EducatorAuthView;
}

const EducatorAuthFlow: React.FC<EducatorAuthFlowProps> = ({
  onSwitchToAdmin,
  onBackToLanding,
  startOnView
}) => {
  const [authState, setAuthState] = useState<EducatorAuthFlowState>({
    view: startOnView || 'educator-login'
  });

  const { resendVerificationCode } = useEducatorAuth();

  // Keep internal view in sync when parent requests a specific start view (like register)
  React.useEffect(() => {
    if (startOnView && startOnView !== authState.view) {
      setAuthState((prev) => ({ ...prev, view: startOnView }));
    }
  }, [startOnView]);

  // Navigation functions
  const goToEducatorLogin = () => setAuthState({ view: 'educator-login' });
  const goToRegister = () => setAuthState({ view: 'register' });
  const goToEmailVerification = (email: string) => setAuthState({ view: 'email-verification', email });
  const goToForgotPassword = () => setAuthState({ view: 'forgot-password' });
  const goToForgotPasswordVerification = (email: string) => setAuthState({ view: 'forgot-password-verification', email });
  const goToPasswordReset = (email: string, resetToken: string) => setAuthState({ view: 'password-reset', email, resetToken });

  // Success handlers
  const handleEmailVerificationSuccess = () => {
    // After email verification, go to educator login
    goToEducatorLogin();
  };

  const handlePasswordResetSuccess = () => {
    // After password reset, go to educator login  
    goToEducatorLogin();
  };

  // Resend functions
  const handleResendEmailVerification = async (): Promise<void> => {
    if (!authState.email) return;
    // POST /educator/resend-verification-code { email }
    await resendVerificationCode(authState.email);
  };

  const handleResendResetCode = async (): Promise<void> => {
    // TODO: Call resend reset code API for educator
    console.log('Resending reset code to:', authState.email);
  };

  const handleResetCodeVerification = (resetToken: string) => {
    if (authState.email) {
      goToPasswordReset(authState.email, resetToken);
    }
  };

  // Render current view
  const renderCurrentView = () => {
    switch (authState.view) {
      case 'educator-login':
        return (
          <EducatorLoginForm
            onNavigateToRegister={goToRegister}
            onNavigateToForgotPassword={goToForgotPassword}
            onSwitchToAdmin={onSwitchToAdmin}
            onBackToLanding={onBackToLanding}
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
            onSwitchToAdmin={onSwitchToAdmin}
            onBackToLanding={onBackToLanding}
          />
        );
    }
  };

  return <>{renderCurrentView()}</>;
};

export default EducatorAuthFlow;
