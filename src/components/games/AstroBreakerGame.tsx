import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audio';
import { recordGameScore } from '../../utils/storage';
import { Trophy, RefreshCw, Zap, Shield, Sparkles, Play, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  color: string;
  points: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isFireball: boolean;
}

interface PowerDrop {
  x: number;
  y: number;
  type: 'multiball' | 'wide' | 'laser' | 'fireball' | 'life';
  timer: number;
}

interface LaserShot {
  x: number;
  y: number;
}

export const AstroBreakerGame: React.FC<{ onGameOverScore?: (score: number) => void }> = ({ onGameOverScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('START');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [laserActive, setLaserActive] = useState<boolean>(false);

  const paddle = useRef({
    x: 350,
    y: 450,
    w: 100,
    h: 14,
    speed: 500,
  });

  const balls = useRef<Ball[]>([]);
  const bricks = useRef<Brick[]>([]);
  const powerDrops = useRef<PowerDrop[]>([]);
  const laserShots = useRef<LaserShot[]>([]);
  const keys = useRef<Record<string, boolean>>({});

  const initLevel = (lvl: number) => {
    paddle.current.x = 350;
    paddle.current.w = 100;

    balls.current = [
      {
        x: 400,
        y: 430,
        vx: (Math.random() - 0.5) * 200,
        vy: -320,
        radius: 7,
        isFireball: false,
      },
    ];

    powerDrops.current = [];
    laserShots.current = [];

    // Build brick grid
    const bList: Brick[] = [];
    const rows = 5 + Math.min(3, lvl);
    const cols = 9;
    const bWidth = 74;
    const bHeight = 22;
    const offsetX = 58;
    const offsetY = 50;

    const rowColors = ['#F43F5E', '#FB923C', '#FBBF24', '#34D399', '#38BDF8', '#818CF8', '#C084FC'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hp = r === 0 ? 2 : 1;
        bList.push({
          x: offsetX + c * (bWidth + 8),
          y: offsetY + r * (bHeight + 8),
          w: bWidth,
          h: bHeight,
          hp,
          maxHp: hp,
          color: rowColors[r % rowColors.length],
          points: (rows - r) * 20,
        });
      }
    }

    bricks.current = bList;
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    initLevel(1);
    setGameState('PLAYING');
    sound.playPop();
  };

  // Keyboard and Mouse Event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current[k] = true;
      if (e.key === 'ArrowLeft' || k === 'a') keys.current['left'] = true;
      if (e.key === 'ArrowRight' || k === 'd') keys.current['right'] = true;

      if (e.key === ' ' || e.key === 'ArrowUp') {
        if (gameState === 'START' || gameState === 'GAMEOVER' || gameState === 'VICTORY') {
          startGame();
        } else if (laserActive) {
          // Shoot paddle lasers
          shootLaser();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current[k] = false;
      if (e.key === 'ArrowLeft' || k === 'a') keys.current['left'] = false;
      if (e.key === 'ArrowRight' || k === 'd') keys.current['right'] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, laserActive]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    paddle.current.x = Math.max(10, Math.min(canvas.width - paddle.current.w - 10, mouseX - paddle.current.w / 2));
  };

  const shootLaser = () => {
    sound.playLaserShot();
    laserShots.current.push({ x: paddle.current.x + 10, y: paddle.current.y - 10 });
    laserShots.current.push({ x: paddle.current.x + paddle.current.w - 10, y: paddle.current.y - 10 });
  };

  // Main Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.04, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (gameState === 'PLAYING') {
        // Keyboard paddle movement
        if (keys.current['left']) {
          paddle.current.x = Math.max(10, paddle.current.x - paddle.current.speed * dt);
        }
        if (keys.current['right']) {
          paddle.current.x = Math.min(canvas.width - paddle.current.w - 10, paddle.current.x + paddle.current.speed * dt);
        }

        // Move Laser Shots
        for (let i = laserShots.current.length - 1; i >= 0; i--) {
          const lz = laserShots.current[i];
          lz.y -= 600 * dt;

          // Check hit brick
          for (let bIdx = bricks.current.length - 1; bIdx >= 0; bIdx--) {
            const b = bricks.current[bIdx];
            if (lz.x >= b.x && lz.x <= b.x + b.w && lz.y >= b.y && lz.y <= b.y + b.h) {
              sound.playHarvest();
              b.hp -= 1;
              if (b.hp <= 0) {
                setScore((s) => s + b.points);
                bricks.current.splice(bIdx, 1);
              }
              laserShots.current.splice(i, 1);
              break;
            }
          }

          if (lz.y < -10) {
            laserShots.current.splice(i, 1);
          }
        }

        // Move Power Drops
        for (let i = powerDrops.current.length - 1; i >= 0; i--) {
          const drop = powerDrops.current[i];
          drop.y += 180 * dt;

          // Hit paddle
          const pad = paddle.current;
          if (
            drop.x >= pad.x &&
            drop.x <= pad.x + pad.w &&
            drop.y >= pad.y &&
            drop.y <= pad.y + pad.h
          ) {
            sound.playCoin();
            if (drop.type === 'multiball') {
              if (balls.current.length > 0) {
                const b = balls.current[0];
                balls.current.push({ ...b, vx: b.vx + 140 });
                balls.current.push({ ...b, vx: b.vx - 140 });
              }
            } else if (drop.type === 'wide') {
              pad.w = Math.min(180, pad.w + 40);
            } else if (drop.type === 'laser') {
              setLaserActive(true);
              setTimeout(() => setLaserActive(false), 8000);
            } else if (drop.type === 'fireball') {
              balls.current.forEach((b) => (b.isFireball = true));
              setTimeout(() => {
                balls.current.forEach((b) => (b.isFireball = false));
              }, 7000);
            } else if (drop.type === 'life') {
              setLives((l) => Math.min(5, l + 1));
            }

            powerDrops.current.splice(i, 1);
            continue;
          }

          if (drop.y > canvas.height + 20) {
            powerDrops.current.splice(i, 1);
          }
        }

        // Move Balls
        for (let i = balls.current.length - 1; i >= 0; i--) {
          const ball = balls.current[i];
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;

          // Left/Right walls
          if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = -ball.vx;
            sound.playBounce();
          } else if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.vx = -ball.vx;
            sound.playBounce();
          }

          // Top wall
          if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy = -ball.vy;
            sound.playBounce();
          }

          // Paddle collision
          const pad = paddle.current;
          if (
            ball.y + ball.radius >= pad.y &&
            ball.y - ball.radius <= pad.y + pad.h &&
            ball.x >= pad.x &&
            ball.x <= pad.x + pad.w &&
            ball.vy > 0
          ) {
            sound.playBounce();
            ball.y = pad.y - ball.radius;
            // Angle based on hit offset
            const hitOffset = (ball.x - (pad.x + pad.w / 2)) / (pad.w / 2);
            const speed = Math.hypot(ball.vx, ball.vy);
            ball.vx = hitOffset * 320;
            ball.vy = -Math.abs(Math.sqrt(Math.max(10000, speed * speed - ball.vx * ball.vx)));
          }

          // Brick collision
          for (let bIdx = bricks.current.length - 1; bIdx >= 0; bIdx--) {
            const b = bricks.current[bIdx];
            if (
              ball.x + ball.radius >= b.x &&
              ball.x - ball.radius <= b.x + b.w &&
              ball.y + ball.radius >= b.y &&
              ball.y - ball.radius <= b.y + b.h
            ) {
              sound.playHarvest();
              b.hp -= 1;

              if (!ball.isFireball) {
                // Determine bounce direction
                const prevX = ball.x - ball.vx * dt;
                if (prevX < b.x || prevX > b.x + b.w) {
                  ball.vx = -ball.vx;
                } else {
                  ball.vy = -ball.vy;
                }
              }

              if (b.hp <= 0) {
                setScore((s) => s + b.points);

                // Chance to spawn power drop
                if (Math.random() < 0.28) {
                  const types: ('multiball' | 'wide' | 'laser' | 'fireball' | 'life')[] = [
                    'multiball',
                    'wide',
                    'laser',
                    'fireball',
                    'life',
                  ];
                  powerDrops.current.push({
                    x: b.x + b.w / 2,
                    y: b.y + b.h / 2,
                    type: types[Math.floor(Math.random() * types.length)],
                    timer: 15,
                  });
                }

                bricks.current.splice(bIdx, 1);
              }
              break;
            }
          }

          // Bottom death
          if (ball.y > canvas.height + 20) {
            balls.current.splice(i, 1);
          }
        }

        // Check Ball Loss
        if (balls.current.length === 0) {
          sound.playExplosion();
          const remLives = lives - 1;
          setLives(remLives);

          if (remLives <= 0) {
            setGameState('GAMEOVER');
            recordGameScore('breaker', score, Math.floor(score / 8));
            if (onGameOverScore) onGameOverScore(score);
          } else {
            // Respawn single ball
            balls.current = [
              {
                x: paddle.current.x + paddle.current.w / 2,
                y: paddle.current.y - 12,
                vx: (Math.random() - 0.5) * 200,
                vy: -320,
                radius: 7,
                isFireball: false,
              },
            ];
          }
        }

        // Check Victory (All bricks cleared)
        if (bricks.current.length === 0) {
          sound.playFanfare();
          confetti({ particleCount: 75, spread: 80, origin: { x: 0.5, y: 0.5 } });
          const nextLvl = level + 1;
          setLevel(nextLvl);
          initLevel(nextLvl);
        }
      }

      // Render Screen
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cosmic background
      ctx.fillStyle = '#080C16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant stars
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let s = 0; s < 50; s++) {
        const sx = (s * 97) % canvas.width;
        const sy = (s * 131) % canvas.height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Draw Bricks
      bricks.current.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        // Brick 3D highlight & bevel
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(b.x, b.y, b.w, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(b.x, b.y + b.h - 3, b.w, 3);

        if (b.hp > 1) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
        }
      });

      // Draw Power Drops
      powerDrops.current.forEach((drop) => {
        ctx.save();
        ctx.translate(drop.x, drop.y);
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let icon = '⚡';
        if (drop.type === 'multiball') icon = '🔴';
        if (drop.type === 'wide') icon = '↔️';
        if (drop.type === 'laser') icon = '🔫';
        if (drop.type === 'fireball') icon = '🔥';
        if (drop.type === 'life') icon = '❤️';
        ctx.fillText(icon, 0, 0);

        ctx.restore();
      });

      // Draw Lasers
      laserShots.current.forEach((lz) => {
        ctx.fillStyle = '#EC4899';
        ctx.shadowColor = '#F43F5E';
        ctx.shadowBlur = 8;
        ctx.fillRect(lz.x - 2, lz.y, 4, 14);
        ctx.shadowBlur = 0;
      });

      // Draw Balls
      balls.current.forEach((ball) => {
        ctx.fillStyle = ball.isFireball ? '#EF4444' : '#38BDF8';
        ctx.shadowColor = ball.isFireball ? '#F87171' : '#7DD3FC';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Paddle
      const pad = paddle.current;
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(pad.x + 4, pad.y + 2, pad.w - 8, 4);

      if (laserActive) {
        ctx.fillStyle = '#F43F5E';
        ctx.fillRect(pad.x + 4, pad.y - 6, 6, 6);
        ctx.fillRect(pad.x + pad.w - 10, pad.y - 6, 6, 6);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, lives, level, laserActive]);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Top HUD */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl mb-3 backdrop-blur shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold text-base">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="tabular-nums">Skor: {score}</span>
          </div>
          <div className="flex items-center gap-1 text-rose-400 font-semibold text-sm">
            {Array.from({ length: lives }).map((_, i) => (
              <Heart key={i} className="w-4 h-4 fill-rose-500" />
            ))}
          </div>
          <div className="text-slate-300 text-sm font-semibold">
            Bölüm: <span className="text-white tabular-nums">{level}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {laserActive && (
            <div className="text-xs font-bold text-pink-400 bg-pink-950/60 border border-pink-800/80 px-2.5 py-1 rounded-md animate-pulse">
              🔫 Lazer Aktif (SPACE ile ateş et)
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl flex justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          onMouseMove={handleMouseMove}
          className="cursor-none w-full max-w-[800px] h-auto object-contain block select-none"
        />

        {gameState === 'START' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in z-20">
            <h2 className="text-3xl font-black text-white mb-2 font-display">GALAKSİ TUĞLA KIRICI: NOVA BREAKER</h2>
            <p className="text-xs text-slate-300 mb-6 text-center max-w-md">
              Kozmik tuğlaları parçalayın, çoklu top ve lazer güçlendirmelerini yakalayarak yüksek skorlar elde edin!
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Oyuna Başla</span>
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in z-20">
            <h2 className="text-3xl font-black text-rose-500 mb-1 font-display">OYUN BİTTİ</h2>
            <div className="text-slate-300 text-sm mb-4">Toplam Skorunuz: <strong className="text-white text-lg">{score}</strong></div>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yeniden Başla</span>
            </button>
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 pointer-events-none hidden sm:block">
          <div><strong className="text-sky-400">Fare / A - D Tuşları</strong>: Raket Kontrolü · <strong className="text-amber-400">SPACE</strong>: Lazer Ateşi</div>
        </div>
      </div>
    </div>
  );
};
