import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon, PlusIcon } from '../../../../shared/components/Icons';

export interface SelectWithCreateOption {
  value: string;
  label: string;
}

interface SelectWithCreateProps {
  options: SelectWithCreateOption[];
  value: SelectWithCreateOption[];
  onChange: (value: SelectWithCreateOption[]) => void;
  onCreate: (label: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  isMulti?: boolean;
  isLoading?: boolean;
}

const SelectWithCreate: React.FC<SelectWithCreateProps> = ({ options, value, onChange, onCreate, placeholder = 'اختر أو أنشئ...', label, className = '', isMulti = false, isLoading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = (option: SelectWithCreateOption) => {
    let newValue: SelectWithCreateOption[];
    if (isMulti) {
      const exists = value.some(v => v.value === option.value);
      newValue = exists ? value.filter(v => v.value !== option.value) : [...value, option];
    } else {
      const exists = value.some(v => v.value === option.value);
      newValue = exists ? [] : [option];
    }
    onChange(newValue);
    setInputValue('');
    setIsOpen(false);
  };

  const handleCreate = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onCreate(trimmed);
      setInputValue('');
      setIsOpen(false);
    }
  };

  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()));
  const showCreate = inputValue.trim() && !options.some(opt => opt.label.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <div className={`relative w-full ${className}`} ref={selectRef}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <button
        type="button"
        className="flex items-center justify-between w-full p-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-right focus:ring-2 focus:ring-brand-primary"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-slate-900 dark:text-white truncate">
          {value.length > 0 ? value.map(v => v.label).join(', ') : placeholder}
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border dark:border-slate-700 animate-fade-in-up">
           <div className="p-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="ابحث أو أضف جديد..."
                    className="w-full p-2 text-sm border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700"
                />
           </div>
          <ul role="listbox" className="max-h-48 overflow-y-auto">
            {isLoading && (
              <li className="flex items-center gap-2 p-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-brand-primary rounded-full animate-spin"></span>
                جارٍ التحميل...
              </li>
            )}
            {!isLoading && filteredOptions.length === 0 && (
              <li className="p-2.5 text-sm text-slate-500 dark:text-slate-400">
                لا توجد نتائج مطابقة، يمكنك إضافة قيمة جديدة.
              </li>
            )}
            {filteredOptions.map(option => {
              const isSelected = value.some(v => v.value === option.value);
              return (
              <li
                key={option.value}
                className="flex items-center justify-between p-2.5 text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={isSelected}
              >
                <span>{option.label}</span>
                {isSelected && <CheckIcon className="w-5 h-5 text-brand-primary" />}
              </li>
            )})}
          </ul>
           {showCreate && (
               <div className="p-2 border-t dark:border-slate-700">
                    <button type="button" onClick={handleCreate} className="w-full flex items-center gap-2 p-2 text-sm text-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded-md">
                        <PlusIcon className="w-5 h-5"/>
                        إنشاء "{inputValue.trim()}"
                    </button>
               </div>
           )}
        </div>
      )}
    </div>
  );
};

export default SelectWithCreate;
