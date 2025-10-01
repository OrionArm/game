import type { StepEvent } from '../type';

export const stepEventData: StepEvent[] = [
  {
    eventId: 'E004',
    type: 'StepEvent',
    title: 'Старый друг: разговор начистоту',
    description:
      'Настоящий друг благодарит за осторожность. Вы делитесь выводами и договариваетесь быть внимательнее к звонкам и сообщениям.',
    imageUrl: '/public/art/old_friend_safe.png',
    topic: 'Антифрод/осознанность',
    dialog: [
      {
        id: 'E004-dialog',
        speaker: 'Система',
        text: 'Настоящий друг благодарит за осторожность. Вы делитесь выводами и договариваетесь быть внимательнее к звонкам и сообщениям.',
        options: [
          {
            id: 'E004-option-a',
            text: 'Порекомендовать включить антифрод-советы в приложении',
            effects: {
              gold: -50,
              health: -10,
              cristal: 100,
              energy: 10,
              prize: {},
              note: 'Сделали мир каплей безопаснее',
              itemsGain: [],
              itemsLose: [],
              flagsUnset: ['friendLegitHint', 'friendFact', 'friendContact', 'friendScamSpotted'],
              flagsSet: [],
            },
          },
          {
            id: 'E004-option-b',
            text: 'Поделиться памяткой о фишинге',
            requires: 'fin-advisor',
            effects: {
              gold: 0,
              health: 0,
              cristal: 1,
              energy: 0,
              prize: {},
              note: 'Знания дают кристаллы',
              itemsGain: [],
              itemsLose: [],
              flagsSet: [],
              flagsUnset: [],
            },
          },
          {
            id: 'E004-option-c',
            text: 'Сделать вид, что ничего не произошло',
            effects: {
              gold: 0,
              health: 0,
              cristal: 0,
              energy: 0,
              prize: {},
              note: '',
              itemsGain: [],
              itemsLose: [],
              flagsSet: [],
              flagsUnset: [],
            },
          },
          {
            id: 'E004-option-d',
            text: 'Удалить чаты и забыть',
            effects: {
              gold: 0,
              health: 0,
              cristal: 0,
              energy: 0,
              prize: {},
              note: 'Опыт всё равно остался',
              itemsGain: [],
              itemsLose: [],
              flagsSet: [],
              flagsUnset: [],
            },
          },
        ],
      },
    ],
    conditions: {
      requiresFlags: ['friendScamSpotted'],
      // afterEvents: ['E003'],
    },
    weight: 1,
  },
];
