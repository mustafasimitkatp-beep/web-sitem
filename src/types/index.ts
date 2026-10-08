export type GameId = 'farm' | 'city' | 'tank' | 'runner' | 'breaker';

export interface GameMetadata {
  id: GameId;
  title: string;
  tagline: string;
  category: 'Açık Dünya & Çiftlik' | 'Sandbox & Strateji' | '2 Kişilik & Versus' | 'Aksiyon & Koşu' | 'Retro Arcade';
  players: '1 Oyuncu' | '2 Kişilik (Aynı PC)' | '1 veya 2 Oyuncu';
  coverImage: string;
  description: string;
  controlsHelp: {
    key: string;
    action: string;
  }[];
  features: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  highScores: {
    farm: number;
    city: number;
    tank: number;
    runner: number;
    breaker: number;
  };
  gamesPlayedCount: number;
  achievements: string[];
  isGuest: boolean;
  joinedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  gameId: GameId;
  username: string;
  avatar: string;
  score: number;
  date: string;
  rank?: number;
  isCurrentUser?: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  siteTagline: string;
  logoIcon: string;
  customLogoUrl: string;
  // Advertisements
  topBanner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    badge: string;
    linkUrl: string;
    imageUrl?: string;
    ctaText: string;
  };
  sidebarBanner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    badge: string;
    linkUrl: string;
    imageUrl?: string;
    ctaText: string;
  };
  inGameBanner: {
    enabled: boolean;
    title: string;
    linkUrl: string;
  };
}
