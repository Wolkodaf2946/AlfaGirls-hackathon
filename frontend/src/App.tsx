import React from 'react';
import { ConfigProvider, theme, FloatButton, App as AntdApp } from 'antd';
import { MoonOutlined, SunOutlined, TranslationOutlined, LogoutOutlined } from '@ant-design/icons';
import LoginPage from './pages/Login';
import AdminPage from './pages/AdminPanel';
import UserPage from './pages/UserPage';
import { AppProvider, useApp } from './context/AppContext';

const MainContent: React.FC = () => {
  const { isDarkMode, setIsDarkMode, language, setLanguage, antdLocale, currentUser, setCurrentUser, t } = useApp();
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const isAdmin = Boolean(currentUser?.isAdmin);
  const isLoggedIn = Boolean(currentUser);

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#3c89e8', 
        }
      }}
    >
      <AntdApp>
        <FloatButton.Group shape="square" style={{ right: 24, bottom: 24 }}>
          
          <FloatButton 
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />} 
            onClick={() => setIsDarkMode(!isDarkMode)}
          />
          
          <FloatButton 
            icon={<TranslationOutlined />}
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
            tooltip={language === 'ru' ? "Switch to English" : "Переключить на Русский"}
          />

          {isLoggedIn && (
            <FloatButton
              icon={<LogoutOutlined />}
              tooltip={t('logoutButton')}
              onClick={() => {
                setCurrentUser(null);
              }}
            />
          )}
          
        </FloatButton.Group>

        {!isLoggedIn ? (
          <LoginPage />
        ) : isAdmin ? (
          <AdminPage />
        ) : (
          <UserPage />
        )}
        
      </AntdApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;