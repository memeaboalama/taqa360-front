import React, { useEffect, useState } from 'react';
import LoadingButton from '../LoadingButton';
import { PaymentInfo } from '../../types';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface EditPaymentInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (info: PaymentInfo) => void | Promise<void>;
    currentInfo: PaymentInfo;
}

interface FieldErrors {
    accountHolderName?: string;
    iban?: string;
    bankName?: string;
}

const EditPaymentInfoModal: React.FC<EditPaymentInfoModalProps> = ({ isOpen, onClose, onSubmit, currentInfo }) => {
    const { t } = useLanguage();
    const [info, setInfo] = useState<PaymentInfo>({ bankName: '', accountHolderName: '', iban: '', address: '', bankCountry: '', bankCode: '' });
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setInfo({
            bankName: currentInfo?.bankName || currentInfo?.bank_name || '',
            accountHolderName: currentInfo?.accountHolderName || currentInfo?.name || '',
            iban: currentInfo?.iban || '',
            address: currentInfo?.address || '',
            bankCountry: (currentInfo as any)?.bankCountry || (currentInfo as any)?.bank_country || '',
            bankCode: (currentInfo as any)?.bankCode || (currentInfo as any)?.bank_code || ''
        } as PaymentInfo);
        setFieldErrors({});
    }, [currentInfo, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInfo(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof FieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = (): boolean => {
        const errors: FieldErrors = {};
        if (!info.accountHolderName || info.accountHolderName.trim().length < 3) {
            errors.accountHolderName = 'الرجاء إدخال اسم صاحب الحساب (3 حروف على الأقل)';
        }
        if (!info.iban || info.iban.trim().length < 8) {
            errors.iban = 'الرجاء إدخال رقم IBAN صحيح';
        }
        if (!info.bankName || info.bankName.trim().length < 2) {
            errors.bankName = 'الرجاء إدخال اسم البنك';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving || !validate()) return;
        setSaving(true);
        try {
            await Promise.resolve(onSubmit(info));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={saving ? undefined : onClose}>
            <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                    <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">{t('profile.editFinancialInfo')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('profile.accountHolderName')} <span className="text-red-500">*</span>
                        </label>
                        <input name="accountHolderName" value={info.accountHolderName} onChange={handleChange} disabled={saving} className={`w-full bg-slate-50 dark:bg-slate-700/50 border ${fieldErrors.accountHolderName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg text-sm p-2.5 disabled:opacity-60`} />
                        {fieldErrors.accountHolderName && <p className="text-red-500 text-xs mt-1">{fieldErrors.accountHolderName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('profile.iban')} <span className="text-red-500">*</span>
                        </label>
                        <input name="iban" value={info.iban} onChange={handleChange} disabled={saving} placeholder="SA0380000..." className={`w-full bg-slate-50 dark:bg-slate-700/50 border ${fieldErrors.iban ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg text-sm p-2.5 disabled:opacity-60`} />
                        {fieldErrors.iban && <p className="text-red-500 text-xs mt-1">{fieldErrors.iban}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('profile.bankName')} <span className="text-red-500">*</span>
                        </label>
                        <input name="bankName" value={info.bankName} onChange={handleChange} disabled={saving} className={`w-full bg-slate-50 dark:bg-slate-700/50 border ${fieldErrors.bankName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg text-sm p-2.5 disabled:opacity-60`} />
                        {fieldErrors.bankName && <p className="text-red-500 text-xs mt-1">{fieldErrors.bankName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">كود البنك</label>
                        <input name="bankCode" value={(info as any).bankCode || ''} onChange={handleChange} disabled={saving} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5 disabled:opacity-60" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">العنوان</label>
                        <input name="address" value={info.address || ''} onChange={handleChange} disabled={saving} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5 disabled:opacity-60" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">دولة البنك</label>
                        <input name="bankCountry" value={(info as any).bankCountry || ''} onChange={handleChange} disabled={saving} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5 disabled:opacity-60" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end items-center gap-3">
                    <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">إلغاء</button>
                    <LoadingButton type="submit" loading={saving} disabled={saving} variant="brand">{t('profile.saveFinancialInfo')}</LoadingButton>
                </div>
            </form>
        </div>
    );
};

export default EditPaymentInfoModal;
