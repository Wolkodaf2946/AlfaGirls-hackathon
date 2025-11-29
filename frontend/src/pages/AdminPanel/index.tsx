import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Descriptions,
  Empty,
  theme,
  message,
  List,
  Upload,
  Spin,
  Tag,
  Collapse,
  Divider,
} from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
  UserOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import { fetchAllUsers } from '../../services/userService';
import { signUp } from '../../services/authService';
// import { fetchUserGrants, fetchPurchaseGroups, fetchGroupItems } from '../../services/grantService'; // Раскомментируйте для реального API
import type { UserSummary } from '../../models/user';
import type { Grant, PurchaseGroup, GroupItem } from '../../models/grant';
import type { SmartContract } from '../../models/contract';
import { getMockContract } from '../../services/contractService';
// import { fetchContractByGrantId } from '../../services/contractService'; // Раскомментируйте для реального API

const { Panel } = Collapse;

const { Title, Text } = Typography;

// Мок-данные для грантов (используются в админ-панели)
const MOCK_GRANTS: Record<number, Grant[]> = {
  1: [
    {
      id: 1,
      grantor_id: 1,
      granter_id: 1,
      total_amount: 100000,
      must: 75000,
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      grantor_id: 1,
      granter_id: 1,
      total_amount: 50000,
      must: 50000,
      created_at: '2024-02-20T14:30:00Z',
    },
  ],
  2: [
    {
      id: 3,
      grantor_id: 1,
      granter_id: 2,
      total_amount: 80000,
      must: 60000,
      created_at: '2024-01-20T10:00:00Z',
    },
  ],
  3: [
    {
      id: 4,
      grantor_id: 1,
      granter_id: 3,
      total_amount: 120000,
      must: 120000,
      created_at: '2024-03-10T09:15:00Z',
    },
  ],
};

const MOCK_PURCHASE_GROUPS: Record<number, PurchaseGroup[]> = {
  1: [
    { id: 1, grant_id: 1, category_id: 1, name: 'Закупка техники для школы', created_at: '2024-01-16T10:00:00Z' },
    { id: 2, grant_id: 1, category_id: 2, name: 'Садовый инвентарь', created_at: '2024-01-17T10:00:00Z' },
  ],
  2: [
    { id: 3, grant_id: 2, category_id: 1, name: 'Компьютерное оборудование', created_at: '2024-02-21T10:00:00Z' },
  ],
  3: [
    { id: 4, grant_id: 3, category_id: 1, name: 'Офисная техника', created_at: '2024-01-21T10:00:00Z' },
  ],
  4: [
    { id: 5, grant_id: 4, category_id: 1, name: 'Учебные материалы', created_at: '2024-03-11T10:00:00Z' },
  ],
};

const MOCK_GROUP_ITEMS: Record<number, GroupItem[]> = {
  1: [
    { id: 1, purchase_group_id: 1, product_name: 'Ноутбук Honor MagicBook 16', quantity: 5, status: 'completed', receipt_url: 'receipt1.pdf' },
    { id: 2, purchase_group_id: 1, product_name: 'Мышь беспроводная', quantity: 10, status: 'processing', receipt_url: 'receipt2.pdf' },
    { id: 3, purchase_group_id: 1, product_name: 'Клавиатура механическая', quantity: 8, status: 'not_purchased' },
  ],
  2: [
    { id: 4, purchase_group_id: 2, product_name: 'Газонокосилка электрическая', quantity: 2, status: 'completed', receipt_url: 'receipt3.pdf' },
    { id: 5, purchase_group_id: 2, product_name: 'Садовые ножницы', quantity: 5, status: 'contract_error' },
  ],
  3: [
    { id: 6, purchase_group_id: 3, product_name: 'Монитор 27 дюймов', quantity: 3, status: 'not_purchased' },
  ],
  4: [
    { id: 7, purchase_group_id: 4, product_name: 'Проектор', quantity: 2, status: 'processing', receipt_url: 'receipt4.pdf' },
  ],
  5: [
    { id: 8, purchase_group_id: 5, product_name: 'Учебники', quantity: 50, status: 'completed', receipt_url: 'receipt5.pdf' },
  ],
};

