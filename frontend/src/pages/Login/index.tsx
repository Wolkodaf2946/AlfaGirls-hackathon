import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, theme } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import { signIn } from '../../services/authService';
import { fetchUserById } from '../../services/userService';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const { t, setCurrentUser } = useApp();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // Реальный API запрос
      const response = await signIn({
        full_name: values.username,
        password: values.password,
      });
      console.log(response);
      // Загружаем информацию о пользователе по id (если не админ)
      let userInfo = null;
      if (!response.flag) {
        try {
          userInfo = await fetchUserById(response.id);
        } catch {
          // Если не удалось загрузить информацию, используем только данные из ответа
        }
      }

      setCurrentUser({
        id: response.id,
        username: values.username,
        fullName: userInfo?.full_name || values.username,
        isAdmin: response.flag,
        accessToken: response.access_token,
      });

      message.success(t('successMessage'));
      form.resetFields();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('errorMessage'));
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: token.colorBgLayout 
    }}>
      
      <Card style={{ width: 450, boxShadow: token.boxShadowSecondary }}>
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>{t('welcome')}</Title>
          <Text type="secondary">{t('signInText')}</Text>
        </div>

        <Form
          name="login_form"
          form={form}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder={t('loginPlaceholder')} 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('passwordPlaceholder')}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t('loginButton')}
            </Button>
          </Form.Item>
        </Form>
        
      </Card>
    </div>
  );
};

export default LoginPage;