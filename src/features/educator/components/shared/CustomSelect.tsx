
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '../../../../shared/components/Icons';
import { useLanguage } from '../../../../app/providers/LanguageProvider';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder, label, className = '' }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  const placeholderText = placeholder || t('common.selectPlaceholder');

  return (
    <div className={`relative w-full ${className}`} ref={selectRef}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <button
        type="button"
        className="flex items-center justify-between w-full p-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-right focus:ring-2 focus:ring-brand-primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholderText}
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border dark:border-slate-700 max-h-60 overflow-y-auto animate-fade-in-up">
          <ul role="listbox">
            {options.map(option => (
              <li
                key={option.value}
                className="flex items-center justify-between p-2.5 text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
              >
                <span>{option.label}</span>
                {value === option.value && <CheckIcon className="w-5 h-5 text-brand-primary" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;