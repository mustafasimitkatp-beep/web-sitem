import { GameMetadata, LeaderboardEntry, SiteSettings, UserProfile } from '../types';

export const GAMES_CATALOG: GameMetadata[] = [
  {
    id: 'farm',
    title: 'Yeşil Vadi Çiftliği: Açık Dünya',
    tagline: 'Geniş açık dünyada ürün ek, sula, hayvan besle ve pazarda sat!',
    category: 'Açık Dünya & Çiftlik',
    players: '1 Oyuncu',
    coverImage: '/src/assets/images/game_cover_farm_1791450532595.jpg',
    description: 'Büyük ve serbest bir çiftlik haritasında toprağı sürün, tohumları (buğday, havuç, çilek, mısır, balkabağı) ekin, sulayın ve olgunlaşan ürünleri hasat edip pazarcıya satarak zenginleşin. Tavuk ve koyunları besleyip yumurta toplayın!',
    controlsHelp: [
      { key: 'W, A, S, D veya Yön Tuşları', action: 'Karakteri serbestçe hareket ettir' },
      { key: 'Mouse Sol Tık', action: 'Hedef toprağa işlem yap (Çapala, Ek, Sula, Hasat)' },
      { key: '1, 2, 3, 4, 5 Tuşları', action: 'Alet ve tohum çantasından seçim yap' },
      { key: 'Pazar Standı', action: 'Kasabanın tüccarına yanaşarak ürünleri sat' },
    ],
    features: ['Gündüz/Gece döngüsü', '5 farklı ürün çeşidi', 'Hayvan bakımı & yumurta toplama', 'Pazar ekonomisi & yükseltmeler'],
  },
  {
    id: 'city',
    title: 'MegaŞehir: Sandbox Mimar',
    tagline: 'Kendi metropolünü tasarla, enerji ve nüfus dengesini kur!',
    category: 'Sandbox & Strateji',
    players: '1 Oyuncu',
    coverImage: '/src/assets/images/game_cover_builder_1791450544998.jpg',
    description: 'İzometrik ızgara üzerinde yollar, sevimli evler, modern gökdelenler, rüzgar türbinleri, parklar ve stadyumlar inşa edin. Nüfus, enerji, bütçe ve mutluluk oranını dengede tutarak hayalinizdeki şehri kurun.',
    controlsHelp: [
      { key: 'Sol Tık', action: 'Seçili binayı boş arsaya yerleştir' },
      { key: 'Sağ Tık / Dozer', action: 'İstenmeyen yapıları yık ve arsayı temizle' },
      { key: 'Fare Tekerleği / Sürükle', action: 'Haritayı kaydır ve yakınlaştır' },
      { key: 'Gece/Gündüz Butonu', action: 'Şehrin gece ışıklandırmasını incele' },
    ],
    features: ['12+ farklı yapı çeşidi', 'Ekonomi & vergi simülasyonu', 'Yıkım ve yeniden inşa araçları', 'Şehir planını kaydetme'],
  },
  {
    id: 'tank',
    title: 'Neon Tank 1v1: İki Kişilik Düello',
    tagline: 'Aynı klavyede arkadaşınla veya yapay zekaya karşı kıyasıya savaş!',
    category: '2 Kişilik & Versus',
    players: '2 Kişilik (Aynı PC)',
    coverImage: '/src/assets/images/game_cover_tank_duo_1791450562286.jpg',
    description: 'Tek bir bilgisayar üzerinden iki kişinin yan yana oynayabileceği tempolu neon tank savaşı! Duvarlardan seken mermiler, kalkan, üçlü atış, lazer ve kara mayını gibi süper güçlerle rakibini alt et!',
    controlsHelp: [
      { key: '1. OYUNCU (Mavi): W, A, S, D', action: 'Tankı sür ve yönlendir' },
      { key: '1. OYUNCU (Mavi): SPACE / Q', action: 'Top mermisi ateşle' },
      { key: '2. OYUNCU (Kırmızı): Yön Tuşları', action: 'Tankı sür ve yönlendir' },
      { key: '2. OYUNCU (Kırmızı): ENTER / M', action: 'Top mermisi ateşle' },
    ],
    features: ['Tam 2 kişilik yerel çok oyunculu', 'Yapay zeka (Bot) modu desteği', 'Sekme fiziği & parçalanan kutular', 'Özel güçlendirici sandıkları'],
  },
  {
    id: 'runner',
    title: 'Siber Koşucu: Neon Dash',
    tagline: 'Synthwave neon otobanında engellerden kaç, veri çekirdeklerini topla!',
    category: 'Aksiyon & Koşu',
    players: '1 Oyuncu',
    coverImage: '/src/assets/images/game_cover_runner_1791450571641.jpg',
    description: 'Işık hızında akan siberpunk şehrinde engellerin üzerinden zıplayın, lazer bariyerlerinin altından kayın ve çarpan çipleri toplayarak kesintisiz hız rekorları kırın.',
    controlsHelp: [
      { key: 'SPACE / Yukarı Tuşu', action: 'Zıpla (Havada tekrar basarak Çift Zıpla)' },
      { key: 'Aşağı Tuşu / S', action: 'Kayma (Lazerlerin altından geç)' },
      { key: 'Shift Tuşu', action: 'Siber Atılma (Hız patlaması)' },
    ],
    features: ['Akıcı 60 FPS platform fiziği', 'Çift zıplama & kayma mekaniği', 'Dinamik hız artışı & kombo çarpanı', 'Canlı skor tablosu'],
  },
  {
    id: 'breaker',
    title: 'Galaksi Tuğla Kırıcı: Nova Breaker',
    tagline: 'Gelişmiş fizik ve süper güçlerle kozmik kristalleri yok et!',
    category: 'Retro Arcade',
    players: '1 Oyuncu',
    coverImage: '/src/assets/images/game_cover_breaker_1791450581667.jpg',
    description: 'Yenilikçi parçacık efektleri, çoklu top çılgınlığı, lazer topları ve genişleyen raket güçlendirmeleri ile bağımlılık yapan akıcı bir tuğla kırma şöleni.',
    controlsHelp: [
      { key: 'Fare / Dokunmatik / A - D', action: 'Uzay mekiğini sağa-sola hareket ettir' },
      { key: 'Sol Tık / SPACE', action: 'Topu fırlat / Lazer ateşi aç' },
    ],
    features: ['Çoklu top (Multiball) ve lazer', 'Farklı can seviyesinde parlayan tuğlalar', 'Tatmin edici ses ve parçacık fiziği', 'Bölüm geçişleri'],
  },
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_default_01',
  username: 'KralOyuncu',
  avatar: '⚡',
  level: 4,
  xp: 1420,
  coins: 850,
  highScores: {
    farm: 1250,
    city: 4800,
    tank: 5,
    runner: 3420,
    breaker: 2850,
  },
  gamesPlayedCount: 38,
  achievements: [
    'İlk Hasat: Çiftlikte 10 ürün topla',
    'Şehir Mimarı: 1.000 nüfusa ulaş',
    'Tank Ustası: 1v1 maç kazan',
    'Siber Hız: 1.500 mesafe kat et',
  ],
  isGuest: false,
  joinedAt: 'Ekim 2026',
};

