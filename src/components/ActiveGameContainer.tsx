import React from 'react';
import { GameId, GameMetadata, SiteSettings } from '../types';
import { ArrowLeft, Maximize2, RotateCcw, HelpCircle } from 'lucide-react';
import { FarmGame } from './games/FarmGame';
import { CityBuilderGame } from './games/CityBuilderGame';
import { TankDuoGame } from './games/TankDuoGame';
import { CyberRunnerGame } from './games/CyberRunnerGame';
import { AstroBreakerGame } from './games/AstroBreakerGame';
import { sound } from '../utils/audio';

interface Props {
  game: GameMetadata;
  settings: SiteSettings;
  onBack: () => void;
  onUpdateScore: (score: number) => void;
}

export const ActiveGameContainer: React.FC<Props> = ({ game, settings, onBack, onUpdateScore }) => {
  return (
    <div className="w-full flex flex-col items-center py-4 px-4 max-w-6xl mx-auto animate-fade-in">
      {/* Game Top Bar / Navigation */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <button
          onClick={() => {
            sound.playPop();
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobiye & Diğer Oyunlara Dön</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg font-black text-white font-display">{game.title}</h2>
          <div className="text-xs text-slate-400">{game.tagline}</div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
            {game.players}
          </span>
        </div>
      </div>

      {/* Main Game Component */}
      <div className="w-full flex justify-center mb-4">
        {game.id === 'farm' && <FarmGame onGameOverScore={onUpdateScore} />}
        {game.id === 'city' && <CityBuilderGame onGameOverScore={onUpdateScore} />}
        {game.id === 'tank' && <TankDuoGame onGameOverScore={onUpdateScore} />}
        {game.id === 'runner' && <CyberRunnerGame onGameOverScore={onUpdateScore} />}
        {game.id === 'breaker' && <AstroBreakerGame onGameOverScore={onUpdateScore} />}
      </div>

      {/* Controls & Help Guide Accordion */}
      <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mt-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span>Oyun Kontrolleri ve Kuralları</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {game.controlsHelp.map((item, idx) => (
            <div key={idx} className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl text-xs">
              <div className="font-bold text-amber-300 mb-0.5">{item.key}</div>
              <div className="text-slate-400 text-[11px]">{item.action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* In-Game Bottom Ad Sponsor */}
      {settings.inGameBanner.enabled && (
        <div className="w-full max-w-5xl mt-3 p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl text-center text-xs text-slate-500">
          <span>{settings.inGameBanner.title}</span>
        </div>
      )}
    </div>
  );
};
