import type { WorldEvent, WorldEventType } from './type';

// Функции создания мировых событий
export const createNewsEvent = (eventId: string): WorldEvent => {
  const news = [
    {
      title: 'Новости из города',
      description: 'Путник рассказывает о событиях в ближайшем городе',
    },
    {
      title: 'Слухи',
      description: 'Вы слышите интересные слухи о местных событиях',
    },
  ];

  const newsItem = news[Math.floor(Math.random() * news.length)];

  return {
    eventId: eventId,
    type: 'news',
    title: newsItem.title,
    description: newsItem.description,
    imageUrl: '/npc.svg',
    topic: 'Знания/советы',
  };
};

export const createDisasterEvent = (eventId: string): WorldEvent => {
  return {
    eventId: eventId,
    type: 'disaster',
    title: 'Беда в регионе',
    description: 'До вас доходят слухи о бедствии в соседних землях',
    imageUrl: '/monster.svg',
    topic: 'Антифрод/осознанность',
  };
};

export const createCelebrationEvent = (eventId: string): WorldEvent => {
  return {
    eventId: eventId,
    type: 'celebration',
    title: 'Праздник',
    description: 'В воздухе витает атмосфера праздника',
    imageUrl: '/npc.svg',
    topic: 'Партнёры/кэшбэк',
  };
};

export const createMysteryEvent = (eventId: string): WorldEvent => {
  return {
    eventId: eventId,
    type: 'mystery',
    title: 'Загадка',
    description: 'Что-то странное происходит в мире вокруг вас',
    imageUrl: '/npc.svg',
    topic: 'Антифрод/социнжиниринг',
  };
};

export const createOpportunityEvent = (eventId: string): WorldEvent => {
  return {
    eventId: eventId,
    type: 'opportunity',
    title: 'Возможность',
    description: 'Представляется интересная возможность',
    imageUrl: '/npc.svg',
    topic: 'Инвестиции',
  };
};

// Map для связи типов событий с функциями создания
export const worldEventCreators: Map<WorldEventType, (eventId: string) => WorldEvent> = new Map([
  ['news', createNewsEvent],
  ['disaster', createDisasterEvent],
  ['celebration', createCelebrationEvent],
  ['mystery', createMysteryEvent],
  ['opportunity', createOpportunityEvent],
]);
