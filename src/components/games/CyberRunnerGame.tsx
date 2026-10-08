import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audio';
import { recordGameScore } from '../../utils/storage';
import { Trophy, RefreshCw, Zap, Shield, Sparkles, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'spike' | 'high_laser' | 'drone';
}

interface Collectible {
  x: number;
  y: number;
  type: 'coin' | 'gem';
  collected: boolean;
}

export const CyberRunnerGame: React.FC<{ onGameOverScore?: (score: number) => void }> = ({ onGameOverScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(0);

  // Runner state
  const runner = useRef({
    x: 100,
    y: 360,
    vy: 0,
    isJumping: false,
    jumpCount: 0,
    isSliding: false,
    slideTimer: 0,
    w: 32,
    h: 52,
  });

  const obstacles = useRef<Obstacle[]>([]);
  const collectibles = useRef<Collectible[]>([]);
  const gameSpeed = useRef<number>(360);
  const distance = useRef<number>(0);
  const keys = useRef<Record<string, boolean>>({});

  const GROUND_Y = 400;

  const startGame = () => {
    runner.current.y = GROUND_Y - 52;
    runner.current.vy = 0;
    runner.current.jumpCount = 0;
    runner.current.isSliding = false;
    obstacles.current = [];
    collectibles.current = [];
    gameSpeed.current = 380;
    distance.current = 0;
    setScore(0);
    setCoins(0);
    setMultiplier(1);
    setGameState('PLAYING');
    sound.playPop();
  };

  const jump = () => {
    if (gameState !== 'PLAYING') return;
    if (runner.current.jumpCount < 2) {
      runner.current.vy = -540;
      runner.current.isJumping = true;
      runner.current.jumpCount += 1;
      runner.current.isSliding = false;
      sound.playJump();
    }
  };

  const slide = () => {
    if (gameState !== 'PLAYING') return;
    if (!runner.current.isJumping) {
      runner.current.isSliding = true;
      runner.current.slideTimer = 0.45;
      sound.playBounce();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current[k] = true;

      if (k === ' ' || e.key === 'ArrowUp' || k === 'w') {
        e.preventDefault();
        if (gameState === 'START' || gameState === 'GAMEOVER') {
          startGame();
        } else {
          jump();
        }
      } else if (e.key === 'ArrowDown' || k === 's') {
        e.preventDefault();
        slide();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Main Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let spawnTimer = 0;
    let collectSpawnTimer = 0;

    const loop = (currentTime: number) => {
      const dt = Math.min(0.04, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (gameState === 'PLAYING') {
        // Accelerate slightly over time
        gameSpeed.current += dt * 8;
        distance.current += (gameSpeed.current * dt) / 10;
        setScore(Math.floor(distance.current * multiplier));

        // Physics for runner
        const r = runner.current;
        if (r.isSliding) {
          r.slideTimer -= dt;
          r.h = 28;
          if (r.slideTimer <= 0) {
            r.isSliding = false;
            r.h = 52;
          }
        } else {
          r.h = 52;
        }

        r.vy += 1200 * dt; // Gravity
        r.y += r.vy * dt;

        if (r.y >= GROUND_Y - r.h) {
          r.y = GROUND_Y - r.h;
          r.vy = 0;
          r.isJumping = false;
          r.jumpCount = 0;
        }

        // Spawn obstacles
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          spawnTimer = 1.3 + Math.random() * 1.2;
          const rand = Math.random();
          if (rand < 0.45) {
            // Ground Spike / Barrier
            obstacles.current.push({
              x: canvas.width + 50,
              y: GROUND_Y - 36,
              w: 32,
              h: 36,
              type: 'spike',
            });
          } else if (rand < 0.75) {
            // High Laser barrier (must slide under!)
            obstacles.current.push({
              x: canvas.width + 50,
              y: GROUND_Y - 75,
              w: 48,
              h: 36,
              type: 'high_laser',
            });
          } else {
            // Flying drone
            obstacles.current.push({
              x: canvas.width + 50,
              y: GROUND_Y - 80,
              w: 34,
              h: 28,
              type: 'drone',
            });
          }
        }

        // Spawn collectibles
        collectSpawnTimer -= dt;
        if (collectSpawnTimer <= 0) {
          collectSpawnTimer = 0.8 + Math.random() * 1.1;
          const isGem = Math.random() < 0.25;
          const coinY = Math.random() < 0.5 ? GROUND_Y - 45 : GROUND_Y - 95;
          collectibles.current.push({
            x: canvas.width + 40,
            y: coinY,
            type: isGem ? 'gem' : 'coin',
            collected: false,
          });
        }

        // Move & Collide obstacles
        for (let i = obstacles.current.length - 1; i >= 0; i--) {
          const obs = obstacles.current[i];
          obs.x -= gameSpeed.current * dt;

          // AABB Hit Detection
          if (
            r.x + r.w > obs.x &&
            r.x < obs.x + obs.w &&
            r.y + r.h > obs.y &&
            r.y < obs.y + obs.h
          ) {
            // CRASH!
            sound.playExplosion();
            setGameState('GAMEOVER');
            const finalScore = Math.floor(distance.current * multiplier);
            if (finalScore > highScore) setHighScore(finalScore);
            recordGameScore('runner', finalScore, Math.floor(finalScore / 10));
            if (onGameOverScore) onGameOverScore(finalScore);
            break;
          }

          if (obs.x < -60) {
            obstacles.current.splice(i, 1);
          }
        }

        // Move & Collide collectibles
        for (let i = collectibles.current.length - 1; i >= 0; i--) {
          const c = collectibles.current[i];
          c.x -= gameSpeed.current * dt;

          if (!c.collected && Math.hypot(c.x - (r.x + r.w / 2), c.y - (r.y + r.h / 2)) < 30) {
            c.collected = true;
            sound.playCoin();
            setCoins((cnt) => cnt + (c.type === 'gem' ? 5 : 1));
            setMultiplier((m) => Math.min(5, m + (c.type === 'gem' ? 0.5 : 0.1)));
          }

          if (c.x < -40 || c.collected) {
            collectibles.current.splice(i, 1);
          }
        }
      }

      // Render Scene
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Synthwave Cyber City Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, '#090514');
      skyGrad.addColorStop(0.6, '#1B0A2A');
      skyGrad.addColorStop(1, '#4A154B');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, GROUND_Y);

      // Glowing Retro Sun
      const sunGrad = ctx.createLinearGradient(canvas.width / 2, 80, canvas.width / 2, 260);
      sunGrad.addColorStop(0, '#F59E0B');
      sunGrad.addColorStop(1, '#EC4899');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 170, 70, 0, Math.PI * 2);
      ctx.fill();

      // Skyline Silhouettes (Parallax)
      ctx.fillStyle = '#0F081D';
      const skylineOffset = (currentTime * 0.04) % 180;
      for (let i = -180; i < canvas.width + 180; i += 70) {
        const h = 70 + ((Math.abs(i) * 17) % 90);
        ctx.fillRect(i - skylineOffset, GROUND_Y - h, 50, h);
      }

      // Ground Highway
      ctx.fillStyle = '#0A0E1A';
      ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

      // Neon Highway Grid
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(canvas.width, GROUND_Y);
      ctx.stroke();

      // Moving road stripes
      const stripeOffset = (currentTime * 0.4) % 60;
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.lineWidth = 1;
      for (let x = -60; x < canvas.width + 60; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x - stripeOffset, GROUND_Y);
        ctx.lineTo(x - stripeOffset - 40, canvas.height);
        ctx.stroke();
      }

      // Draw Collectibles
      collectibles.current.forEach((c) => {
        if (c.collected) return;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.fillStyle = c.type === 'gem' ? '#A855F7' : '#FBBF24';
        ctx.shadowColor = c.type === 'gem' ? '#C084FC' : '#FDE047';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, c.type === 'gem' ? 9 : 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Obstacles
      obstacles.current.forEach((obs) => {
        ctx.save();
        if (obs.type === 'spike') {
          ctx.fillStyle = '#EF4444';
          ctx.shadowColor = '#F87171';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.h);
          ctx.lineTo(obs.x + obs.w / 2, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.fill();
        } else if (obs.type === 'high_laser') {
          // Floating laser beam (slide under)
          ctx.fillStyle = '#38BDF8';
          ctx.shadowColor = '#38BDF8';
          ctx.shadowBlur = 12;
          ctx.fillRect(obs.x, obs.y, obs.w, 10);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.fillRect(obs.x, obs.y + 10, obs.w, obs.h - 10);
        } else {
          // Drone
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Runner Player
      const r = runner.current;
      ctx.save();
      ctx.translate(r.x, r.y);

      // Cyber glow
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 12;

      if (r.isSliding) {
        // Sliding pose
        ctx.fillStyle = '#06B6D4';
        ctx.fillRect(0, 10, 48, 18);
        ctx.fillStyle = '#EC4899';
        ctx.fillRect(36, 12, 10, 10); // Visor
      } else {
        // Running / Jumping pose
        ctx.fillStyle = '#06B6D4';
        ctx.fillRect(6, 16, 20, 24); // Torso

        ctx.fillStyle = '#EC4899';
        ctx.fillRect(10, 4, 14, 12); // Helmet & Visor

        // Legs
        ctx.fillStyle = '#3B82F6';
        if (r.isJumping) {
          ctx.fillRect(4, 40, 8, 12);
          ctx.fillRect(18, 40, 8, 12);
        } else {
          const runCycle = Math.sin(currentTime * 0.02) * 6;
          ctx.fillRect(4, 40, 8, 12 + runCycle);
          ctx.fillRect(18, 40, 8, 12 - runCycle);
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, multiplier]);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Top Runner HUD */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl mb-3 backdrop-blur shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-base">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="tabular-nums">Mesafe: {score}m</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-sm">
            <span className="text-base">🪙</span>
            <span className="tabular-nums">{coins} Çip</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-sm bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-md">
            <span>Çarpan: x{multiplier.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">
            En Yüksek Skor: <strong className="text-amber-300 tabular-nums">{highScore}</strong>
          </div>
        </div>
      </div>

      {/* Main Runner Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl flex justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          className="w-full max-w-[800px] h-auto object-contain block select-none"
        />

        {/* Start Game Modal */}
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in z-20">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-3">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 font-display">SİBER KOŞUCU: NEON DASH</h2>
            <p className="text-xs text-slate-300 mb-6 text-center max-w-md">
              Engellerin üzerinden zıplayın, lazer bariyerlerinin altından kayın ve veri çiplerini toplayarak rekor kırın!
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Koşuya Başla (SPACE)</span>
            </button>
          </div>
        )}

        {/* Game Over Modal */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in z-20">
            <h2 className="text-3xl font-black text-rose-500 mb-1 font-display">SİSTEM AŞIRI YÜKLENDİ!</h2>
            <div className="text-slate-300 text-sm mb-4">Mesafe: <strong className="text-white text-lg">{score}m</strong> · Toplanan: <strong className="text-amber-400">{coins} Çip</strong></div>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tekrar Dene (SPACE)</span>
            </button>
          </div>
        )}

        {/* In-Game Helper Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 pointer-events-none hidden sm:block">
          <div><strong className="text-cyan-400">SPACE / ↑</strong>: Zıpla (2x Çift Zıpla) · <strong className="text-fuchsia-400">↓ / S</strong>: Kayma</div>
        </div>
      </div>
    </div>
  );
};
