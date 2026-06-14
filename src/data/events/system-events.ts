import type { GameEvent } from '@/types'

export const SYSTEM_EVENTS: GameEvent[] = [
  {
    id: 'system_stress_crisis',
    title: 'Breaking Point',
    description: "The weight of everything crashes down at once. Weeks of sleepless nights, impossible decisions, and constant fear have taken their toll. Your body and mind refuse to keep going.",
    sceneType: 'home',
    interruptPriority: 'important',
    timing: { type: 'triggered' },
    conditions: [],
    weight: 0,
    choices: [
      {
        id: 'seek_help',
        text: 'Call a crisis counselor and reach out for support',
        outcomes: [
          { type: 'stat-change', target: 'stress', value: -25 },
          { type: 'stat-change', target: 'communityConnection', value: 10 },
        ],
        outcomeText: "Asking for help is harder than it looks. The counselor listens without judgment. You don't have to carry this alone — and slowly, the vice grip around your chest loosens.",
        isRecommended: true,
      },
      {
        id: 'take_leave',
        text: 'Take unpaid time off to recover',
        outcomes: [
          { type: 'stat-change', target: 'stress', value: -30 },
          { type: 'stat-change', target: 'health', value: -10 },
          { type: 'finance-subtract', target: 'Lost wages during recovery', value: 800 },
        ],
        outcomeText: "You spend a week unable to function — sleeping, staring at the ceiling, letting the silence be. When you finally get up, you can breathe again. But the unpaid days bite hard.",
      },
      {
        id: 'push_through',
        text: "Push through — you can't afford to stop",
        outcomes: [
          { type: 'stat-change', target: 'stress', value: -15 },
          { type: 'stat-change', target: 'health', value: -20 },
        ],
        outcomeText: "You keep moving. Medicate the symptoms. Smile when you need to. The stress drops just enough to function, but the damage to your body is real. You'll pay for this later.",
        isDangerous: true,
      },
    ],
    tags: ['mental-health', 'crisis', 'burnout'],
    isRepeatable: false,
    isMandatory: false,
    priority: 9,
  },
]
