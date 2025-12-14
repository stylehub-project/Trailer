export interface Scene {
  id: number;
  start: number; // Start time in seconds
  end: number;   // End time in seconds
  lines: string[];
  subText?: string;
  type: 'intro' | 'stack' | 'hero' | 'impact' | 'final' | 'glitch';
  soundEffect?: 'boom' | 'whoosh' | 'rise' | 'glitch' | 'ambient';
}

export const SCENES: Scene[] = [
  {
    id: 1,
    start: 0,
    end: 4,
    lines: ['PRESENTING'],
    type: 'intro',
    soundEffect: 'ambient'
  },
  {
    id: 2,
    start: 4,
    end: 8,
    lines: ['A HI-TECH', 'BRAND NEW', 'ENGINE'],
    type: 'stack',
    soundEffect: 'boom'
  },
  {
    id: 3,
    start: 8,
    end: 13,
    lines: ['FOR YOU'],
    subText: 'Built for the next generation of news',
    type: 'hero',
    soundEffect: 'rise'
  },
  {
    id: 4,
    start: 13,
    end: 18,
    lines: ['LAUNCHING', 'SOON'],
    subText: 'THIS UPCOMING YEAR',
    type: 'impact',
    soundEffect: 'whoosh'
  },
  {
    id: 5,
    start: 18,
    end: 22,
    lines: ['2026'],
    type: 'impact',
    soundEffect: 'boom'
  },
  {
    id: 6,
    start: 22,
    end: 28,
    lines: ['INTRODUCING', 'A SMART,', 'UNIQUE,', 'AND PREMIUM', 'PLATFORM'],
    type: 'stack',
    soundEffect: 'whoosh'
  },
  {
    id: 7,
    start: 28,
    end: 34,
    lines: ['FOR NEWS'],
    subText: 'Beyond headlines. Beyond limits.',
    type: 'hero',
    soundEffect: 'rise'
  },
  {
    id: 8,
    start: 34,
    end: 40,
    lines: ['READY', 'TO', 'EXPERIENCE', '&', 'USE'],
    type: 'glitch',
    soundEffect: 'glitch'
  },
  {
    id: 9,
    start: 40,
    end: 45,
    lines: ['A SPECIAL', 'SOFTWARE', 'DESIGNED', 'FOR YOU'],
    type: 'stack',
    soundEffect: 'whoosh'
  },
  {
    id: 10,
    start: 45,
    end: 52,
    lines: ['BEYOND', 'IMAGINATION'],
    subText: 'Beyond thinking',
    type: 'hero',
    soundEffect: 'rise'
  },
  {
    id: 11,
    start: 52,
    end: 60,
    lines: ['BY', 'STYLE HUB'],
    subText: 'Your demand. Our creation.',
    type: 'final',
    soundEffect: 'boom'
  }
];