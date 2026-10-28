
import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '../Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface Step2Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

const Step2ProfessionalSummary: React.FC<Step2Props> = ({ onNext, onBack }) => {
    const { t } = useLanguage();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext({});
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">{t('register.step2')}</h3>
            <p>{t('register.step2Description')}</p>
            {/* Form fields */}
            <div className="flex justify-between">
                <button type="button" onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-lg">{t('back')}</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg flex items-center" style={{ backgroundColor: 'var(--primary-color)' }}>{t('next')} <ArrowRightIcon className="w-5 h-5 ms-2"/></button>
            </div>
        </form>
    );
};

export default Step2ProfessionalSummary;
