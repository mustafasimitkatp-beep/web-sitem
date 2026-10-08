import React from 'react';
import { GameId, SiteSettings, UserProfile } from '../types';
import { Trophy, Sliders, Volume2, VolumeX, User, Gamepad2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  settings: SiteSettings;
  currentUser: UserProfile;
  activeGameId: GameId | null;
  onSelectGame: (id: GameId | null) => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<Props> = ({
  settings,
  currentUser,
  activeGameId,
  onSelectGame,
  onOpenLeaderboard,
  onOpenAuth,
  onOpenProfile,
  onOpenSettings,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <button
          onClick={() => onSelectGame(null)}
          className="flex items-center gap-2.5 text-left group"
        >
          {settings.customLogoUrl ? (
            <img
              src={settings.customLogoUrl}
              alt={settings.siteTitle}
              referrerPolicy="no-referrer"
              className="h-8 w-auto object-contain rounded-md"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
              <Gamepad2 className="w-5 h-5" />
            </div>
          )}
          <span className="text-lg font-black tracking-tight text-white font-display group-hover:text-amber-400 transition whitespace-nowrap">
            {settings.siteTitle}
          </span>
        </button>

        {/* Zone 2: Navigation Links (Clean text links) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onSelectGame(null)}
            className={`transition hover:text-white whitespace-nowrap ${
              activeGameId === null ? 'text-amber-400 border-b-2 border-amber-400 py-1' : ''
            }`}
          >
            Lobi & Oyunlar
          </button>
          <button
            onClick={() => onSelectGame('farm')}
            className={`transition hover:text-white whitespace-nowrap ${
              activeGameId === 'farm' ? 'text-amber-400 border-b-2 border-amber-400 py-1' : ''
            }`}
          >
            🌾 Çiftlik
          </button>
          <button
            onClick={() => onSelectGame('city')}
            className={`transition hover:text-white whitespace-nowrap ${
              activeGameId === 'city' ? 'text-amber-400 border-b-2 border-amber-400 py-1' : ''
            }`}
          >
            🏙️ Şehir Mimar
          </button>
          <button
            onClick={() => onSelectGame('tank')}
            className={`transition hover:text-white whitespace-nowrap ${
              activeGameId === 'tank' ? 'text-amber-400 border-b-2 border-amber-400 py-1' : ''
            }`}
          >
            ⚔️ 2 Kişilik Tank
          </button>
          <button
            onClick={() => onSelectGame('runner')}
            className={`transition hover:text-white whitespace-nowrap ${
              activeGameId === 'runner' ? 'text-amber-400 border-b-2 border-amber-400 py-1' : ''
            }`}
          >
            ⚡ Siber Koşucu
          </button>
          <button
            onClick={() => onSelectGame('breaker')}
            className={`transition hover:text-white whitespace-nowrap ${
              activeGameId === 'breaker' ? 'text-amber-400 border-b-2 border-amber-400 py-1' : ''
            }`}
          >
            🔮 Tuğla Kırıcı
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 rounded-xl text-xs font-semibold transition active:scale-95"
            title="Liderlik Tablosu"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Skor Tablosu</span>
          </button>

          {/* Logo & Reklam Ekleme Yönetimi */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition active:scale-95"
            title="Logo & Reklam Ekle / Düzenle"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Reklam & Logo</span>
          </button>

          {/* User Account / Profile */}
          <button
            onClick={currentUser.isGuest ? onOpenAuth : onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl transition text-xs font-semibold text-white active:scale-95"
          >
            <span className="text-base">{currentUser.avatar}</span>
            <div className="text-left hidden sm:block">
              <div className="truncate max-w-[100px] leading-tight">{currentUser.username}</div>
              <div className="text-[10px] text-amber-300 font-bold tabular-nums">{currentUser.coins}G</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
