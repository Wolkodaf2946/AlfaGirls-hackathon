import React, { useEffect, useState } from 'react';
import {
  Card,
  List,
  Typography,
  Space,
  Button,
  theme,
  message,
  Spin,
  Tag,
  Upload,
  Modal,
  Empty,
  Collapse,
  Descriptions,
  Divider,
} from 'antd';
import {
  QrcodeOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
// import { fetchUserGrants, fetchPurchaseGroups, fetchGroupItems, scanQRCode, uploadReceipt } from '../../services/grantService'; // Раскомментируйте для реального API
import { scanQRCode } from '../../services/grantService';
// import { uploadReceipt } from '../../services/grantService'; // Раскомментируйте для реального API
import type { Grant, PurchaseGroup, GroupItem, QRScanResult } from '../../models/grant';
import type { SmartContract } from '../../models/contract';
import { getMockContract } from '../../services/contractService';
// import { fetchContractByGrantId } from '../../services/contractService'; // Раскомментируйте для реального API

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Мок-данные для тестирования
const MOCK_GRANTS: Grant[] = [
  {
    id: 1,
    grantor_id: 1,
    granter_id: 2,
    total_amount: 100000,
    must: 75000,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    grantor_id: 1,
    granter_id: 2,
    total_amount: 50000,
    must: 50000,
    created_at: '2024-02-20T14:30:00Z',
  },
];

const MOCK_PURCHASE_GROUPS: Record<number, PurchaseGroup[]> = {
  1: [
    { id: 1, grant_id: 1, category_id: 1, name: 'Закупка техники для школы', created_at: '2024-01-16T10:00:00Z' },
    { id: 2, grant_id: 1, category_id: 2, name: 'Садовый инвентарь', created_at: '2024-01-17T10:00:00Z' },
  ],
  2: [
    { id: 3, grant_id: 2, category_id: 1, name: 'Компьютерное оборудование', created_at: '2024-02-21T10:00:00Z' },
  ],
};

const MOCK_GROUP_ITEMS: Record<number, GroupItem[]> = {
  1: [
    { id: 1, purchase_group_id: 1, product_name: 'Ноутбук Honor MagicBook 16', quantity: 5, status: 'completed' },
    { id: 2, purchase_group_id: 1, product_name: 'Мышь беспроводная', quantity: 10, status: 'processing' },
    { id: 3, purchase_group_id: 1, product_name: 'Клавиатура механическая', quantity: 8, status: 'not_purchased' },
  ],
  2: [
    { id: 4, purchase_group_id: 2, product_name: 'Газонокосилка электрическая', quantity: 2, status: 'completed' },
    { id: 5, purchase_group_id: 2, product_name: 'Садовые ножницы', quantity: 5, status: 'contract_error' },
  ],
  3: [
    { id: 6, purchase_group_id: 3, product_name: 'Монитор 27 дюймов', quantity: 3, status: 'not_purchased' },
  ],
};

const UserPage: React.FC = () => {
  const { token } = theme.useToken();
  const { t, currentUser } = useApp();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loadingGrants, setLoadingGrants] = useState(true);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [purchaseGroups, setPurchaseGroups] = useState<PurchaseGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<PurchaseGroup | null>(null);
  const [groupItems, setGroupItems] = useState<GroupItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrScanning, setQrScanning] = useState(false);
  const [qrResult, setQrResult] = useState<QRScanResult | null>(null);
  const [receiptUploading, setReceiptUploading] = useState<number | null>(null);
  const [approvedScans, setApprovedScans] = useState<Set<number>>(new Set());
  const [contract, setContract] = useState<SmartContract | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    
    // Используем мок-данные для тестирования
    const loadGrants = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setGrants(MOCK_GRANTS);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          message.error('Не удалось загрузить гранты');
        }
      } finally {
        setLoadingGrants(false);
      }
    };

    // Раскомментируйте для использования реального API:
    // if (currentUser?.id) {
    //   fetchUserGrants(currentUser.id, controller.signal)
    //     .then((data) => setGrants(data))
    //     .catch((err) => {
    //       if (err.name !== 'AbortError') {
    //         message.error('Не удалось загрузить гранты');
    //       }
    //     })
    //     .finally(() => setLoadingGrants(false));
    // }

    loadGrants();

    return () => controller.abort();
  }, [currentUser]);

  const handleGrantSelect = async (grant: Grant) => {
    setSelectedGrant(grant);
    setSelectedGroup(null);
    setGroupItems([]);
    setContract(null);
    setLoadingGroups(true);
    setLoadingContract(true);

    try {
      // Мок-данные
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
    setLoadingContract(true);
    setContract(null);

    try {
      // Мок-данные
      await new Promise((resolve) => setTimeout(resolve, 300));
      setGroupItems(MOCK_GROUP_ITEMS[group.id] || []);
      
      // Раскомментируйте для реального API:
      // const items = await fetchGroupItems(group.id);
      // setGroupItems(items);
      
    } catch {
      message.error('Не удалось загрузить товары');
    } finally {
      setLoadingItems(false);
      setLoadingContract(false);
    }
  };

  const handleScanQR = async () => {
    setQrScanning(true);
    setQrModalVisible(true);
    setQrResult(null);

    try {
      const result = await scanQRCode();
      setQrResult(result);
      
      if (result.approved) {
        message.success(t('qrScanSuccess'));
        // После успешного сканирования помечаем, что нужно загрузить чек
        // В реальном приложении здесь будет логика определения категории по QR-коду
        setApprovedScans((prev) => new Set(prev).add(Date.now()));
      } else {
        message.warning(t('qrScanRejected'));
      }
    } catch {
      message.error('Ошибка при сканировании QR-кода');
    } finally {
      setQrScanning(false);
    }
  };

  const handleReceiptUpload = async (file: File, purchaseGroupId: number) => {
    setReceiptUploading(purchaseGroupId);
    
    try {
      // Имитация загрузки
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Раскомментируйте для реального API:
      // await uploadReceipt(purchaseGroupId, file);
      
      message.success(t('receiptUploaded'));
      
      // Убираем из списка ожидающих загрузки чека
      setApprovedScans(new Set());
      
      // Обновляем статус товаров в группе
      setGroupItems((prev) =>
        prev.map((item) =>
          item.purchase_group_id === purchaseGroupId
            ? { ...item, status: 'processing' as const, receipt_url: 'uploaded' }
            : item
        )
      );
    } catch {
      message.error(t('receiptUploadError'));
    } finally {
      setReceiptUploading(null);
    }
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
        return { color: 'purple', icon: <ExclamationCircleOutlined />, text: t('statusContractError') };
      default:
        return { color: 'red', icon: <CloseCircleOutlined />, text: t('statusNotPurchased') };
    }
  };

  const getGroupStatus = (groupId: number) => {
    const items = groupItems.filter((item) => item.purchase_group_id === groupId);
    
    // Если есть успешные QR сканирования и нет загруженных чеков, показываем необходимость загрузки
    const hasApprovedScan = approvedScans.size > 0;
    const hasReceipt = items.some((item) => item.receipt_url);
    
    if (hasApprovedScan && !hasReceipt) {
      return 'processing';
    }
    
    if (items.length === 0) return null;
    
    const hasProcessing = items.some((item) => item.status === 'processing' && !item.receipt_url);
    return hasProcessing ? 'processing' : null;
  };

  const userName = currentUser?.fullName || currentUser?.username || 'Пользователь';

  return (
    <div
      style={{
        padding: 24,
        height: '100vh',
        backgroundColor: token.colorBgLayout,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
        <Title level={2} style={{ margin: 0 }}>{userName}</Title>
        <Button
          type="primary"
          icon={<QrcodeOutlined />}
          size="large"
          onClick={handleScanQR}
        >
          {t('scanQRCode')}
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card title={t('myGrants')}>
          {loadingGrants ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>{t('loadingGrants')}</div>
            </div>
          ) : grants.length === 0 ? (
            <Empty description={t('noGrants')} />
          ) : (
            <List
              dataSource={grants}
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
                      padding: 16,
                      marginBottom: 8,
                      backgroundColor: isSelected ? token.colorPrimaryBgHover : token.colorBgContainer,
                    }}
                  >
                    <div style={{ width: '100%' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text strong>Грант #{grant.id}</Text>
                        <Text type="secondary">
                          {t('remainingAmount')}: <Text strong>{remaining.toLocaleString()} ₽</Text>
                        </Text>
                      </Space>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        {selectedGrant && (
          <>
            {/* Информация о смарт-контракте (правила расходования) */}
            {loadingContract ? (
              <Card>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Spin />
                  <div style={{ marginTop: 8 }}>Загрузка правил расходования...</div>
                </div>
              </Card>
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

            <Card title={t('selectCategory')}>
              {loadingGroups ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                </div>
              ) : purchaseGroups.length === 0 ? (
                <Empty description={t('noItems')} />
              ) : (
              <Collapse
                accordion
                activeKey={selectedGroup?.id ? [selectedGroup.id] : []}
                onChange={(keys) => {
                  if (!keys || (Array.isArray(keys) && keys.length === 0)) {
                    setSelectedGroup(null);
                    setGroupItems([]);
                    return;
                  }

                  const nextKey = Array.isArray(keys) ? keys[keys.length - 1] : keys;

                  const groupId = Number(nextKey);

                  if (Number.isNaN(groupId)) {
                    setSelectedGroup(null);
                    setGroupItems([]);
                    return;
                  }

                  const group = purchaseGroups.find((g) => g.id === groupId);
                  if (group) {
                    handleGroupSelect(group);
                  }
                }}
              >
                {purchaseGroups.map((group) => {
                  const groupStatus = getGroupStatus(group.id);
                  const needsReceipt = groupStatus === 'processing';
                  
                  return (
                    <Panel
                      key={group.id}
                      header={
                        <Space>
                          <Text strong>{group.name}</Text>
                          {needsReceipt && (
                            <Tag color="orange">{t('confirmOperation')}</Tag>
                          )}
                        </Space>
                      }
                    >
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
                                      <Text type="secondary">
                                        {t('quantity')}: {item.quantity}
                                      </Text>
                                    </Space>
                                  </List.Item>
                                );
                              }}
                            />
                          )}
                          
                          {needsReceipt && (
                            <div style={{ marginTop: 16, padding: 16, backgroundColor: token.colorWarningBg, borderRadius: 8 }}>
                              <Space direction="vertical" style={{ width: '100%' }}>
                                <Text strong>{t('uploadReceipt')}</Text>
                                <Upload
                                  beforeUpload={(file) => {
                                    handleReceiptUpload(file, group.id);
                                    return false;
                                  }}
                                  showUploadList={false}
                                  disabled={receiptUploading === group.id}
                                >
                                  <Button
                                    icon={<UploadOutlined />}
                                    loading={receiptUploading === group.id}
                                  >
                                    {t('uploadReceipt')}
                                  </Button>
                                </Upload>
                              </Space>
                            </div>
                          )}
                        </div>
                      )}
                    </Panel>
                  );
                })}
              </Collapse>
            )}
          </Card>
          </>
        )}
      </div>

      <Modal
        title={t('scanQRCode')}
        open={qrModalVisible}
        onCancel={() => {
          setQrModalVisible(false);
          setQrResult(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setQrModalVisible(false);
            setQrResult(null);
          }}>
            Закрыть
          </Button>,
        ]}
      >
        {qrScanning ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>{t('scanningQR')}</div>
          </div>
        ) : qrResult ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>
              <Text strong>Счет:</Text> {qrResult.user_account}
            </Text>
            <Text>
              <Text strong>Сумма:</Text> {qrResult.amount.toLocaleString()} ₽
            </Text>
            <Text>
              <Text strong>Продавец:</Text> {qrResult.merchant_name}
            </Text>
            <Tag color={qrResult.approved ? 'green' : 'red'} style={{ marginTop: 8 }}>
              {qrResult.approved ? t('qrScanSuccess') : t('qrScanRejected')}
            </Tag>
            {qrResult.approved && (
              <div style={{ marginTop: 16, padding: 16, backgroundColor: token.colorInfoBg, borderRadius: 8 }}>
                <Text>{t('confirmOperation')}</Text>
              </div>
            )}
          </Space>
        ) : (
          <Text>Нажмите кнопку для сканирования</Text>
        )}
      </Modal>
    </div>
  );
};

export default UserPage;

