import React, { useState, useEffect } from 'react';
import { GameId, GameMetadata, LeaderboardEntry, SiteSettings, UserProfile } from './types';
import {
  GAMES_CATALOG,
  getStoredProfile,
  getStoredLeaderboards,
  getStoredSettings,
  saveProfile,
  saveSettings,
} from './utils/storage';
import { sound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { AdBannerTop } from './components/ads/AdBannerTop';
import { AdSidebar } from './components/ads/AdSidebar';
import { GameCard } from './components/GameCard';
import { ActiveGameContainer } from './components/ActiveGameContainer';
import { AdSettingsModal } from './components/modals/AdSettingsModal';
import { AuthModal } from './components/modals/AuthModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { LeaderboardModal } from './components/modals/LeaderboardModal';
import { Sparkles, Trophy, Users, Shield, Flame, Search } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(getStoredSettings());
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredProfile());
  const [leaderboards, setLeaderboards] = useState<LeaderboardEntry[]>(getStoredLeaderboards());
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

  // Category filter in lobby
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeGame = activeGameId ? GAMES_CATALOG.find((g) => g.id === activeGameId) : null;

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleSaveSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    saveProfile(user);
  };

  const handleLogout = () => {
    const guest: UserProfile = {
      id: `usr_${Date.now()}`,
      username: 'Misafir',
      avatar: '🎮',
      level: 1,
      xp: 0,
      coins: 100,
      highScores: { farm: 0, city: 0, tank: 0, runner: 0, breaker: 0 },
      gamesPlayedCount: 0,
      achievements: [],
      isGuest: true,
      joinedAt: 'Bugün',
    };
    setCurrentUser(guest);
    saveProfile(guest);
  };

  const handleUpdateScore = () => {
    // Refresh user profile and leaderboards from storage
    setCurrentUser(getStoredProfile());
    setLeaderboards(getStoredLeaderboards());
  };

  const filteredGames = GAMES_CATALOG.filter((g) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === '2player' && g.players.includes('2')) ||
      (selectedCategory === 'farm' && g.id === 'farm') ||
      (selectedCategory === 'build' && g.id === 'city') ||
      (selectedCategory === 'arcade' && (g.id === 'runner' || g.id === 'breaker'));

    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Customizable Ad Banner */}
      <AdBannerTop settings={settings} onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Strict 3-Zone Navigation Header */}
      <Navbar
        settings={settings}
        currentUser={currentUser}
        activeGameId={activeGameId}
        onSelectGame={(id) => setActiveGameId(id)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {activeGame ? (
          /* Active Game View */
          <ActiveGameContainer
            game={activeGame}
            settings={settings}
            onBack={() => setActiveGameId(null)}
            onUpdateScore={handleUpdateScore}
          />
        ) : (
          /* Lobby / Games Portal Home View */
          <div className="space-y-8 animate-fade-in">
            {/* Hero Banner Section */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-8 sm:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>5 FARKLI EFSANE OYUN · TAMAMEN ÜCRETSİZ VE AKICI</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-tight mb-4">
                  {settings.siteTitle}: Eğlencenin Yeni Merkezi
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                  {settings.siteTagline}. Açık dünya çiftliğinde hasat yapın, devasa metropolünüzü inşa edin, aynı bilgisayarda arkadaşınızla tank savaşı yapın veya siber dünyada hız rekorları kırın!
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      sound.playPop();
                      setActiveGameId('farm');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg transition active:scale-95"
                  >
                    🌾 Açık Dünya Çiftliği Başlat
                  </button>
                  <button
                    onClick={() => {
                      sound.playPop();
                      setActiveGameId('tank');
                    }}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm transition active:scale-95"
                  >
                    ⚔️ 2 Kişilik Tank Düellosu (Aynı PC)
                  </button>
                </div>
              </div>
            </div>

            {/* Games Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
              {/* Category Segmented Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => { setSelectedCategory('all'); sound.playPop(); }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tüm Oyunlar (5)
                </button>
                <button
                  onClick={() => { setSelectedCategory('farm'); sound.playPop(); }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                    selectedCategory === 'farm'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌾 Açık Dünya Çiftlik
                </button>
                <button
                  onClick={() => { setSelectedCategory('build'); sound.playPop(); }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                    selectedCategory === 'build'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏙️ Şehir Kurma
                </button>
                <button
                  onClick={() => { setSelectedCategory('2player'); sound.playPop(); }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                    selectedCategory === '2player'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚔️ 2 Kişilik (Aynı PC)
                </button>
                <button
                  onClick={() => { setSelectedCategory('arcade'); sound.playPop(); }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                    selectedCategory === 'arcade'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Aksiyon & Koşu
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Oyun ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Main Games Grid + Sidebar Column */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Games Cards (3 Columns) */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    userHighScore={currentUser.highScores[game.id] || 0}
                    onPlay={(id) => setActiveGameId(id)}
                  />
                ))}
              </div>

              {/* Right Column: Custom Ad Banner + Top Players Snapshot */}
              <div className="lg:col-span-1 space-y-5">
                {/* 300x250 Ad Banner Slot */}
                <AdSidebar settings={settings} onOpenSettings={() => setIsSettingsOpen(true)} />

                {/* Top Champions Snapshot Box */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Haftanın Şampiyonları</span>
                    </div>
                    <button
                      onClick={() => setIsLeaderboardOpen(true)}
                      className="text-[11px] text-amber-400 hover:underline font-semibold"
                    >
                      Tümünü Gör
                    </button>
                  </div>

                  <div className="space-y-2">
                    {leaderboards.slice(0, 4).map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{entry.avatar}</span>
                          <span className="font-semibold text-white truncate max-w-[90px]">
                            {entry.username}
                          </span>
                        </div>
                        <span className="text-amber-400 font-bold tabular-nums">
                          {entry.score.toLocaleString()}P
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account / Quick Profile Card */}
                <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900/80 border border-indigo-900/40 rounded-2xl p-4 text-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl">
                      {currentUser.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{currentUser.username}</div>
                      <div className="text-[11px] text-slate-400">Seviye {currentUser.level} · {currentUser.xp} XP</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Kazanılan Altın:</span>
                    <strong className="text-amber-300 tabular-nums">{currentUser.coins} Altın</strong>
                  </div>

                  <button
                    onClick={() => {
                      if (currentUser.isGuest) setIsAuthOpen(true);
                      else setIsProfileOpen(true);
                    }}
                    className="w-full mt-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold transition"
                  >
                    {currentUser.isGuest ? 'Hesap Aç & Giriş Yap' : 'Profil & Başarımlar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <AdSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={leaderboards}
        currentUsername={currentUser.username}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 font-display">{settings.siteTitle}</span>
            <span>·</span>
            <span>5 Oyunlu Web Oyun Platformu</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsLeaderboardOpen(true)} className="hover:text-white transition">
              Skor Tablosu
            </button>
            <span>·</span>
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-white transition">
              Reklam & Logo Ekle
            </button>
            <span>·</span>
            <button onClick={() => setIsAuthOpen(true)} className="hover:text-white transition">
              Giriş Sistemi
            </button>
          </div>

          <div>
            © 2026 {settings.siteTitle}. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