const DEFAULT_LEADERBOARDS: LeaderboardEntry[] = [
  // Farm
  { id: 'lb_1', gameId: 'farm', username: 'KralOyuncu', avatar: '⚡', score: 1250, date: 'Bugün', isCurrentUser: true },
  { id: 'lb_2', gameId: 'farm', username: 'EkinciBaba', avatar: '🌾', score: 2450, date: 'Dün' },
  { id: 'lb_3', gameId: 'farm', username: 'ToprakAna', avatar: '🌻', score: 1890, date: '2 gün önce' },
  { id: 'lb_4', gameId: 'farm', username: 'TarımUstası', avatar: '🚜', score: 1420, date: 'Bu hafta' },

  // City
  { id: 'lb_5', gameId: 'city', username: 'MetropolKralı', avatar: '🏙️', score: 9200, date: 'Dün' },
  { id: 'lb_6', gameId: 'city', username: 'MimarSinan99', avatar: '📐', score: 6500, date: '3 gün önce' },
  { id: 'lb_7', gameId: 'city', username: 'KralOyuncu', avatar: '⚡', score: 4800, date: 'Bugün', isCurrentUser: true },
  { id: 'lb_8', gameId: 'city', username: 'TeknoKentli', avatar: '🔋', score: 3900, date: 'Bu hafta' },

  // Tank
  { id: 'lb_9', gameId: 'tank', username: 'ZırhlıKaplan', avatar: '🛡️', score: 12, date: 'Bugün' },
  { id: 'lb_10', gameId: 'tank', username: 'KralOyuncu', avatar: '⚡', score: 5, date: 'Bugün', isCurrentUser: true },
  { id: 'lb_11', gameId: 'tank', username: 'PikselTankçı', avatar: '🎯', score: 8, date: 'Dün' },

  // Runner
  { id: 'lb_12', gameId: 'runner', username: 'HızCanavarı', avatar: '🚀', score: 6200, date: 'Bugün' },
  { id: 'lb_13', gameId: 'runner', username: 'KralOyuncu', avatar: '⚡', score: 3420, date: 'Bugün', isCurrentUser: true },
  { id: 'lb_14', gameId: 'runner', username: 'NeonNinja', avatar: '🗡️', score: 2980, date: 'Dün' },

  // Breaker
  { id: 'lb_15', gameId: 'breaker', username: 'KozmikPatron', avatar: '🌌', score: 5400, date: 'Bugün' },
  { id: 'lb_16', gameId: 'breaker', username: 'KralOyuncu', avatar: '⚡', score: 2850, date: 'Bugün', isCurrentUser: true },
  { id: 'lb_17', gameId: 'breaker', username: 'KromGülle', avatar: '🔮', score: 2100, date: '2 gün önce' },
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: 'NovaArcade',
  siteTagline: 'En Akıcı Web Oyun Platformu',
  logoIcon: 'Gamepad2',
  customLogoUrl: '',
  topBanner: {
    enabled: true,
    title: '🔥 SEZONUN EN İYİ OYUNLARI YAYINDA!',
    subtitle: 'Hemen üye ol, arkadaşlarınla yarış ve liderlik tablosunda yerini al.',
    badge: 'ÖZEL SPONSOR / DUYURU',
    linkUrl: '#',
    ctaText: 'Keşfet & Oyna',
  },
  sidebarBanner: {
    enabled: true,
    title: '🎮 PRO GAMING CLUB',
    subtitle: 'Kendi reklamınızı ve sponsorluk görselinizi bu alana ekleyebilirsiniz.',
    badge: 'REKLAM ALANI (300x250)',
    linkUrl: '#',
    ctaText: 'İncele',
  },
  inGameBanner: {
    enabled: true,
    title: 'Reklam & Sponsorluk İletişimi: info@novagames.com',
    linkUrl: '#',
  },
};

