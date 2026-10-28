import React, { useState } from 'react';
import AdminLoginForm from './AdminLoginForm';
import EmailVerificationForm from './EmailVerificationForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ForgotPasswordVerificationForm from './ForgotPasswordVerificationForm';
import PasswordResetForm from './PasswordResetForm';

type AdminAuthView = 
  | 'admin-login'
  | 'email-verification'
  | 'forgot-password'
  | 'forgot-password-verification'
  | 'password-reset';

interface AdminAuthFlowState {
  view: AdminAuthView;
  email?: string;
  resetToken?: string;
}

interface AdminAuthFlowProps {
  onSwitchToEducator: () => void;
  onBackToLanding: () => void;
}

const AdminAuthFlow: React.FC<AdminAuthFlowProps> = ({
  onSwitchToEducator,
  onBackToLanding
}) => {
  const [authState, setAuthState] = useState<AdminAuthFlowState>({
    view: 'admin-login'
  });

  // Navigation functions
  const goToAdminLogin = () => setAuthState({ view: 'admin-login' });
  const goToEmailVerification = (email: string) => setAuthState({ view: 'email-verification', email });
  const goToForgotPassword = () => setAuthState({ view: 'forgot-password' });
  const goToForgotPasswordVerification = (email: string) => setAuthState({ view: 'forgot-password-verification', email });
  const goToPasswordReset = (email: string, resetToken: string) => setAuthState({ view: 'password-reset', email, resetToken });

  // Success handlers
  const handleEmailVerificationSuccess = () => {
    // After email verification, go back to admin login
    goToAdminLogin();
  };

  const handlePasswordResetSuccess = () => {
    // After password reset, go back to admin login  
    goToAdminLogin();
  };

  // Resend functions
  const handleResendEmailVerification = async (): Promise<void> => {
    // TODO: Call resend email verification API for admin
    console.log('Resending email verification code to:', authState.email);
  };

  const handleResendResetCode = async (): Promise<void> => {
    // TODO: Call resend reset code API for admin
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
      case 'admin-login':
        return (
          <AdminLoginForm
            onNavigateToForgotPassword={goToForgotPassword}
            onSwitchToEducator={onSwitchToEducator}
            onBackToLanding={onBackToLanding}
          />
        );

      case 'email-verification':
        return (
          <EmailVerificationForm
            email={authState.email || ''}
            onVerificationSuccess={handleEmailVerificationSuccess}
            onGoBack={goToAdminLogin}
            onResendCode={handleResendEmailVerification}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onGoBack={goToAdminLogin}
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
          <AdminLoginForm
            onNavigateToForgotPassword={goToForgotPassword}
            onSwitchToEducator={onSwitchToEducator}
            onBackToLanding={onBackToLanding}
          />
        );
    }
  };

  return <>{renderCurrentView()}</>;
};

export default AdminAuthFlow;
