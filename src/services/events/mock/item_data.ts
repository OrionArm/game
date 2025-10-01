export type ItemName =
  | 'Защитный PIN-чекер'
  | 'Полис-щит'
  | 'Бонус-карта партнёра'
  | 'Смарт-автоплатёж'
  | 'Антифрод-токен'
  | 'Подушка безопасности'
  | 'Целевой календарь'
  | 'Финсоветник';

export type ItemId =
  | 'pin-checker'
  | 'policy-shield'
  | 'bonus-card'
  | 'auto-payment'
  | 'anti-fraud-token'
  | 'safety-cushion'
  | 'target-calendar'
  | 'fin-advisor';

export type Item = {
  id: ItemId;
  name: ItemName;
  description: string;
  image: string;
};

export const mockItems: Item[] = [
  {
    id: 'pin-checker',
    name: 'Защитный PIN-чекер',
    description: 'Специальное устройство для безопасной проверки PIN-кодов',
    image: '/icons/pin-checker.svg',
  },
  {
    id: 'policy-shield',
    name: 'Полис-щит',
    description: 'Страховая защита от финансовых рисков',
    image: '/icons/policy-shield.svg',
  },
  {
    id: 'bonus-card',
    name: 'Бонус-карта партнёра',
    description: 'Карта с бонусными программами от партнёров банка',
    image: '/icons/bonus-card.svg',
  },
  {
    id: 'auto-payment',
    name: 'Смарт-автоплатёж',
    description: 'Автоматические платежи с умным управлением',
    image: '/icons/auto-payment.svg',
  },
  {
    id: 'anti-fraud-token',
    name: 'Антифрод-токен',
    description: 'Токен для защиты от мошеннических операций',
    image: '/icons/anti-fraud-token.svg',
  },
  {
    id: 'safety-cushion',
    name: 'Подушка безопасности',
    description: 'Финансовая подушка безопасности для непредвиденных расходов',
    image: '/icons/safety-cushion.svg',
  },
  {
    id: 'target-calendar',
    name: 'Целевой календарь',
    description: 'Календарь для планирования финансовых целей',
    image: '/icons/target-calendar.svg',
  },
  {
    id: 'fin-advisor',
    name: 'Финсоветник',
    description: 'Персональный финансовый консультант',
    image: '/icons/fin-advisor.svg',
  },
];
