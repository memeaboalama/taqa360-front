import React from 'react';
import { GlobeAltIcon } from './Icons';
import { useLanguage } from '../../app/providers/LanguageProvider';

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'compact';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  showLabel = false,
  variant = 'button'
}) => {
  const { language, toggleLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
        title={`Switch to ${language === 'ar' ? 'English' : 'العربية'}`}
        aria-label="Toggle language"
      >
        <GlobeAltIcon className="w-5 h-5" />
        <span className="ms-2 text-sm font-semibold hidden sm:inline">
          {language === 'ar' ? 'English' : 'العربية'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white hover:shadow-md transition-all duration-200 font-semibold ${className}`}
      title={`Switch to ${language === 'ar' ? 'English' : 'العربية'}`}
      aria-label="Toggle language"
    >
      <GlobeAltIcon className="w-5 h-5" />
      <span>{language === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
};

export default LanguageSwitcher;
