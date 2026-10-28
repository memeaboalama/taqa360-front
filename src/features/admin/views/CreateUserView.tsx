import React, { useState } from 'react';
import { ViewType } from '../../../shared/types';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { ArrowLeftIcon, ArrowRightIcon, UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon, MapPinIcon } from '../../../shared/components/Icons';

interface CreateUserViewProps {
  navigateTo: (view: ViewType, id?: string) => void;
  onAddUser: (data: { name: string; email: string; phone?: string; password: string; city?: string; address?: string }) => Promise<void>;
  isPending?: boolean;
}

const CreateUserView: React.FC<CreateUserViewProps> = ({ navigateTo, onAddUser, isPending = false }) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) newErrors.name = t('createUser.nameRequired');
    if (!email.trim()) newErrors.email = t('createUser.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('createUser.emailInvalid');
    if (!password.trim()) newErrors.password = t('createUser.passwordRequired');
    else if (password.length < 8) newErrors.password = t('createUser.passwordMinLength');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;
    await onAddUser({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, city: city.trim(), address: address.trim() });
  };

  const inputClass = (field: keyof typeof errors) =>
    `bg-gray-50 border ${errors[field] ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white`;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button onClick={() => navigateTo('users')} className="flex items-center text-sm text-brand-primary dark:text-yellow-500 hover:underline mb-2">
          {language === 'ar' ? <ArrowRightIcon className="w-4 h-4 ms-1" /> : <ArrowLeftIcon className="w-4 h-4 me-1" />}
          {t('createUser.backToUsers')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('createUser.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('createUser.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700 p-6 lg:p-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {t('createUser.nameLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400" />
                <input type="text" id="name" value={name} onChange={e => { setName(e.target.value); if (submitted) validate(); }} className={`${inputClass('name')} ps-10`} placeholder={t('createUser.nameLabel')} />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {t('createUser.emailLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400" />
                <input type="email" id="email" value={email} onChange={e => { setEmail(e.target.value); if (submitted) validate(); }} className={`${inputClass('email')} ps-10`} placeholder={t('createUser.emailLabel')} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {t('createUser.phoneLabel')}
              </label>
              <div className="relative">
                <PhoneIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400" />
                <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 ps-10 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white" placeholder={t('createUser.phoneLabel')} />
              </div>
            </div>

            <div>
              <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {t('usersView.city')}
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400" />
                <input type="text" id="city" value={city} onChange={e => setCity(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 ps-10 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white" placeholder={t('usersView.city')} />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {t('usersView.address')}
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400" />
                <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 ps-10 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white" placeholder={t('usersView.address')} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {t('createUser.passwordLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400" />
                <input type="password" id="password" value={password} onChange={e => { setPassword(e.target.value); if (submitted) validate(); }} className={`${inputClass('password')} ps-10`} placeholder={t('createUser.passwordLabel')} />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigateTo('users')} disabled={isPending} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {t('createUser.cancel')}
            </button>
            <button type="submit" disabled={isPending} className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 shadow-md focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2"></div>}
              {isPending ? t('createUser.creating') : t('createUser.create')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateUserView;
