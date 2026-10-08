import React, { useState } from 'react';
import { GameId, LeaderboardEntry } from '../../types';
import { X, Trophy, Medal, Flame, Sparkles } from 'lucide-react';
import { GAMES_CATALOG } from '../../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  currentUsername: string;
}

export const LeaderboardModal: React.FC<Props> = ({ isOpen, onClose, entries, currentUsername }) => {
  const [selectedGame, setSelectedGame] = useState<GameId | 'all'>('all');

  if (!isOpen) return null;

  const filteredEntries = entries
    .filter((e) => selectedGame === 'all' || e.gameId === selectedGame)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Liderlik & Skor Tablosu</h3>
              <p className="text-xs text-slate-400">En iyi oyuncular ve haftalık rekorlar.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Filters */}
        <div className="flex items-center gap-1.5 p-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedGame('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              selectedGame === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tüm Oyunlar
          </button>
          {GAMES_CATALOG.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGame(g.id)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition shrink-0 truncate max-w-[150px] ${
                selectedGame === g.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {g.title.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Bu oyun için henüz kaydedilmiş skor bulunmuyor. İlk rekoru siz kırın!
            </div>
          ) : (
            filteredEntries.map((entry, index) => {
              const isTop1 = index === 0;
              const isTop2 = index === 1;
              const isTop3 = index === 2;
              const isMe = entry.username === currentUsername || entry.isCurrentUser;

              const gameMeta = GAMES_CATALOG.find((g) => g.id === entry.gameId);

              return (
                <div
                  key={entry.id || index}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isMe
                      ? 'border-indigo-500/80 bg-indigo-950/40 shadow-md ring-1 ring-indigo-500/40'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 text-center font-bold text-sm">
                      {isTop1 ? (
                        <span className="text-amber-400 text-base">🥇</span>
                      ) : isTop2 ? (
                        <span className="text-slate-300 text-base">🥈</span>
                      ) : isTop3 ? (
                        <span className="text-amber-600 text-base">🥉</span>
                      ) : (
                        <span className="text-slate-500 tabular-nums">#{index + 1}</span>
                      )}
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-lg border border-slate-700">
                      {entry.avatar}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{entry.username}</span>
                        {isMe && (
                          <span className="text-[10px] text-indigo-400 bg-indigo-950 border border-indigo-800 px-1.5 py-0.2 rounded font-semibold">
                            SEN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {gameMeta ? gameMeta.title.split(':')[0] : entry.gameId} · {entry.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-400 tabular-nums">
                      {entry.score.toLocaleString()} Puan
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center text-xs text-slate-400">
          🎮 Oyunları oynadıkça ve kazandıkça skorunuz otomatik olarak liderlik listesine eklenir.
        </div>
      </div>
    </div>
  );
};
