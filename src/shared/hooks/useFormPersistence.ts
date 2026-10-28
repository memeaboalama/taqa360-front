import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

function storageKey(key: string) {
  return `form.persist.${key}`;
}

export function useFormPersistence<T extends Record<string, any>>(key: string, form: UseFormReturn<T>) {
  // Restore on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey(key));
      if (raw) {
        const data = JSON.parse(raw);
        form.reset({ ...(form.getValues() as any), ...(data as any) }, { keepDefaultValues: true });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Save on change
  useEffect(() => {
    const sub = form.watch((value) => {
      try {
        sessionStorage.setItem(storageKey(key), JSON.stringify(value));
      } catch {}
    });
    return () => sub.unsubscribe();
  }, [form, key]);

  // Save on unload as a safety
  useEffect(() => {
    const handler = () => {
      try {
        const val = form.getValues();
        sessionStorage.setItem(storageKey(key), JSON.stringify(val));
      } catch {}
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form, key]);
}