export const getStoredProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem('nova_user_profile');
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  return DEFAULT_PROFILE;
};

export const saveProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem('nova_user_profile', JSON.stringify(profile));
  } catch {
    // Ignore
  }
};

export const getStoredLeaderboards = (): LeaderboardEntry[] => {
  try {
    const raw = localStorage.getItem('nova_leaderboards');
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  return DEFAULT_LEADERBOARDS;
};

export const saveLeaderboards = (entries: LeaderboardEntry[]): void => {
  try {
    localStorage.setItem('nova_leaderboards', JSON.stringify(entries));
  } catch {
    // Ignore
  }
};

export const getStoredSettings = (): SiteSettings => {
  try {
    const raw = localStorage.getItem('nova_site_settings');
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: SiteSettings): void => {
  try {
    localStorage.setItem('nova_site_settings', JSON.stringify(settings));
  } catch {
    // Ignore
  }
};

export const recordGameScore = (gameId: 'farm' | 'city' | 'tank' | 'runner' | 'breaker', score: number, coinsEarned: number) => {
  const profile = getStoredProfile();
  profile.gamesPlayedCount += 1;
  profile.coins += coinsEarned;
  profile.xp += Math.floor(score / 5) + 10;
  profile.level = Math.floor(profile.xp / 400) + 1;

  if (score > (profile.highScores[gameId] || 0)) {
    profile.highScores[gameId] = score;

    // Update leaderboards
    const leaderboards = getStoredLeaderboards();
    const existingIndex = leaderboards.findIndex(
      (entry) => entry.gameId === gameId && (entry.isCurrentUser || entry.username === profile.username)
    );

    if (existingIndex >= 0) {
      if (score > leaderboards[existingIndex].score) {
        leaderboards[existingIndex].score = score;
        leaderboards[existingIndex].date = 'Bugün';
      }
    } else {
      leaderboards.push({
        id: `lb_${Date.now()}`,
        gameId,
        username: profile.username,
        avatar: profile.avatar,
        score,
        date: 'Bugün',
        isCurrentUser: true,
      });
    }

    saveLeaderboards(leaderboards);
  }

  saveProfile(profile);
  return profile;
};
