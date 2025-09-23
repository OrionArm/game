-- Примеры предметов для финансовой игры

-- Недвижимость
INSERT INTO items (name, description, type, subtype, rarity, stats, value, stackable, requires_item) VALUES
('Квартира в центре', 'Уютная квартира в центре города', 'property', 'house', 'rare', '{"area": 50, "rooms": 2, "monthly_income": 500}', 50000, false, null),
('Загородный дом', 'Просторный дом за городом', 'property', 'house', 'epic', '{"area": 150, "rooms": 4, "monthly_income": 1200}', 150000, false, null);

-- Транспорт
INSERT INTO items (name, description, type, subtype, rarity, stats, value, stackable, requires_item) VALUES
('Toyota Camry', 'Надежный седан', 'vehicle', 'car', 'common', '{"year": 2020, "mileage": 50000, "fuel_consumption": 8}', 25000, false, null),
('Honda CBR600', 'Спортивный мотоцикл', 'vehicle', 'motorcycle', 'rare', '{"year": 2021, "mileage": 10000, "fuel_consumption": 5}', 15000, false, null),
('BMW X5', 'Премиальный внедорожник', 'vehicle', 'car', 'epic', '{"year": 2022, "mileage": 20000, "fuel_consumption": 12}', 80000, false, null);

-- Банковские карты
INSERT INTO items (name, description, type, subtype, rarity, stats, value, stackable, requires_item) VALUES
('Дебетовая карта', 'Основная карта для повседневных трат', 'card', 'debit_card', 'common', '{"limit": 0, "interest_rate": 0, "cashback": 1}', 0, false, null),
('Кредитная карта', 'Кредитная карта с лимитом', 'card', 'credit_card', 'rare', '{"limit": 100000, "interest_rate": 25, "cashback": 2}', 0, false, null),
('Платиновая карта', 'Премиальная кредитная карта', 'card', 'credit_card', 'epic', '{"limit": 500000, "interest_rate": 20, "cashback": 5}', 0, false, null);

-- Вклады и кредиты
INSERT INTO items (name, description, type, subtype, rarity, stats, value, stackable, requires_item) VALUES
('Сберегательный вклад', 'Вклад под проценты', 'deposit', 'deposit', 'common', '{"amount": 0, "interest_rate": 8, "term_months": 12}', 0, false, null),
('Ипотечный кредит', 'Кредит на покупку недвижимости', 'loan', 'mortgage', 'rare', '{"amount": 0, "interest_rate": 12, "term_months": 240}', 0, false, null),
('Потребительский кредит', 'Кредит на любые цели', 'loan', 'consumer_loan', 'common', '{"amount": 0, "interest_rate": 18, "term_months": 36}', 0, false, null);

-- Страховки
INSERT INTO items (name, description, type, subtype, rarity, stats, value, stackable, requires_item) VALUES
('Страховка автомобиля', 'КАСКО для автомобиля', 'insurance', 'vehicle_insurance', 'common', '{"coverage": 100000, "premium": 5000, "deductible": 10000}', 5000, false, null),
('Страховка недвижимости', 'Страховка дома/квартиры', 'insurance', 'property_insurance', 'common', '{"coverage": 200000, "premium": 2000, "deductible": 5000}', 2000, false, null);
