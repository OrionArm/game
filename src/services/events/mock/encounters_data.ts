import type { EncounterEvent } from '../type';

export const encounterData: EncounterEvent[] = [
  {
    eventId: 'OBJ01',
    type: 'npc_encounter',
    title: 'Старый друг (чат)',
    description:
      'Групповой чат друзей и сбор денег на подарок. Важна проверка личности и безопасный способ оплаты.',
    imageUrl: '/public/art/obj_old_friend.png',
    topic: 'Антифрод/социнжиниринг',
    position: 3,
    dialogId: 'CH01_S1',
  },
  {
    eventId: 'OBJ02',
    type: 'npc_encounter',
    title: 'Переезд: услуги и объявления',
    description:
      'Поиск грузчиков и доставки через объявления. Риски предоплаты и фиктивных исполнителей.',
    imageUrl: '/public/art/obj_move.png',
    topic: 'Бюджет/антифрод',
    position: 10,
    dialogId: 'CH01_S1',
  },
  {
    eventId: 'OBJ06',
    type: 'npc_encounter',
    title: 'Курс мечты: обучение и подписка',
    description:
      'Онлайн-курс с пробным периодом. Нужна дисциплина и настройка напоминаний, чтобы не переплачивать.',
    imageUrl: '/public/art/obj_course.png',
    topic: 'Подписки/долгосрочные цели',
    position: 15,
    dialogId: 'CH06_S1',
  },
  {
    eventId: 'OBJ03',
    type: 'npc_encounter',
    title: 'Большая техника: покупка и гарантия',
    description:
      'Магазин техники, расширенная гарантия и возвраты. Важно читать условия и проверять продавца.',
    imageUrl: '/public/art/obj_electronics.png',
    topic: 'Партнёры/страхование',
    position: 25,
    dialogId: 'CH03_S1',
  },
  {
    eventId: 'OBJ04',
    type: 'npc_encounter',
    title: 'Путешествие: подготовка',
    description:
      'Билеты, зарубежные платежи, связь и страховка. Подготовка экономит деньги и нервы.',
    imageUrl: '/public/art/obj_trip.png',
    topic: 'Платежи/валюта/страховка',
    position: 35,
    dialogId: 'CH04_S1',
  },
  {
    eventId: 'OBJ05',
    type: 'npc_encounter',
    title: 'Дорога и заправки',
    description:
      'План маршрута, платные дороги и топливо у партнёров. Осторожнее с фейковыми уведомлениями о штрафах.',
    imageUrl: '/public/art/obj_road.png',
    topic: 'Партнёры/штрафы/QR',
    position: 50,
    dialogId: 'CH05_S1',
  },
];
