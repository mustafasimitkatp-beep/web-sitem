import React from 'react';
import { GameMetadata } from '../types';
import { Play, Users, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  game: GameMetadata;
  userHighScore: number;
  onPlay: (gameId: GameMetadata['id']) => void;
}

export const GameCard: React.FC<Props> = ({ game, userHighScore, onPlay }) => {
  const is2Player = game.id === 'tank';

  return (
    <div className="group relative bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
      {/* Cover Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
        <img
          src={game.coverImage}
          alt={game.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Scrim for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top-Right Player Mode Indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur rounded-lg border border-slate-700/80 text-[11px] font-semibold text-white">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>{game.players}</span>
        </div>

        {/* Special 2-Player Glow Tag if Tank */}
        {is2Player && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-rose-600/90 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-md">
            Aynı PC'de 2 Kişilik
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata Line (Frontend Design Principle) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 font-medium">
            <span className="text-amber-400">{game.category}</span>
            <span aria-hidden="true">·</span>
            <span>60 FPS Akıcı</span>
            {userHighScore > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-400 font-semibold">Rekor: {userHighScore}</span>
              </>
            )}
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors font-display mb-1">
            {game.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {game.description}
          </p>
        </div>

        {/* Bottom Play Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            {game.features[0]}
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onPlay(game.id);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 group-hover:scale-102"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Oyunu Başlat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
