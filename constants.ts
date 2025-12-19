export interface Scene {
  id: number;
  start: number; // Start time in seconds
  end: number;   // End time in seconds
  lines: string[];
  subText?: string;
  type: 'intro' | 'stack' | 'hero' | 'impact' | 'final' | 'glitch' | 'teaser';
  soundEffect?: 'boom' | 'whoosh' | 'blast' | 'glitch' | 'ambient';
}

export const SCENES: Scene[] = [
  // --- PRE-TRAILER NETWORK MONTAGE ---
  {
    id: 101,
    start: 0,
    end: 3,
    lines: ['INITIALIZING', 'THE HUB NETWORK'],
    type: 'intro',
    soundEffect: 'ambient'
  },
  {
    id: 102,
    start: 3,
    end: 6,
    lines: ['MULTIPLE REALITIES', 'DETECTED'],
    type: 'glitch',
    soundEffect: 'glitch'
  },
  {
    id: 103,
    start: 6,
    end: 8.5,
    lines: ['UPCOMING: CINEMA HUB'],
    subText: 'EXPLORE THE NEW ERA OF FILM // 2026',
    type: 'teaser',
    soundEffect: 'whoosh'
  },
  {
    id: 104,
    start: 8.5,
    end: 11,
    lines: ['UPCOMING: TECH HUB'],
    subText: 'HARDWARE REDEFINED // 2026',
    type: 'teaser',
    soundEffect: 'whoosh'
  },
  {
    id: 105,
    start: 11,
    end: 13.5,
    lines: ['UPCOMING: AI HUB'],
    subText: 'BEYOND SYNTHETIC THOUGHT // 2027',
    type: 'teaser',
    soundEffect: 'whoosh'
  },
  {
    id: 106,
    start: 13.5,
    end: 16,
    lines: ['ACCESSING PRIMARY NODE...'],
    type: 'glitch',
    soundEffect: 'glitch'
  },
  // --- MAIN STYLE HUB TRAILER (Shifted forward by 16 seconds) ---
  {
    id: 1,
    start: 16,
    end: 20,
    lines: ['IN THE SILENCE'],
    type: 'intro',
    soundEffect: 'ambient'
  },
  {
    id: 2,
    start: 20,
    end: 24,
    lines: ['A NEW VISION'],
    type: 'intro',
    soundEffect: 'whoosh'
  },
  {
    id: 3,
    start: 24,
    end: 29,
    lines: ['FROM THE MINDS AT', 'STYLE HUB'],
    subText: 'Innovation starts with a single thought',
    type: 'hero',
    soundEffect: 'boom'
  },
  {
    id: 4,
    start: 29,
    end: 32,
    lines: ['PRESENTING'],
    type: 'intro',
    soundEffect: 'whoosh'
  },
  {
    id: 5,
    start: 32,
    end: 36,
    lines: ['THE NEXT', 'GENERATION', 'OF NEWS'],
    type: 'stack',
    soundEffect: 'blast'
  },
  {
    id: 6,
    start: 36,
    end: 40,
    lines: ['SPEED'],
    type: 'impact',
    soundEffect: 'boom'
  },
  {
    id: 7,
    start: 40,
    end: 44,
    lines: ['ACCURACY'],
    type: 'impact',
    soundEffect: 'boom'
  },
  {
    id: 8,
    start: 44,
    end: 48,
    lines: ['ELEGANCE'],
    type: 'impact',
    soundEffect: 'boom'
  },
  {
    id: 9,
    start: 48,
    end: 53,
    lines: ['A HI-TECH ENGINE'],
    subText: 'Engineered for clarity',
    type: 'hero',
    soundEffect: 'blast'
  },
  {
    id: 10,
    start: 53,
    end: 58,
    lines: ['REDEFINING', 'THE WAY', 'YOU SEE'],
    type: 'stack',
    soundEffect: 'whoosh'
  },
  {
    id: 11,
    start: 58,
    end: 62,
    lines: ['THE WORLD'],
    subText: 'Unfiltered. Unbiased. Unmatched.',
    type: 'hero',
    soundEffect: 'blast'
  },
  {
    id: 12,
    start: 62,
    end: 66,
    lines: ['2026'],
    type: 'impact',
    soundEffect: 'boom'
  },
  {
    id: 13,
    start: 66,
    end: 71,
    lines: ['READY TO', 'EXPERIENCE', 'THE FUTURE'],
    type: 'glitch',
    soundEffect: 'glitch'
  },
  {
    id: 14,
    start: 71,
    end: 76,
    lines: ['A SMART,', 'UNIQUE,', 'AND PREMIUM', 'PLATFORM'],
    type: 'stack',
    soundEffect: 'whoosh'
  },
  {
    id: 15,
    start: 76,
    end: 82,
    lines: ['FOR YOU'],
    subText: 'Because information is a luxury.',
    type: 'hero',
    soundEffect: 'blast'
  },
  {
    id: 16,
    start: 82,
    end: 88,
    lines: ['BEYOND', 'IMAGINATION'],
    subText: 'Beyond thinking',
    type: 'hero',
    soundEffect: 'blast'
  },
  {
    id: 17,
    start: 88,
    end: 96,
    lines: ['STYLE HUB', '2026'],
    subText: 'Your demand. Our creation.',
    type: 'final',
    soundEffect: 'boom'
  }
];
