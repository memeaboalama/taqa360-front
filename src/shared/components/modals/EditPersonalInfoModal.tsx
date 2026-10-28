import React, { useState } from 'react';
import LoadingButton from '../LoadingButton';
import { Educator, Gender, IdType } from '../../types';
import { UploadCloudIcon, DocumentTextIcon, XCircleIcon } from '../Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface EditPersonalInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Educator>) => void | Promise<void>;
    educator: Educator;
}

const InputField: React.FC<{label: string, name: string, value: string, onChange: React.ChangeEventHandler<HTMLInputElement>, type?: string}> = ({label, name, value, onChange, type="text"}) => (
    <div>
        <label htmlFor={name} className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" required/>
    </div>
);

const SelectField: React.FC<{label: string, name: string, value: string, onChange: React.ChangeEventHandler<HTMLSelectElement>, options: {value: string, label: string}[]}> = ({label, name, value, onChange, options}) => (
     <div>
        <label htmlFor={name} className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const EditPersonalInfoModal: React.FC<EditPersonalInfoModalProps> = ({ isOpen, onClose, onSubmit, educator }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: educator.name,
        email: educator.email,
        phone: educator.phone,
        country: educator.country,
        city: educator.city,
        gender: educator.profile.gender,
        birthDate: educator.profile.birthDate,
        nationality: educator.profile.nationality,
        idType: educator.profile.idType,
        idNumber: educator.profile.idNumber,
    });
    const [idFile, setIdFile] = useState<File | null>(null);
    const [idPreview, setIdPreview] = useState<string | null>(educator.profile.idDocumentUrl);
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIdFile(file);
            setIdPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setIdFile(null);
        setIdPreview(null);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const updatedProfileData = {
                ...educator.profile,
                ...formData,
                idDocumentUrl: idPreview,
            };
            const updatedEducatorData = {
                ...educator,
                ...formData,
                profile: updatedProfileData,
            };
            await Promise.resolve(onSubmit(updatedEducatorData));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-3xl animate-fade-in-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white p-6 border-b dark:border-slate-700 flex-shrink-0">{t('profile.editPersonalInfo')}</h2>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label={t('profile.fullName')} name="name" value={formData.name} onChange={handleChange} />
                        <InputField label={t('profile.email')} name="email" type="email" value={formData.email} onChange={handleChange} />
                        <InputField label={t('profile.phone')} name="phone" value={formData.phone} onChange={handleChange} />
                        <InputField label={t('profile.birthDate')} name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
                        <InputField label={t('profile.nationality')} name="nationality" value={formData.nationality} onChange={handleChange} />
                        <SelectField label={t('profile.gender')} name="gender" value={formData.gender} onChange={handleChange} options={Object.values(Gender).map(g => ({value: g, label: t(`gender.${g}`)}))} />
                        <InputField label={t('profile.country')} name="country" value={formData.country} onChange={handleChange} />
                        <InputField label={t('profile.city')} name="city" value={formData.city} onChange={handleChange} />
                        <SelectField label={t('profile.idType')} name="idType" value={formData.idType} onChange={handleChange} options={Object.values(IdType).map(idt => ({value: idt, label: t(`idType.${idt}`)}))} />
                        <InputField label={t('profile.idNumber')} name="idNumber" value={formData.idNumber} onChange={handleChange} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.idPhoto')}</label>
                        {idPreview ? (
                            <div className="relative group">
                                <img src={idPreview} alt={t('profile.idPreview')} className="w-full h-48 object-contain rounded-lg bg-slate-100 dark:bg-slate-700 p-2"/>
                                <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XCircleIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="id-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-700/50 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-slate-500">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloudIcon className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">{t('profile.clickToUpload')}</span></p>
                                    </div>
                                    <input id="id-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*"/>
                                </label>
                            </div> 
                        )}
                    </div>
                </div>
                <div className="mt-6 flex-shrink-0 flex justify-end items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 rounded-b-2xl">
                    <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200/70 rounded-lg hover:bg-slate-300/70 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed">{t('cancel')}</button>
                    <LoadingButton type="submit" loading={saving} variant="primary">{t('modals.saveChanges')}</LoadingButton>
                </div>
            </form>
        </div>
    );
};

export default EditPersonalInfoModal;
