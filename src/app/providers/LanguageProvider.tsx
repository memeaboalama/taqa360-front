import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../../core/i18n/translations';

type Language = 'ar' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    toggleLanguage: () => void;
    t: (key: string | null | undefined, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function toUpperSnake(input: string) {
    return input
      .replace(/[\s.-]+/g, '_')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toUpperCase();
}

function interpolate(text: string, variables?: Record<string, string | number>) {
    if (!variables) return text;
    return Object.entries(variables).reduce((acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)), text);
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('app_lang') as Language) || 'ar');

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('app_lang', language);
    }, [language]);

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => (prev === 'ar' ? 'en' : 'ar'));
    }, []);

    const t = useCallback((rawKey: string | null | undefined, variables?: Record<string, string | number>): string => {
        if (rawKey === null || rawKey === undefined) {
            return '';
        }

        const key = typeof rawKey === 'string' ? rawKey.trim() : String(rawKey);
        if (!key) {
            return '';
        }

        const dict = translations[language] as Record<string, string>;
        let value = dict[key];

        if (!value && key.includes('.')) {
            const [ns, rest] = key.split('.', 2);
            const normalized = `${ns}.${toUpperSnake(rest)}`;
            value = dict[normalized];
        }

        if (!value) {
            const last = key.split('.').pop() || key;
            const humanized = last.replace(/[_-]+/g, ' ').trim();
            if (!humanized) {
                return '';
            }
            value = language === 'ar' ? humanized : humanized.replace(/\b\w/g, c => c.toUpperCase());
        }

        return interpolate(value, variables);
    }, [language]);

    const value = { language, setLanguage, toggleLanguage, t };

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
