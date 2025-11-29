import React, { useState } from 'react';
import ruRU from 'antd/locale/ru_RU';
import enUS from 'antd/locale/en_US';
import { AppContext } from './AppContextState';
import type { AuthUser } from './AppContextState';
import { vocabulary } from './vocabulary';
import type { Language, TranslationKey } from './vocabulary';
import { getToken, setToken, removeToken } from '../services/authService';

type Locale = typeof ruRU;

const loadUserFromStorage = (): AuthUser | null => {
  const token = getToken();
  if (!token) return null;

  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return { ...user, accessToken: token };
    } catch {
      // Если не удалось распарсить, очищаем
      removeToken();
      localStorage.removeItem('currentUser');
      return null;
    }
  }
  return null;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(loadUserFromStorage);

  const setCurrentUser = (user: AuthUser | null) => {
    setCurrentUserState(user);
    if (user?.accessToken) {
      setToken(user.accessToken);
      localStorage.setItem('currentUser', JSON.stringify({ id: user.id, username: user.username, fullName: user.fullName, isAdmin: user.isAdmin }));
    } else {
      removeToken();
      localStorage.removeItem('currentUser');
    }
  };

  const t = (key: TranslationKey) => vocabulary[language][key];

  const antdLocale: Locale = language === 'ru' ? ruRU : enUS;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        isDarkMode,
        setIsDarkMode,
        t,
        antdLocale,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

