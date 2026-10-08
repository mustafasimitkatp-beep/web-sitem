import React from 'react';
import { UserProfile } from '../../types';
import { X, Trophy, Award, Coins, LogOut, Flame, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogout: () => void;
}

export const ProfileModal: React.FC<Props> = ({ isOpen, onClose, user, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner">
              {user.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">{user.username}</h3>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
                  Seviye {user.level}
                </span>
              </div>
              <p className="text-xs text-slate-400">Katılım: {user.joinedAt} {user.isGuest ? '(Misafir)' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* XP & Coins Overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Toplam Altın</div>
                <div className="text-base font-bold text-amber-300 tabular-nums">{user.coins} Altın</div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Deneyim Puanı</div>
                <div className="text-base font-bold text-indigo-300 tabular-nums">{user.xp} XP</div>
              </div>
            </div>
          </div>

          {/* High Scores in 5 Games */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Oyun Rekorlarım</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
              <div className="flex items-center justify-between p-2.5 text-xs">
                <span className="text-slate-300">🌾 Yeşil Vadi Çiftliği:</span>
                <strong className="text-amber-400 tabular-nums">{user.highScores.farm || 0} Pazar Geliri</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 text-xs">
                <span className="text-slate-300">🏙️ MegaŞehir Mimarı:</span>
                <strong className="text-indigo-400 tabular-nums">{user.highScores.city || 0} Şehir Puanı</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 text-xs">
                <span className="text-slate-300">⚔️ Neon Tank 1v1 (2 Kişilik):</span>
                <strong className="text-rose-400 tabular-nums">{user.highScores.tank || 0} Zafer Raundu</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 text-xs">
                <span className="text-slate-300">⚡ Siber Koşucu Neon Dash:</span>
                <strong className="text-cyan-400 tabular-nums">{user.highScores.runner || 0} Metre</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 text-xs">
                <span className="text-slate-300">🔮 Galaksi Tuğla Kırıcı:</span>
                <strong className="text-purple-400 tabular-nums">{user.highScores.breaker || 0} Puan</strong>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kazanılan Başarımlar ({user.achievements.length})</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {user.achievements.map((ach, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{ach}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => {
              sound.playPop();
              onLogout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Hesaptan Çıkış Yap</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
