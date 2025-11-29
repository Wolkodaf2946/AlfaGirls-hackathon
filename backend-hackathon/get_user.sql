WITH 
-- 1. Получаем базовую информацию о грантах пользователя
user_grants AS (
    SELECT 
        id,
        grant_name,
        total_amount,
        must
    FROM grants 
    WHERE granter_id = $1 -- $1 - это ID пользователя
),

-- 2. Собираем иерархию категорий и тип магазина
-- Мы джойним таблицу категорий саму на себя 2 раза, чтобы получить родителей (до прабабушки)
category_hierarchy AS (
    SELECT 
        c1.id AS leaf_id,
        -- Определяем тип магазина: берем от текущей категории или поднимаемся вверх по дереву
        COALESCE(st1.store_name, st2.store_name, st3.store_name) AS store_name,
        -- Формируем объект категории в зависимости от глубины вложенности
        json_build_object(
            'category',       COALESCE(c3.category_name, c2.category_name, c1.category_name),
            'subcategory',    CASE 
                                WHEN c3.id IS NOT NULL THEN c2.category_name 
                                WHEN c2.id IS NOT NULL THEN c1.category_name 
                                ELSE NULL 
                              END,
            'subsubcategory', CASE 
                                WHEN c3.id IS NOT NULL THEN c1.category_name 
                                ELSE NULL 
                              END
        ) AS category_json
    FROM categories c1
    LEFT JOIN categories c2 ON c1.parent_id = c2.id
    LEFT JOIN categories c3 ON c2.parent_id = c3.id
    LEFT JOIN store_types st1 ON c1.store_type_id = st1.id
    LEFT JOIN store_types st2 ON c2.store_type_id = st2.id
    LEFT JOIN store_types st3 ON c3.store_type_id = st3.id
),

-- 3. Собираем товары (groups из вашего JSON), привязанные к грантам пользователя
grant_items AS (
    SELECT 
        json_agg(
            json_build_object(
                'name', pg.name,
                'grant_id', pg.grant_id,
                'store_type', ch.store_name,
                'category', ch.category_json,
                'product_name', gi.product_name,
                'quantity', gi.quantity
            )
        ) AS items_json
    FROM group_items gi
    JOIN purchase_groups pg ON gi.purchase_group_id = pg.id
    JOIN user_grants ug ON pg.grant_id = ug.id
    LEFT JOIN category_hierarchy ch ON pg.category_id = ch.leaf_id
),

-- 4. Формируем JSON массив самих грантов
grants_list AS (
    SELECT 
        json_agg(
            json_build_object(
                'id', id,
                'name', grant_name,
                'total_amount', total_amount,
                'must', must
            )
        ) AS grants_json
    FROM user_grants
)

-- 5. Финальная сборка объекта пользователя
SELECT 
    json_build_object(
        'id', u.id,
        'full_name', u.full_name,
        'email', u.email,
        'bank_account_number', u.bank_account_number,
        'bank_card_number', u.bank_card_number,
        -- COALESCE нужен, чтобы вернуть пустой массив [], если записей нет, вместо null
        'grants', COALESCE((SELECT grants_json FROM grants_list), '[]'::json),
        'groups', COALESCE((SELECT items_json FROM grant_items), '[]'::json)
    ) AS result
FROM users u
WHERE u.id = $1;