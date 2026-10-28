
import React from 'react';
import { ArrowRightIcon } from '../Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface Step1Props {
  onNext: (data: any) => void;
}

const Step1PersonalInfo: React.FC<Step1Props> = ({ onNext }) => {
  const { t } = useLanguage();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      // Collect data from form
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">{t('register.step1')}</h3>
      <p>{t('register.step1Description')}</p>
      {/* Form fields */}
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 text-white rounded-lg flex items-center" style={{ backgroundColor: 'var(--primary-color)' }}>
            {t('next')} <ArrowRightIcon className="w-5 h-5 ms-2"/>
        </button>
      </div>
    </form>
  );
};

export default Step1PersonalInfo;