// Мок-данные для тестирования поиска
const MOCK_USERS: UserSummary[] = [
  {
    id: 1,
    full_name: 'Иванов Иван Иванович',
    email: 'ivan.ivanov@example.com',
    bank_account_number: '12345678901234567890',
    bank_card_number: '1234567890123456',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    full_name: 'Иванов Иван Иванович',
    email: 'petr.petrov@example.com',
    bank_account_number: '98765432109876543210',
    bank_card_number: '9876543210987654',
    created_at: '2024-02-20T14:30:00Z',
  },
  {
    id: 3,
    full_name: 'Сидоров Сидор Сидорович',
    email: 'sidor.sidorov@example.com',
    bank_account_number: '55555555555555555555',
    bank_card_number: '5555555555555555',
    created_at: '2024-03-10T09:15:00Z',
  },
];

const AdminPage: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useApp();
  const [form] = Form.useForm();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [userGrants, setUserGrants] = useState<Grant[]>([]);
  const [loadingGrants, setLoadingGrants] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [purchaseGroups, setPurchaseGroups] = useState<PurchaseGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<PurchaseGroup | null>(null);
  const [groupItems, setGroupItems] = useState<GroupItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [contract, setContract] = useState<SmartContract | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    
    fetchAllUsers(controller.signal)
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          // Если ошибка авторизации, используем мок-данные для тестирования
          console.warn('Failed to fetch users, using mock data:', err);
          setUsers(MOCK_USERS);
        }
      })
      .finally(() => setLoadingUsers(false));

    return () => controller.abort();
  }, []);

  const onCreateFinish = async (values: Record<string, unknown>) => {
    setCreatingUser(true);
    try {
      await signUp({
        full_name: values.full_name as string,
        email: values.email as string,
        password: values.password as string,
        bank_account_number: values.bank_account_number as string,
        bank_card_number: values.bank_card_number as string,
      });

      message.success(t('userCreatedMessage'));
      form.resetFields();
      
      // Обновляем список пользователей
      const updatedUsers = await fetchAllUsers();
      setUsers(updatedUsers);
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось создать пользователя');
    } finally {
      setCreatingUser(false);
    }
  };

  useEffect(() => {
    if (selectedUser?.id) {
      setLoadingGrants(true);
      setSelectedGrant(null);
      setPurchaseGroups([]);
      setGroupItems([]);
      
      // Мок-данные для грантов пользователя
      const loadGrants = async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setUserGrants(MOCK_GRANTS[selectedUser.id] || []);
          
          // Раскомментируйте для реального API:
          // const grants = await fetchUserGrants(selectedUser.id);
          // setUserGrants(grants);
        } catch {
          message.error('Не удалось загрузить гранты');
        } finally {
          setLoadingGrants(false);
        }
      };
      
      loadGrants();
    } else {
      setUserGrants([]);
    }
  }, [selectedUser]);

  const handleSearch = (value: string) => {
    const normalized = value.trim().toLowerCase();
    setSearchValue(value);
    setSearchInitiated(true);

    if (!normalized) {
      setSearchResults([]);
      setSelectedUser(null);
      return;
    }

    const matches = users.filter((user) => user.full_name.toLowerCase().includes(normalized));
    setSearchResults(matches);

    if (matches.length === 1) {
      setSelectedUser(matches[0]);
      message.success(t('userFoundMessage'));
    } else if (matches.length === 0) {
      setSelectedUser(null);
      message.warning(t('noMatchesFound'));
    } else {
      message.info(t('selectUserPrompt'));
    }
  };

  const handleGrantSelect = async (grant: Grant) => {
    setSelectedGrant(grant);
    setSelectedGroup(null);
    setGroupItems([]);
    setContract(null);
    setLoadingGroups(true);
    setLoadingContract(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setPurchaseGroups(MOCK_PURCHASE_GROUPS[grant.id] || []);
      
      // Раскомментируйте для реального API:
      // const groups = await fetchPurchaseGroups(grant.id);
      // setPurchaseGroups(groups);
      
      // Загружаем смарт-контракт для гранта
      try {
        // Раскомментируйте для реального API:
        // const contractData = await fetchContractByGrantId(grant.id);
        // setContract(contractData);
        
        // Мок-данные для демонстрации
        const mockContract = getMockContract(grant.id);
        setContract(mockContract);
      } catch (err) {
        // Контракт может отсутствовать, это нормально
        console.warn('Contract not found:', err);
      }
    } catch {
      message.error('Не удалось загрузить категории');
    } finally {
      setLoadingGroups(false);
      setLoadingContract(false);
    }
  };

  const handleGroupSelect = async (group: PurchaseGroup) => {
    setSelectedGroup(group);
    setLoadingItems(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setGroupItems(MOCK_GROUP_ITEMS[group.id] || []);
      
      // Раскомментируйте для реального API:
      // const items = await fetchGroupItems(group.id);
      // setGroupItems(items);
    } catch {
      message.error('Не удалось загрузить товары');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDownloadReceipt = (receiptUrl: string) => {
    message.success(t('downloadReceipt'));
    // В реальном приложении здесь будет запрос на скачивание файла
    window.open(receiptUrl, '_blank');
  };

  const getStatusConfig = (status?: GroupItem['status']) => {
    switch (status) {
      case 'not_purchased':
        return { color: 'red', icon: <CloseCircleOutlined />, text: t('statusNotPurchased') };
      case 'processing':
        return { color: 'orange', icon: <ClockCircleOutlined />, text: t('statusProcessing') };
      case 'completed':
        return { color: 'green', icon: <CheckCircleOutlined />, text: t('statusCompleted') };
      case 'contract_error':
        return { color: 'purple', icon: <ExclamationCircleOutlined />, text: t('statusContractErrorAdmin') };
      default:
        return { color: 'red', icon: <CloseCircleOutlined />, text: t('statusNotPurchased') };
    }
  };

  const renderUserValue = (value?: string | number | null) => value ?? t('noData');

  return (
    <div
      style={{
        padding: 24,
        minHeight: '100vh',
        backgroundColor: token.colorBgLayout,
      }}
    >
      <Row gutter={[16, 16]} style={{ height: 'calc(100vh - 48px)' }}>
        <Col span={12} style={{ height: '100%' }}>
          <Card
            title={
              <Space>
                <UserAddOutlined />
                {t('createUserTitle')}
              </Space>
            }
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, overflow: 'auto' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onCreateFinish}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <Form.Item
                label={t('fullNameLabel')}
                name="full_name"
                rules={[{ required: true, message: t('fullNameLabel') }]}
              >
                <Input placeholder={t('fullNameLabel')} />
              </Form.Item>

              <Form.Item
                label={t('emailLabel')}
                name="email"
                rules={[{ required: true, type: 'email', message: t('emailLabel') }]}
              >
                <Input placeholder="example@mail.com" />
              </Form.Item>

              <Form.Item
                label={t('passwordLabel')}
                name="password"
                rules={[{ required: true, message: t('passwordRequired') }]}
              >
                <Input.Password placeholder={t('passwordPlaceholder')} />
              </Form.Item>

              <Form.Item
                label={t('bankAccountLabel')}
                name="bank_account_number"
                rules={[
                  { required: true, message: t('bankAccountRequired') },
                  {
                    pattern: /^\d{20}$/,
                    message: t('bankAccountInvalid'),
                  },
                ]}
              >
                <Input maxLength={20} />
              </Form.Item>

              <Form.Item
                label={t('bankCardLabel')}
                name="bank_card_number"
                rules={[
                  { required: true, message: t('bankCardRequired') },
                  {
                    pattern: /^\d{16}$/,
                    message: t('bankCardInvalid'),
                  },
                ]}
              >
                <Input maxLength={16} />
              </Form.Item>

              <Form.Item label={t('documentUploadLabel')} name="document">
                <Upload beforeUpload={() => false} showUploadList={false}>
                  <Button icon={<UploadOutlined />}>{t('documentUploadHint')}</Button>
                </Upload>
              </Form.Item>

              <Button type="primary" htmlType="submit" icon={<UserAddOutlined />} block loading={creatingUser}>
                {t('createButton')}
              </Button>
            </Form>
          </Card>
        </Col>

        <Col span={12} style={{ height: '100%' }}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card
              title={
                <Space>
                  <SearchOutlined />
                  {t('searchUserTitle')}
                </Space>
              }
              style={{ flex: '0 0 33%', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
            >
              <div style={{ marginBottom: 12 }}>
                <Title level={5} style={{ marginBottom: 12 }}>
                  {t('searchPrompt')}
                </Title>
                <Input.Search
                  placeholder={t('searchPlaceholder')}
                  enterButton={t('searchButton')}
                  size="large"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onSearch={handleSearch}
                  loading={loadingUsers}
                />
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                  {t('searchHint')}
                </Text>
              </div>
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                {loadingUsers ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Spin />
                  </div>
                ) : (
                  <List
                    rowKey={(item) => item.id}
                    dataSource={searchResults}
                    locale={{
                      emptyText: searchInitiated ? t('noMatchesFound') : t('searchPrompt'),
                    }}
                    renderItem={(item) => (
                      <List.Item
                        key={item.id}
                        onClick={() => setSelectedUser(item)}
                        style={{
                          cursor: 'pointer',
                          borderRadius: 8,
                          border: `1px solid ${
                            selectedUser?.id === item.id ? token.colorPrimary : token.colorBorder
                          }`,
                          paddingInline: 16,
                          backgroundColor:
                            selectedUser?.id === item.id ? token.colorPrimaryBgHover : token.colorBgContainer,
                        }}
                      >
                        <div>
                          <Text strong>{item.full_name}</Text>
                          <Text italic style={{ marginLeft: 6 }}>
                            ({item.email})
                          </Text>
                        </div>
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </Card>

            {selectedUser ? (
              <Card
                title={
                  <Space>
                    <UserOutlined />
                    {selectedUser.full_name}
                  </Space>
                }
                style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
                    <Descriptions.Item label={t('emailLabel')}>{selectedUser.email}</Descriptions.Item>
                    <Descriptions.Item label={t('bankAccountLabel')}>
                      {renderUserValue(selectedUser.bank_account_number)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('bankCardLabel')}>
                      {renderUserValue(selectedUser.bank_card_number)}
                    </Descriptions.Item>
                  </Descriptions>

                  <div>
                    <Title level={5}>{t('myGrants')}</Title>
                    {loadingGrants ? (
                      <div style={{ textAlign: 'center', padding: 20 }}>
                        <Spin />
                      </div>
                    ) : userGrants.length === 0 ? (
                      <Empty description={t('noGrants')} />
                    ) : (
                      <List
                        dataSource={userGrants}
                        renderItem={(grant) => {
                          const remaining = grant.must;
                          const isSelected = selectedGrant?.id === grant.id;
                          
                          return (
                            <List.Item
                              onClick={() => handleGrantSelect(grant)}
                              style={{
                                cursor: 'pointer',
                                borderRadius: 8,
                                border: `1px solid ${isSelected ? token.colorPrimary : token.colorBorder}`,
                                padding: 12,
                                marginBottom: 8,
                                backgroundColor: isSelected ? token.colorPrimaryBgHover : token.colorBgContainer,
                              }}
                            >
                              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Text strong>Грант #{grant.id}</Text>
                                <Text type="secondary">
                                  {t('remainingAmount')}: <Text strong>{remaining.toLocaleString()} ₽</Text>
                                </Text>
                              </Space>
                            </List.Item>
                          );
                        }}
                      />
                    )}
                  </div>

                  {selectedGrant && (
                    <div>
                      {/* Информация о смарт-контракте (правила расходования) */}
                      {loadingContract ? (
                        <div style={{ textAlign: 'center', padding: 20, marginBottom: 16 }}>
                          <Spin />
                          <div style={{ marginTop: 8 }}>Загрузка правил расходования...</div>
                        </div>
                      ) : contract && contract.spending_rules.length > 0 ? (
                        <Card
                          title={
                            <Space>
                              <FileTextOutlined style={{ color: token.colorPrimary }} />
                              <Text strong>Правила расходования средств</Text>
                              <Tag color={contract.status === 'active' ? 'green' : contract.status === 'inactive' ? 'default' : 'red'}>
                                {contract.status === 'active' ? 'Активен' : contract.status === 'inactive' ? 'Неактивен' : 'Истёк'}
                              </Tag>
                            </Space>
                          }
                          style={{
                            marginBottom: 16,
                            border: `2px solid ${token.colorPrimary}`,
                            backgroundColor: token.colorPrimaryBg,
                          }}
                          headStyle={{
                            backgroundColor: token.colorPrimaryBg,
                            borderBottom: `2px solid ${token.colorPrimary}`,
                          }}
                        >
                          <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Descriptions bordered column={1} size="small">
                              {contract.contract_number && (
                                <Descriptions.Item label="Номер контракта">
                                  <Text strong>{contract.contract_number}</Text>
                                </Descriptions.Item>
                              )}
                              <Descriptions.Item label="Общий бюджет">
                                <Text strong style={{ fontSize: 16, color: token.colorPrimary }}>
                                  {contract.total_budget.toLocaleString()} {contract.currency}
                                </Text>
                              </Descriptions.Item>
                              <Descriptions.Item label="Остаток бюджета">
                                <Text strong style={{ fontSize: 16, color: contract.remaining_budget > 0 ? token.colorSuccess : token.colorError }}>
                                  {contract.remaining_budget.toLocaleString()} {contract.currency}
                                </Text>
                              </Descriptions.Item>
                              {contract.valid_until && (
                                <Descriptions.Item label="Действителен до">
                                  {new Date(contract.valid_until).toLocaleDateString('ru-RU')}
                                </Descriptions.Item>
                              )}
                            </Descriptions>

                            <Divider style={{ margin: '8px 0' }} />

                            <div>
                              <Text strong style={{ marginBottom: 12, display: 'block', fontSize: 16 }}>
                                Разрешённые категории и товары:
                              </Text>
                              <List
                                dataSource={contract.spending_rules}
                                renderItem={(rule, index) => (
                                  <List.Item style={{ padding: '12px 0', borderBottom: index < contract.spending_rules.length - 1 ? `1px solid ${token.colorBorder}` : 'none' }}>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                      <Space>
                                        <Text strong style={{ fontSize: 15 }}>
                                          {rule.category_name || `Категория #${rule.category_id}`}
                                        </Text>
                                        {rule.max_amount && (
                                          <Tag color="blue">
                                            До {rule.max_amount.toLocaleString()} ₽
                                          </Tag>
                                        )}
                                      </Space>
                                      {rule.product_types && rule.product_types.length > 0 && (
                                        <div>
                                          <Text type="secondary" style={{ marginRight: 8 }}>Типы товаров:</Text>
                                          {rule.product_types.map((type, i) => (
                                            <Tag key={i} color="cyan" style={{ marginTop: 4 }}>
                                              {type}
                                            </Tag>
                                          ))}
                                        </div>
                                      )}
                                      {rule.allowed_models && rule.allowed_models.length > 0 && (
                                        <div>
                                          <Text type="secondary" style={{ marginRight: 8 }}>Разрешённые модели:</Text>
                                          {rule.allowed_models.map((model, i) => (
                                            <Tag key={i} color="green" style={{ marginTop: 4 }}>
                                              {model}
                                            </Tag>
                                          ))}
                                        </div>
                                      )}
                                    </Space>
                                  </List.Item>
                                )}
                              />
                            </div>
                          </Space>
                        </Card>
                      ) : null}

                      <Title level={5}>{t('selectCategory')}</Title>
                      {loadingGroups ? (
                        <div style={{ textAlign: 'center', padding: 20 }}>
                          <Spin />
                        </div>
                      ) : purchaseGroups.length === 0 ? (
                        <Empty description={t('noItems')} />
                      ) : (
                        <Collapse
                          accordion
                          activeKey={selectedGroup?.id ? [selectedGroup.id] : []}
                          onChange={(keys) => {
                            if (keys.length === 0) {
                              setSelectedGroup(null);
                              setGroupItems([]);
                            } else {
                              const groupId = Number(keys[0]);
                              const group = purchaseGroups.find((g) => g.id === groupId);
                              if (group) {
                                handleGroupSelect(group);
                              }
                            }
                          }}
                        >
                          {purchaseGroups.map((group) => (
                            <Panel key={group.id} header={<Text strong>{group.name}</Text>}>
                              {selectedGroup?.id === group.id && (
                                <div>
                                  {loadingItems ? (
                                    <div style={{ textAlign: 'center', padding: 20 }}>
                                      <Spin />
                                    </div>
                                  ) : groupItems.length === 0 ? (
                                    <Empty description={t('noItems')} />
                                  ) : (
                                    <List
                                      dataSource={groupItems.filter((item) => item.purchase_group_id === group.id)}
                                      renderItem={(item) => {
                                        const statusConfig = getStatusConfig(item.status);
                                        
                                        return (
                                          <List.Item>
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                <Text strong>{item.product_name}</Text>
                                                <Tag color={statusConfig.color} icon={statusConfig.icon}>
                                                  {statusConfig.text}
                                                </Tag>
                                              </Space>
                                              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                <Text type="secondary">
                                                  {t('quantity')}: {item.quantity}
                                                </Text>
                                                {item.receipt_url && (
                                                  <Button
                                                    type="link"
                                                    size="small"
                                                    icon={<DownloadOutlined />}
                                                    onClick={() => handleDownloadReceipt(item.receipt_url!)}
                                                  >
                                                    {t('downloadReceipt')}
                                                  </Button>
                                                )}
                                              </Space>
                                            </Space>
                                          </List.Item>
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              )}
                            </Panel>
                          ))}
                        </Collapse>
                      )}
                    </div>
                  )}
                </Space>
              </Card>
            ) : (
              <Card
                title={t('userInfoTitle')}
                style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Empty description={t('userNotSelected')} />
                </div>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminPage;