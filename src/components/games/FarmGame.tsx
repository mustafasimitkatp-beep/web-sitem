import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audio';
import { recordGameScore } from '../../utils/storage';
import { Shovel, Droplets, ShoppingBag, Sun, Moon, Sparkles, RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Plot {
  x: number;
  y: number;
  isTilled: boolean;
  isWatered: boolean;
  cropType: string | null;
  growthStage: number; // 0: seed, 1: sprout, 2: growing, 3: mature
  growTimer: number;
}

interface CropConfig {
  id: string;
  name: string;
  icon: string;
  growTime: number; // in seconds
  sellPrice: number;
  seedCost: number;
  color: string;
}

const CROPS: Record<string, CropConfig> = {
  wheat: { id: 'wheat', name: 'Buğday', icon: '🌾', growTime: 6, sellPrice: 25, seedCost: 10, color: '#FBBF24' },
  carrot: { id: 'carrot', name: 'Havuç', icon: '🥕', growTime: 10, sellPrice: 45, seedCost: 18, color: '#FB923C' },
  strawberry: { id: 'strawberry', name: 'Çilek', icon: '🍓', growTime: 14, sellPrice: 75, seedCost: 30, color: '#F43F5E' },
  corn: { id: 'corn', name: 'Mısır', icon: '🌽', growTime: 18, sellPrice: 110, seedCost: 45, color: '#EAB308' },
  pumpkin: { id: 'pumpkin', name: 'Balkabağı', icon: '🎃', growTime: 25, sellPrice: 180, seedCost: 70, color: '#EA580C' },
};

export const FarmGame: React.FC<{ onGameOverScore?: (score: number) => void }> = ({ onGameOverScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player state
  const [coins, setCoins] = useState<number>(150);
  const [energy, setEnergy] = useState<number>(100);
  const [day, setDay] = useState<number>(1);
  const [dayTime, setDayTime] = useState<number>(0); // 0 to 100
  const [selectedTool, setSelectedTool] = useState<'hoe' | 'water' | 'harvest' | 'seed'>('hoe');
  const [selectedCrop, setSelectedCrop] = useState<string>('wheat');
  const [inventory, setInventory] = useState<Record<string, number>>({
    wheat: 0,
    carrot: 0,
    strawberry: 0,
    corn: 0,
    pumpkin: 0,
    egg: 0,
    wool: 0,
  });
  const [totalSoldValue, setTotalSoldValue] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>('Yeşil Vadiye Hoş Geldin! Çiftliğini büyütmeye başla.');

  // Game internal state
  const playerPos = useRef({ x: 400, y: 300, vx: 0, vy: 0, facing: 'down', isMoving: false });
  const keysPressed = useRef<Record<string, boolean>>({});
  const plots = useRef<Plot[]>([]);
  const chickens = useRef<{ x: number; y: number; vx: number; vy: number; eggTimer: number }[]>([
    { x: 180, y: 160, vx: 0, vy: 0, eggTimer: 10 },
    { x: 220, y: 190, vx: 0, vy: 0, eggTimer: 18 },
    { x: 150, y: 210, vx: 0, vy: 0, eggTimer: 25 },
  ]);
  const eggsOnGround = useRef<{ x: number; y: number; id: number }[]>([]);
  const sheep = useRef<{ x: number; y: number; hasWool: boolean; woolTimer: number }>({
    x: 200,
    y: 380,
    hasWool: true,
    woolTimer: 20,
  });

  // Initialize farm plots
  useEffect(() => {
    const initialPlots: Plot[] = [];
    const startX = 320;
    const startY = 180;
    const cols = 6;
    const rows = 4;
    const tileSize = 44;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        initialPlots.push({
          x: startX + c * tileSize,
          y: startY + r * tileSize,
          isTilled: r === 0 && c < 3,
          isWatered: false,
          cropType: r === 0 && c === 0 ? 'wheat' : null,
          growthStage: r === 0 && c === 0 ? 1 : 0,
          growTimer: 0,
        });
      }
    }
    plots.current = initialPlots;
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key === '1') setSelectedTool('hoe');
      if (e.key === '2') setSelectedTool('water');
      if (e.key === '3') setSelectedTool('seed');
      if (e.key === '4') setSelectedTool('harvest');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Show toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Main game tick & render loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Update Player movement
      const speed = 160;
      let dx = 0;
      let dy = 0;
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      playerPos.current.x = Math.max(30, Math.min(canvas.width - 30, playerPos.current.x + dx * speed * dt));
      playerPos.current.y = Math.max(30, Math.min(canvas.height - 30, playerPos.current.y + dy * speed * dt));
      playerPos.current.isMoving = dx !== 0 || dy !== 0;
      if (dy > 0) playerPos.current.facing = 'down';
      else if (dy < 0) playerPos.current.facing = 'up';
      else if (dx > 0) playerPos.current.facing = 'right';
      else if (dx < 0) playerPos.current.facing = 'left';

      // Update Crops growth
      plots.current.forEach((plot) => {
        if (plot.cropType && plot.isWatered && plot.growthStage < 3) {
          const cropInfo = CROPS[plot.cropType];
          if (cropInfo) {
            plot.growTimer += dt;
            const stageThreshold = cropInfo.growTime / 3;
            if (plot.growTimer >= stageThreshold) {
              plot.growTimer = 0;
              plot.growthStage += 1;
              if (plot.growthStage >= 3) {
                // Done growing
                plot.isWatered = false; // Dries out when mature
              }
            }
          }
        }
      });

      // Update Chickens & Eggs
      chickens.current.forEach((chk) => {
        if (Math.random() < 0.02) {
          chk.vx = (Math.random() - 0.5) * 40;
          chk.vy = (Math.random() - 0.5) * 40;
        }
        chk.x = Math.max(120, Math.min(270, chk.x + chk.vx * dt));
        chk.y = Math.max(120, Math.min(240, chk.y + chk.vy * dt));

        chk.eggTimer -= dt;
        if (chk.eggTimer <= 0) {
          chk.eggTimer = 15 + Math.random() * 15;
          if (eggsOnGround.current.length < 8) {
            eggsOnGround.current.push({ x: chk.x, y: chk.y, id: Date.now() + Math.random() });
          }
        }
      });

      // Update Sheep
      if (!sheep.current.hasWool) {
        sheep.current.woolTimer -= dt;
        if (sheep.current.woolTimer <= 0) {
          sheep.current.hasWool = true;
          sheep.current.woolTimer = 25;
        }
      }

      // Render Map
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lush Grass Background
      ctx.fillStyle = '#22543D'; // Deep grass
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grass texture patches
      ctx.fillStyle = '#276749';
      for (let i = 0; i < canvas.width; i += 60) {
        for (let j = 0; j < canvas.height; j += 60) {
          if ((i + j) % 120 === 0) {
            ctx.fillRect(i + 10, j + 10, 35, 35);
          }
        }
      }

      // Dirt Paths
      ctx.fillStyle = '#975A16';
      ctx.fillRect(290, 80, 290, 360);
      ctx.fillStyle = '#B7791F';
      ctx.fillRect(294, 84, 282, 352);

      // Draw Plots
      plots.current.forEach((plot) => {
        // Soil base
        if (plot.isTilled) {
          ctx.fillStyle = plot.isWatered ? '#5B3814' : '#7B4A1D';
          ctx.fillRect(plot.x, plot.y, 40, 40);
          ctx.strokeStyle = plot.isWatered ? '#3D240B' : '#5C330D';
          ctx.lineWidth = 2;
          ctx.strokeRect(plot.x, plot.y, 40, 40);

          // Water shine if watered
          if (plot.isWatered) {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
            ctx.fillRect(plot.x + 4, plot.y + 4, 32, 32);
          }
        } else {
          // Untilled grass patch
          ctx.fillStyle = '#2D3748';
          ctx.strokeStyle = '#4A5568';
          ctx.strokeRect(plot.x, plot.y, 40, 40);
        }

        // Draw crop on plot
        if (plot.cropType) {
          const crop = CROPS[plot.cropType];
          const cx = plot.x + 20;
          const cy = plot.y + 20;

          if (plot.growthStage === 0) {
            // Seed
            ctx.fillStyle = '#D97706';
            ctx.beginPath();
            ctx.arc(cx - 4, cy, 3, 0, Math.PI * 2);
            ctx.arc(cx + 4, cy, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (plot.growthStage === 1) {
            // Sprout
            ctx.fillStyle = '#48BB78';
            ctx.beginPath();
            ctx.arc(cx, cy + 4, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#38A169';
            ctx.fillRect(cx - 2, cy - 6, 4, 10);
          } else if (plot.growthStage === 2) {
            // Half grown
            ctx.fillStyle = '#38A169';
            ctx.beginPath();
            ctx.arc(cx, cy - 2, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = crop.color;
            ctx.beginPath();
            ctx.arc(cx, cy + 3, 5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Mature (Ready to harvest!)
            ctx.font = '22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(crop.icon, cx, cy);

            // Shimmer effect
            const glow = (Math.sin(currentTime * 0.006) + 1) * 0.5;
            ctx.strokeStyle = `rgba(250, 204, 21, ${0.4 + glow * 0.5})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(plot.x + 2, plot.y + 2, 36, 36);
          }
        }
      });

      // Left Pen (Chicken Coop & Pasture)
      ctx.fillStyle = '#744210';
      ctx.fillRect(100, 100, 180, 150);
      ctx.fillStyle = '#975A16';
      ctx.fillRect(104, 104, 172, 142);

      // Coop building
      ctx.fillStyle = '#C53030';
      ctx.fillRect(110, 110, 60, 50);
      ctx.fillStyle = '#9B2C2C';
      ctx.beginPath();
      ctx.moveTo(110, 110);
      ctx.lineTo(140, 85);
      ctx.lineTo(170, 110);
      ctx.fill();
      ctx.fillStyle = '#742A2A';
      ctx.fillRect(130, 135, 20, 25);

      // Chickens
      chickens.current.forEach((chk) => {
        ctx.font = '18px sans-serif';
        ctx.fillText('🐔', chk.x, chk.y);
      });

      // Eggs on ground
      eggsOnGround.current.forEach((egg) => {
        ctx.font = '16px sans-serif';
        ctx.fillText('🥚', egg.x, egg.y);
      });

      // Sheep Pen
      ctx.fillStyle = '#4A5568';
      ctx.fillRect(110, 310, 160, 120);
      ctx.fillStyle = '#2D3748';
      ctx.fillRect(114, 314, 152, 112);
      ctx.font = '28px sans-serif';
      ctx.fillText(sheep.current.hasWool ? '🐑' : '🐐', sheep.current.x, sheep.current.y);

      // Water Pond (Right side)
      ctx.fillStyle = '#2B6CB0';
      ctx.beginPath();
      ctx.ellipse(680, 360, 60, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3182CE';
      ctx.beginPath();
      ctx.ellipse(680, 360, 52, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '14px Outfit, sans-serif';
      ctx.fillText('💧 Doğal Gölet', 645, 365);

      // Market Stall (Kasaba Tüccarı / Pazar)
      ctx.fillStyle = '#805AD5';
      ctx.fillRect(630, 90, 120, 75);
      ctx.fillStyle = '#D6BCFA';
      ctx.fillRect(634, 94, 112, 30);
      ctx.fillStyle = '#44337A';
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.fillText('PAZARCI NPC', 655, 114);
      ctx.font = '30px sans-serif';
      ctx.fillText('🏪', 675, 150);

      // Barn (Top Center)
      ctx.fillStyle = '#9B2C2C';
      ctx.fillRect(360, 20, 150, 60);
      ctx.fillStyle = '#C53030';
      ctx.beginPath();
      ctx.moveTo(350, 25);
      ctx.lineTo(435, 0);
      ctx.lineTo(520, 25);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('YEŞİL VADİ AMBARI', 380, 50);

      // Collect Eggs & Sheep if player is close
      const px = playerPos.current.x;
      const py = playerPos.current.y;

      // Check egg pickup
      eggsOnGround.current = eggsOnGround.current.filter((egg) => {
        const dist = Math.hypot(egg.x - px, egg.y - py);
        if (dist < 35) {
          sound.playCoin();
          setInventory((prev) => ({ ...prev, egg: (prev.egg || 0) + 1 }));
          showToast('🥚 1 Taze Yumurta Toplandı!');
          return false;
        }
        return true;
      });

      // Check sheep interaction
      const distToSheep = Math.hypot(sheep.current.x - px, sheep.current.y - py);
      if (distToSheep < 45 && sheep.current.hasWool) {
        sheep.current.hasWool = false;
        sound.playHarvest();
        setInventory((prev) => ({ ...prev, wool: (prev.wool || 0) + 1 }));
        showToast('🧶 1 Yumuşak Yün Kırkıldı!');
      }

      // Check Market proximity
      const distToMarket = Math.hypot(690 - px, 130 - py);
      if (distToMarket < 65) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(630, 170, 120, 30);
        ctx.fillStyle = '#1A202C';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Tıkla & Ürün Sat', 645, 190);
      }

      // Draw Player Character
      const walkBob = playerPos.current.isMoving ? Math.sin(currentTime * 0.015) * 3 : 0;

      // Player Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(px, py + 16, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Farmer Overalls)
      ctx.fillStyle = '#2B6CB0'; // Denim blue
      ctx.fillRect(px - 9, py - 4 + walkBob, 18, 16);

      // Shirt
      ctx.fillStyle = '#DD6B20'; // Flannel plaid
      ctx.fillRect(px - 10, py - 14 + walkBob, 20, 12);

      // Head
      ctx.fillStyle = '#FBD38D'; // Face
      ctx.beginPath();
      ctx.arc(px, py - 20 + walkBob, 8, 0, Math.PI * 2);
      ctx.fill();

      // Straw Hat
      ctx.fillStyle = '#D69E2E';
      ctx.beginPath();
      ctx.ellipse(px, py - 25 + walkBob, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(px - 7, py - 32 + walkBob, 14, 8);

      // Selected Tool floating above head
      let toolIcon = '⛏️';
      if (selectedTool === 'water') toolIcon = '💧';
      if (selectedTool === 'seed') toolIcon = CROPS[selectedCrop]?.icon || '🌱';
      if (selectedTool === 'harvest') toolIcon = '🌾';

      ctx.font = '16px sans-serif';
      ctx.fillText(toolIcon, px + 8, py - 30 + walkBob);

      // Night / Twilight overlay if dayTime progresses
      const daylightIntensity = Math.sin((dayTime / 100) * Math.PI);
      if (daylightIntensity < 0.4) {
        ctx.fillStyle = `rgba(15, 23, 42, ${0.45 - daylightIntensity * 0.8})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [dayTime, selectedTool, selectedCrop]);

  // Day / Night cycle timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDayTime((prev) => {
        const next = (prev + 1) % 100;
        if (next === 0) {
          setDay((d) => d + 1);
          setEnergy(100);
          showToast(`🌅 Yeni Gün Başladı! (Gün ${day + 1}) Enerjin yenilendi.`);
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [day]);

  // Handle Canvas Click (Tool Actions)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check click on market
    if (clickX >= 630 && clickX <= 750 && clickY >= 90 && clickY <= 200) {
      sellAllProduce();
      return;
    }

    // Check click on plots
    for (const plot of plots.current) {
      if (clickX >= plot.x && clickX <= plot.x + 40 && clickY >= plot.y && clickY <= plot.y + 40) {
        performActionOnPlot(plot);
        break;
      }
    }
  };

  const performActionOnPlot = (plot: Plot) => {
    if (energy <= 2) {
      showToast('⚠️ Enerjin tükendi! Yeni günün doğmasını bekle.');
      return;
    }

    if (selectedTool === 'hoe') {
      if (!plot.isTilled) {
        plot.isTilled = true;
        setEnergy((prev) => Math.max(0, prev - 3));
        sound.playBuild();
        showToast('🌱 Toprak sürüldü, tohum ekmeye hazır!');
      } else {
        showToast('Toprak zaten sürülmüş.');
      }
    } else if (selectedTool === 'seed') {
      if (!plot.isTilled) {
        showToast('Önce toprağı çapalaman gerekir (1. Alet)!');
        return;
      }
      if (plot.cropType) {
        showToast('Bu toprakta zaten bir ürün ekili.');
        return;
      }
      const cropInfo = CROPS[selectedCrop];
      if (coins < cropInfo.seedCost) {
        showToast(`❌ Yetersiz bakiye! ${cropInfo.name} tohumu için ${cropInfo.seedCost} altın gerekli.`);
        return;
      }
      setCoins((c) => c - cropInfo.seedCost);
      plot.cropType = selectedCrop;
      plot.growthStage = 0;
      plot.growTimer = 0;
      setEnergy((prev) => Math.max(0, prev - 2));
      sound.playPop();
      showToast(`${cropInfo.icon} ${cropInfo.name} ekildi! Büyümesi için sula.`);
    } else if (selectedTool === 'water') {
      if (!plot.isTilled) {
        showToast('Önce toprağı sür.');
        return;
      }
      if (!plot.isWatered) {
        plot.isWatered = true;
        setEnergy((prev) => Math.max(0, prev - 2));
        sound.playHarvest();
        showToast('💧 Toprak sulandı! Bitkiler hızla büyüyor.');
      } else {
        showToast('Toprak zaten nemli.');
      }
    } else if (selectedTool === 'harvest') {
      if (plot.cropType && plot.growthStage >= 3) {
        const cropInfo = CROPS[plot.cropType];
        setInventory((prev) => ({
          ...prev,
          [plot.cropType!]: (prev[plot.cropType!] || 0) + 1,
        }));
        sound.playCoin();
        showToast(`✨ Hasat başarılı! 1x ${cropInfo.name} toplandı.`);

        // Clear plot
        plot.cropType = null;
        plot.growthStage = 0;
        plot.growTimer = 0;
        plot.isWatered = false;

        confetti({
          particleCount: 25,
          spread: 45,
          origin: { x: 0.5, y: 0.6 },
        });
      } else if (plot.cropType) {
        showToast('Ürün henüz olgunlaşmadı! Biraz daha bekle.');
      } else {
        showToast('Hasat edilecek ürün yok.');
      }
    }
  };

  const sellAllProduce = () => {
    let earned = 0;
    let soldSummary: string[] = [];

    Object.entries(inventory).forEach(([item, count]) => {
      if (count > 0) {
        if (item === 'egg') {
          earned += count * 35;
          soldSummary.push(`${count}x Yumurta`);
        } else if (item === 'wool') {
          earned += count * 85;
          soldSummary.push(`${count}x Yün`);
        } else if (CROPS[item]) {
          earned += count * CROPS[item].sellPrice;
          soldSummary.push(`${count}x ${CROPS[item].name}`);
        }
      }
    });

    if (earned === 0) {
      showToast('📦 Satacak ürünün yok! Önce ekinleri hasat et veya yumurta topla.');
      return;
    }

    sound.playCoin();
    sound.playFanfare();
    setCoins((c) => c + earned);
    const newTotalScore = totalSoldValue + earned;
    setTotalSoldValue(newTotalScore);

    // Reset inventory
    setInventory({
      wheat: 0,
      carrot: 0,
      strawberry: 0,
      corn: 0,
      pumpkin: 0,
      egg: 0,
      wool: 0,
    });

    recordGameScore('farm', newTotalScore, earned);
    if (onGameOverScore) onGameOverScore(newTotalScore);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x: 0.7, y: 0.3 },
    });

    showToast(`💰 Pazar satışı tamamlandı! +${earned} Altın kazandın! (${soldSummary.join(', ')})`);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Top Farm Stats HUD */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl mb-3 backdrop-blur shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-base">
            <span className="text-xl">💰</span>
            <span className="tabular-nums">{coins} Altın</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span>Enerji: {energy}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 text-sm">
            {dayTime > 75 || dayTime < 25 ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span>Gün {day}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Toplam Pazar Skoru: <strong className="text-amber-300 tabular-nums">{totalSoldValue}</strong></span>
          </div>
          <button
            onClick={sellAllProduce}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Tüm Ürünleri Sat</span>
          </button>
        </div>
      </div>

      {/* Main Game Screen Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl flex justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onClick={handleCanvasClick}
          className="cursor-crosshair w-full max-w-[800px] h-auto object-contain block select-none"
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/95 text-white border border-amber-500/40 rounded-full text-xs font-medium shadow-lg backdrop-blur flex items-center gap-2 animate-fade-in pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* In-Game Controls Helper Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 pointer-events-none hidden sm:block">
          <div className="font-semibold text-amber-400 mb-0.5">🎮 Çiftlik Rehberi</div>
          <div>WASD: Gezin | Tıkla: Eylem yap | 1-4: Alet seç</div>
        </div>
      </div>

      {/* Farm Toolbelt & Crop Selection */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {/* Tools Section */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alet Çantası</div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setSelectedTool('hoe'); sound.playPop(); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTool === 'hoe' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Shovel className="w-3.5 h-3.5" />
              <span>(1) Çapa</span>
            </button>
            <button
              onClick={() => { setSelectedTool('water'); sound.playPop(); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTool === 'water' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>(2) Sula</span>
            </button>
            <button
              onClick={() => { setSelectedTool('seed'); sound.playPop(); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTool === 'seed' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>🌱</span>
              <span>(3) Tohum</span>
            </button>
            <button
              onClick={() => { setSelectedTool('harvest'); sound.playPop(); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTool === 'harvest' ? 'bg-rose-500 text-white font-bold shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>🌾</span>
              <span>(4) Hasat</span>
            </button>
          </div>
        </div>

        {/* Crops Selection */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tohum Seçimi</div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {Object.values(CROPS).map((crop) => (
              <button
                key={crop.id}
                onClick={() => {
                  setSelectedCrop(crop.id);
                  setSelectedTool('seed');
                  sound.playPop();
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  selectedCrop === crop.id && selectedTool === 'seed'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={`${crop.name} (Alış: ${crop.seedCost}G, Satış: ${crop.sellPrice}G)`}
              >
                <span>{crop.icon}</span>
                <span>{crop.name}</span>
                <span className="text-[10px] opacity-75">{crop.seedCost}G</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bag / Inventory Display */}
      <div className="w-full bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl mt-3 flex items-center justify-between text-xs text-slate-300">
        <div className="font-semibold text-slate-400">🎒 Depodaki Ürünler:</div>
        <div className="flex items-center gap-3">
          <span>🌾 Buğday: <strong className="text-white">{inventory.wheat || 0}</strong></span>
          <span>🥕 Havuç: <strong className="text-white">{inventory.carrot || 0}</strong></span>
          <span>🍓 Çilek: <strong className="text-white">{inventory.strawberry || 0}</strong></span>
          <span>🌽 Mısır: <strong className="text-white">{inventory.corn || 0}</strong></span>
          <span>🎃 Balkabağı: <strong className="text-white">{inventory.pumpkin || 0}</strong></span>
          <span>🥚 Yumurta: <strong className="text-white">{inventory.egg || 0}</strong></span>
          <span>🧶 Yün: <strong className="text-white">{inventory.wool || 0}</strong></span>
        </div>
      </div>
    </div>
  );
};
