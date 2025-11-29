import { createContext, useContext } from 'react';
import type { Language, TranslationKey } from './vocabulary';
import ruRU from 'antd/locale/ru_RU';

type Locale = typeof ruRU;

export interface AuthUser {
  id?: number;
  username: string;
  fullName?: string;
  isAdmin: boolean;
  accessToken?: string;
}

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  t: (key: TranslationKey) => string;
  antdLocale: Locale;
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

