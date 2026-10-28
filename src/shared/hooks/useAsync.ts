// useAsync Hook
// Manages async operations, handling loading, error, and data states.

import { useState, useCallback } from 'react';

export const useAsync = (asyncFunction: Function) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(() => {
    setStatus('pending');
    setValue(null);
    setError(null);
    return asyncFunction()
      .then((response: any) => {
        setValue(response);
        setStatus('success');
      })
      .catch((error: any) => {
        setError(error);
        setStatus('error');
      });
  }, [asyncFunction]);

  return { execute, status, value, error };
};
