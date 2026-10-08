import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audio';
import { recordGameScore } from '../../utils/storage';
import { Hammer, Trash2, Zap, Users, Smile, DollarSign, Trophy, Sparkles, Moon, Sun, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BuildingDef {
  id: string;
  name: string;
  cost: number;
  pop: number;
  power: number; // positive = provides, negative = consumes
  happiness: number;
  color: string;
  roofColor: string;
  height: number;
  icon: string;
  category: 'residential' | 'commercial' | 'energy' | 'amenity' | 'infrastructure';
}

const BUILDINGS: Record<string, BuildingDef> = {
  road: { id: 'road', name: 'Asfalt Yol', cost: 10, pop: 0, power: 0, happiness: 1, color: '#334155', roofColor: '#1E293B', height: 2, icon: '🛣️', category: 'infrastructure' },
  cottage: { id: 'cottage', name: 'Müstakil Ev', cost: 50, pop: 12, power: -2, happiness: 3, color: '#F87171', roofColor: '#DC2626', height: 16, icon: '🏡', category: 'residential' },
  apartment: { id: 'apartment', name: 'Apartman', cost: 150, pop: 45, power: -6, happiness: 4, color: '#60A5FA', roofColor: '#2563EB', height: 32, icon: '🏢', category: 'residential' },
  skyscraper: { id: 'skyscraper', name: 'Gökdelen', cost: 450, pop: 140, power: -18, happiness: 8, color: '#818CF8', roofColor: '#4F46E5', height: 55, icon: '🏙️', category: 'residential' },
  shop: { id: 'shop', name: 'Dükkan & Cafe', cost: 100, pop: 10, power: -4, happiness: 6, color: '#FBBF24', roofColor: '#D97706', height: 20, icon: '🏪', category: 'commercial' },
  mall: { id: 'mall', name: 'AVM & Plaza', cost: 350, pop: 35, power: -14, happiness: 12, color: '#C084FC', roofColor: '#9333EA', height: 38, icon: '🏬', category: 'commercial' },
  solar: { id: 'solar', name: 'Güneş Paneli', cost: 120, pop: 0, power: 25, happiness: 4, color: '#38BDF8', roofColor: '#0284C7', height: 8, icon: '☀️', category: 'energy' },
  wind: { id: 'wind', name: 'Rüzgar Türbini', cost: 200, pop: 0, power: 50, happiness: 5, color: '#E2E8F0', roofColor: '#94A3B8', height: 42, icon: '💨', category: 'energy' },
  park: { id: 'park', name: 'Şehir Parkı', cost: 80, pop: 0, power: 0, happiness: 15, color: '#4ADE80', roofColor: '#16A34A', height: 6, icon: '🌳', category: 'amenity' },
  fountain: { id: 'fountain', name: 'Anıt Havuzu', cost: 160, pop: 0, power: -1, happiness: 20, color: '#38BDF8', roofColor: '#0369A1', height: 12, icon: '⛲', category: 'amenity' },
  stadium: { id: 'stadium', name: 'Arena Stadyum', cost: 600, pop: 20, power: -25, happiness: 35, color: '#FB7185', roofColor: '#E11D48', height: 34, icon: '🏟️', category: 'amenity' },
};

const GRID_SIZE = 14;

export const CityBuilderGame: React.FC<{ onGameOverScore?: (score: number) => void }> = ({ onGameOverScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Economy & City Stats
  const [money, setMoney] = useState<number>(850);
  const [population, setPopulation] = useState<number>(0);
  const [powerBalance, setPowerBalance] = useState<number>(50);
  const [happiness, setHappiness] = useState<number>(80);
  const [incomePerTick, setIncomePerTick] = useState<number>(15);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<string>('cottage');
  const [toastMessage, setToastMessage] = useState<string | null>('MegaŞehir Mimarı: Yollar döşeyin ve ilk binalarınızı inşa edin!');

  // City Grid
  const grid = useRef<(string | null)[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );

  // Pre-seed a basic layout on mount
  useEffect(() => {
    const g = grid.current;
    // Central road
    for (let i = 2; i < 12; i++) {
      g[7][i] = 'road';
      g[i][7] = 'road';
    }
    g[5][5] = 'cottage';
    g[5][6] = 'cottage';
    g[6][5] = 'park';
    g[8][8] = 'solar';
    recalculateStats();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const recalculateStats = () => {
    let totPop = 0;
    let totPower = 20; // base battery
    let happinessSum = 50;
    let buildingCount = 0;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const bId = grid.current[r][c];
        if (bId && BUILDINGS[bId]) {
          const b = BUILDINGS[bId];
          totPop += b.pop;
          totPower += b.power;
          happinessSum += b.happiness;
          buildingCount++;
        }
      }
    }

    const netHappiness = Math.min(100, Math.max(10, Math.round(happinessSum / Math.max(1, buildingCount * 0.4))));
    const tickIncome = Math.max(5, Math.floor(totPop * 0.4 * (netHappiness / 100)));

    setPopulation(totPop);
    setPowerBalance(totPower);
    setHappiness(netHappiness);
    setIncomePerTick(tickIncome);

    const totalScore = totPop * 10 + buildingCount * 25;
    recordGameScore('city', totalScore, tickIncome * 2);
    if (onGameOverScore) onGameOverScore(totalScore);
  };

  // Economy income tick
  useEffect(() => {
    const timer = setInterval(() => {
      setMoney((m) => {
        const nextMoney = m + incomePerTick;
        return nextMoney;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [incomePerTick]);

  // Canvas Isometric Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Sky
      if (isNightMode) {
        ctx.fillStyle = '#0B132B';
      } else {
        ctx.fillStyle = '#1E293B';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Isometric Transform
      const tileWidth = 42;
      const tileHeight = 22;
      const originX = canvas.width / 2;
      const originY = 80;

      // Draw Grid Tiles (back-to-front sorting)
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const isoX = originX + (c - r) * (tileWidth / 2);
          const isoY = originY + (c + r) * (tileHeight / 2);

          // Tile base diamond
          ctx.beginPath();
          ctx.moveTo(isoX, isoY);
          ctx.lineTo(isoX + tileWidth / 2, isoY + tileHeight / 2);
          ctx.lineTo(isoX, isoY + tileHeight);
          ctx.lineTo(isoX - tileWidth / 2, isoY + tileHeight / 2);
          ctx.closePath();

          const bId = grid.current[r][c];
          if (bId === 'road') {
            ctx.fillStyle = '#334155';
          } else if (bId === 'park') {
            ctx.fillStyle = '#22C55E';
          } else {
            ctx.fillStyle = isNightMode ? '#14253D' : '#15803D'; // Grass tile
          }
          ctx.fill();
          ctx.strokeStyle = isNightMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Render 3D Building extrusion if present
          if (bId && bId !== 'road' && bId !== 'park') {
            const b = BUILDINGS[bId];
            if (b) {
              const h = b.height;

              // Front-Left Face
              ctx.beginPath();
              ctx.moveTo(isoX - tileWidth / 2, isoY + tileHeight / 2);
              ctx.lineTo(isoX, isoY + tileHeight);
              ctx.lineTo(isoX, isoY + tileHeight - h);
              ctx.lineTo(isoX - tileWidth / 2, isoY + tileHeight / 2 - h);
              ctx.closePath();
              ctx.fillStyle = b.roofColor;
              ctx.fill();

              // Front-Right Face
              ctx.beginPath();
              ctx.moveTo(isoX, isoY + tileHeight);
              ctx.lineTo(isoX + tileWidth / 2, isoY + tileHeight / 2);
              ctx.lineTo(isoX + tileWidth / 2, isoY + tileHeight / 2 - h);
              ctx.lineTo(isoX, isoY + tileHeight - h);
              ctx.closePath();
              ctx.fillStyle = b.color;
              ctx.fill();

              // Top Roof Diamond
              ctx.beginPath();
              ctx.moveTo(isoX, isoY - h);
              ctx.lineTo(isoX + tileWidth / 2, isoY + tileHeight / 2 - h);
              ctx.lineTo(isoX, isoY + tileHeight - h);
              ctx.lineTo(isoX - tileWidth / 2, isoY + tileHeight / 2 - h);
              ctx.closePath();
              ctx.fillStyle = isNightMode ? '#E2E8F0' : b.roofColor;
              ctx.fill();
              ctx.strokeStyle = 'rgba(0,0,0,0.25)';
              ctx.stroke();

              // Windows lights
              if (h > 15) {
                ctx.fillStyle = isNightMode ? '#FDE047' : 'rgba(255,255,255,0.7)';
                for (let wy = isoY + tileHeight - 8; wy > isoY + tileHeight - h + 5; wy -= 8) {
                  ctx.fillRect(isoX + 4, wy, 3, 4);
                  ctx.fillRect(isoX + 11, wy - 3, 3, 4);
                }
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isNightMode]);

  // Click on Canvas Grid to Place / Demolish
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Convert Click coords to Isometric Grid
    const tileWidth = 42;
    const tileHeight = 22;
    const originX = canvas.width / 2;
    const originY = 80;

    const dx = clickX - originX;
    const dy = clickY - originY;

    const c = Math.floor((dx / (tileWidth / 2) + dy / (tileHeight / 2)) / 2);
    const r = Math.floor((dy / (tileHeight / 2) - dx / (tileWidth / 2)) / 2);

    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      if (selectedTool === 'demolish') {
        if (grid.current[r][c]) {
          grid.current[r][c] = null;
          sound.playExplosion();
          showToast('💥 Yapı başarıyla yıkıldı ve arsa temizlendi.');
          recalculateStats();
        }
      } else {
        const b = BUILDINGS[selectedTool];
        if (!b) return;

        if (money < b.cost) {
          showToast(`❌ Yetersiz bakiye! ${b.name} için $${b.cost} gerekli.`);
          return;
        }

        if (grid.current[r][c]) {
          showToast('⚠️ Bu arsa zaten dolu! Önce dozer aletiyle yıkın.');
          return;
        }

        // Check power requirements
        if (b.power < 0 && powerBalance + b.power < 0) {
          showToast('⚡ Şehirde yeterli elektrik yok! Önce Güneş Paneli veya Rüzgar Türbini kurun.');
          return;
        }

        setMoney((m) => m - b.cost);
        grid.current[r][c] = selectedTool;
        sound.playBuild();
        showToast(`🏗️ ${b.name} inşa edildi! Nüfus ve mutluluk arttı.`);
        recalculateStats();

        // Check Milestone Confetti
        if (population + b.pop > 100 && population <= 100) {
          confetti({ particleCount: 50, spread: 80, origin: { x: 0.5, y: 0.5 } });
          sound.playFanfare();
        }
      }
    }
  };

  const handleResetCity = () => {
    grid.current = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    for (let i = 2; i < 12; i++) {
      grid.current[7][i] = 'road';
    }
    setMoney(600);
    recalculateStats();
    showToast('🔄 Şehir sıfırlandı, yeni bir metropol kurmaya hazırsın!');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Top City Header HUD */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl mb-3 backdrop-blur shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-base">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="tabular-nums">${money}</span>
            <span className="text-[11px] text-emerald-300 font-normal">(+${incomePerTick}/s)</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-sm">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="tabular-nums">Nüfus: {population}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="tabular-nums">Enerji: {powerBalance} kW</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-sm">
            <Smile className="w-4 h-4 text-rose-400" />
            <span className="tabular-nums">Mutluluk: %{happiness}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
            title="Gece / Gündüz Görünümü"
          >
            {isNightMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{isNightMode ? 'Gündüz' : 'Gece'}</span>
          </button>
          <button
            onClick={handleResetCity}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 rounded-lg text-xs font-medium transition"
            title="Şehri Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Main Isometric Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl flex justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          onClick={handleCanvasClick}
          className="cursor-pointer w-full max-w-[800px] h-auto object-contain block select-none"
        />

        {/* Floating Toast */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/95 text-white border border-indigo-500/40 rounded-full text-xs font-medium shadow-lg backdrop-blur flex items-center gap-2 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 pointer-events-none hidden sm:block">
          <div className="font-semibold text-indigo-400 mb-0.5">🏙️ Mimar Kontrolleri</div>
          <div>Izgaradaki boş bir parsele tıkla ve seçtiğin binayı anında dik!</div>
        </div>
      </div>

      {/* Building Catalog & Toolbar */}
      <div className="w-full bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl mt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">İnşaat Kataloğu</div>
          <button
            onClick={() => setSelectedTool('demolish')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTool === 'demolish' ? 'bg-rose-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Dozer (Yıkım)</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {Object.values(BUILDINGS).map((b) => {
            const isSelected = selectedTool === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedTool(b.id);
                  sound.playPop();
                }}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/60 shadow-md ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-xs font-bold text-emerald-400 tabular-nums">${b.cost}</span>
                </div>
                <div className="text-xs font-semibold text-white truncate w-full">{b.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {b.pop > 0 && `+${b.pop} Nüfus `}
                  {b.power !== 0 && `${b.power > 0 ? '+' : ''}${b.power} kW `}
                  {b.happiness > 0 && `+${b.happiness} Mut.`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
