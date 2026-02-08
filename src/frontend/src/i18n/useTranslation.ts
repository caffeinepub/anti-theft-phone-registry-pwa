import { useState, useEffect } from 'react';
import i18n from './index';

export function useTranslation() {
  const [, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const unsubscribe = i18n.subscribe(() => {
      setUpdateTrigger(prev => prev + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    t: (key: string) => i18n.t(key),
    i18n: {
      language: i18n.language,
      changeLanguage: (lng: 'id' | 'en') => i18n.changeLanguage(lng),
    },
  };
}
