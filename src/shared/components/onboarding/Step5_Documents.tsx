
import React from 'react';
import { ArrowLeftIcon } from '../Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface Step5Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

const Step5Documents: React.FC<Step5Props> = ({ onNext, onBack }) => {
    const { t } = useLanguage();
     const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext({});
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">{t('register.step5')}</h3>
            <p>{t('register.step5Description')}</p>
            {/* Form fields */}
            <div className="flex justify-between">
                <button type="button" onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-lg">{t('back')}</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">{t('register.submitForReview')}</button>
            </div>
        </form>
    );
};

export default Step5Documents;
