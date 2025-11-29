/**
 * Правило расходования средств в смарт-контракте
 */
export interface SpendingRule {
  category_id: number; // ID категории, на которую можно тратить
  category_name?: string; // Название категории (для отображения)
  product_types?: string[]; // Типы товаров (например, ["ноутбуки", "мониторы"])
  allowed_models?: string[]; // Разрешённые модели (опционально, например, ["Honor MagicBook 16", "Lenovo ThinkPad"])
  max_amount?: number; // Максимальная сумма на эту категорию (опционально)
}

/**
 * Модель смарт-контракта
 * Смарт-контракт содержит набор правил, по которым можно тратить деньги по гранту
 */
export interface SmartContract {
  id: number;
  grant_id: number; // ID гранта, к которому относится контракт
  contract_number?: string; // Номер контракта (опционально)
  status: 'active' | 'inactive' | 'expired';
  
  // Правила расходования средств
  spending_rules: SpendingRule[];
  
  // Общая информация
  total_budget: number; // Общий бюджет по контракту
  remaining_budget: number; // Оставшийся бюджет
  currency: string; // Валюта (RUB)
  
  // Даты
  created_at: string; // Дата создания контракта
  valid_from?: string; // Действителен с
  valid_until?: string; // Действителен до
}
