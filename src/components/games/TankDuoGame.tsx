import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audio';
import { recordGameScore } from '../../utils/storage';
import { Trophy, RefreshCw, Zap, Shield, Flame, Bot, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Tank {
  x: number;
  y: number;
  angle: number;
  hp: number;
  score: number;
  color: string;
  turretColor: string;
  name: string;
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    fire: boolean;
  };
  cooldown: number;
  shield: boolean;
  tripleShot: boolean;
  speedBoost: boolean;
  powerupTimer: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: number; // 1 or 2
  bounces: number;
  maxBounces: number;
  isLaser?: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  destructible: boolean;
  hp: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'shield' | 'triple' | 'speed' | 'heal';
  timer: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
}

export const TankDuoGame: React.FC<{ onGameOverScore?: (score: number) => void }> = ({ onGameOverScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [scores, setScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [isBotMode, setIsBotMode] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Tanks references
  const tank1 = useRef<Tank>({
    x: 100,
    y: 240,
    angle: 0,
    hp: 3,
    score: 0,
    color: '#3B82F6',
    turretColor: '#1D4ED8',
    name: '1. OYUNCU (Mavi)',
    keys: { up: false, down: false, left: false, right: false, fire: false },
    cooldown: 0,
    shield: false,
    tripleShot: false,
    speedBoost: false,
    powerupTimer: 0,
  });

  const tank2 = useRef<Tank>({
    x: 700,
    y: 240,
    angle: Math.PI,
    hp: 3,
    score: 0,
    color: '#EF4444',
    turretColor: '#B91C1C',
    name: '2. OYUNCU (Kırmızı)',
    keys: { up: false, down: false, left: false, right: false, fire: false },
    cooldown: 0,
    shield: false,
    tripleShot: false,
    speedBoost: false,
    powerupTimer: 0,
  });

  const bullets = useRef<Bullet[]>([]);
  const obstacles = useRef<Obstacle[]>([]);
  const powerups = useRef<PowerUp[]>([]);
  const particles = useRef<Particle[]>([]);
  const roundEnded = useRef<boolean>(false);

  // Initialize Map Obstacles
  const initArena = () => {
    const obs: Obstacle[] = [];
    // Outer border walls
    obs.push({ x: 0, y: 0, w: 800, h: 16, destructible: false, hp: 999 });
    obs.push({ x: 0, y: 464, w: 800, h: 16, destructible: false, hp: 999 });
    obs.push({ x: 0, y: 0, w: 16, h: 480, destructible: false, hp: 999 });
    obs.push({ x: 784, y: 0, w: 16, h: 480, destructible: false, hp: 999 });

    // Center pillars & covers
    obs.push({ x: 380, y: 80, w: 40, h: 100, destructible: false, hp: 999 });
    obs.push({ x: 380, y: 300, w: 40, h: 100, destructible: false, hp: 999 });

    // Left and Right inner cover
    obs.push({ x: 220, y: 180, w: 30, h: 120, destructible: false, hp: 999 });
    obs.push({ x: 550, y: 180, w: 30, h: 120, destructible: false, hp: 999 });

    // Destructible wooden crates
    obs.push({ x: 380, y: 220, w: 40, h: 40, destructible: true, hp: 2 });
    obs.push({ x: 280, y: 90, w: 35, h: 35, destructible: true, hp: 2 });
    obs.push({ x: 485, y: 90, w: 35, h: 35, destructible: true, hp: 2 });
    obs.push({ x: 280, y: 355, w: 35, h: 35, destructible: true, hp: 2 });
    obs.push({ x: 485, y: 355, w: 35, h: 35, destructible: true, hp: 2 });

    obstacles.current = obs;
    bullets.current = [];
    powerups.current = [
      { x: 400, y: 130, type: 'triple', timer: 25 },
      { x: 400, y: 350, type: 'shield', timer: 25 },
    ];
  };

  const resetRound = () => {
    roundEnded.current = false;
    setRoundWinner(null);
    tank1.current.x = 100;
    tank1.current.y = 240;
    tank1.current.angle = 0;
    tank1.current.hp = 3;
    tank1.current.cooldown = 0;
    tank1.current.shield = false;
    tank1.current.tripleShot = false;

    tank2.current.x = 700;
    tank2.current.y = 240;
    tank2.current.angle = Math.PI;
    tank2.current.hp = 3;
    tank2.current.cooldown = 0;
    tank2.current.shield = false;
    tank2.current.tripleShot = false;

    initArena();
  };

  const restartFullMatch = () => {
    setScores({ p1: 0, p2: 0 });
    tank1.current.score = 0;
    tank2.current.score = 0;
    setMatchWinner(null);
    resetRound();
  };

  // Keyboard Event Handlers
  useEffect(() => {
    initArena();

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // P1 Keys: WASD + Space/Q
      if (key === 'w') tank1.current.keys.up = true;
      if (key === 's') tank1.current.keys.down = true;
      if (key === 'a') tank1.current.keys.left = true;
      if (key === 'd') tank1.current.keys.right = true;
      if (key === ' ' || key === 'q') {
        if (!tank1.current.keys.fire) {
          tank1.current.keys.fire = true;
          fireBullet(1);
        }
      }

      // P2 Keys: Arrows + Enter/M/Numpad0
      if (!isBotMode) {
        if (e.key === 'ArrowUp') tank2.current.keys.up = true;
        if (e.key === 'ArrowDown') tank2.current.keys.down = true;
        if (e.key === 'ArrowLeft') tank2.current.keys.left = true;
        if (e.key === 'ArrowRight') tank2.current.keys.right = true;
        if (e.key === 'Enter' || key === 'm' || e.key === '0') {
          if (!tank2.current.keys.fire) {
            tank2.current.keys.fire = true;
            fireBullet(2);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w') tank1.current.keys.up = false;
      if (key === 's') tank1.current.keys.down = false;
      if (key === 'a') tank1.current.keys.left = false;
      if (key === 'd') tank1.current.keys.right = false;
      if (key === ' ' || key === 'q') tank1.current.keys.fire = false;

      if (!isBotMode) {
        if (e.key === 'ArrowUp') tank2.current.keys.up = false;
        if (e.key === 'ArrowDown') tank2.current.keys.down = false;
        if (e.key === 'ArrowLeft') tank2.current.keys.left = false;
        if (e.key === 'ArrowRight') tank2.current.keys.right = false;
        if (e.key === 'Enter' || key === 'm' || e.key === '0') tank2.current.keys.fire = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isBotMode]);

  const fireBullet = (playerIndex: number) => {
    if (roundEnded.current) return;
    const tank = playerIndex === 1 ? tank1.current : tank2.current;
    if (tank.cooldown > 0) return;

    tank.cooldown = 0.28; // Cooldown between shots
    sound.playLaserShot();

    const speed = 360;
    const barrelLength = 22;
    const spawnX = tank.x + Math.cos(tank.angle) * barrelLength;
    const spawnY = tank.y + Math.sin(tank.angle) * barrelLength;

    if (tank.tripleShot) {
      [-0.2, 0, 0.2].forEach((spread) => {
        bullets.current.push({
          x: spawnX,
          y: spawnY,
          vx: Math.cos(tank.angle + spread) * speed,
          vy: Math.sin(tank.angle + spread) * speed,
          owner: playerIndex,
          bounces: 0,
          maxBounces: 2,
        });
      });
    } else {
      bullets.current.push({
        x: spawnX,
        y: spawnY,
        vx: Math.cos(tank.angle) * speed,
        vy: Math.sin(tank.angle) * speed,
        owner: playerIndex,
        bounces: 0,
        maxBounces: 2,
      });
    }
  };

  const spawnExplosion = (x: number, y: number, color: string) => {
    sound.playExplosion();
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 50 + Math.random() * 140;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
      });
    }
  };

  // Main Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (!isPaused && !matchWinner) {
        // AI Bot logic for Tank 2 if Bot mode is enabled
        if (isBotMode && !roundEnded.current) {
          const t2 = tank2.current;
          const t1 = tank1.current;
          const dx = t1.x - t2.x;
          const dy = t1.y - t2.y;
          const targetAngle = Math.atan2(dy, dx);
          let diff = targetAngle - t2.angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;

          if (diff > 0.05) t2.angle += 3.2 * dt;
          else if (diff < -0.05) t2.angle -= 3.2 * dt;

          const dist = Math.hypot(dx, dy);
          if (dist > 180) {
            t2.keys.up = true;
          } else {
            t2.keys.up = false;
          }

          if (Math.abs(diff) < 0.25 && Math.random() < 0.08) {
            fireBullet(2);
          }
        }

        // Update Tanks
        [tank1.current, tank2.current].forEach((t) => {
          if (t.cooldown > 0) t.cooldown -= dt;
          if (t.powerupTimer > 0) {
            t.powerupTimer -= dt;
            if (t.powerupTimer <= 0) {
              t.tripleShot = false;
              t.speedBoost = false;
            }
          }

          const rotSpeed = 3.2;
          if (t.keys.left) t.angle -= rotSpeed * dt;
          if (t.keys.right) t.angle += rotSpeed * dt;

          const moveSpeed = t.speedBoost ? 190 : 130;
          let moveX = 0;
          let moveY = 0;
          if (t.keys.up) {
            moveX += Math.cos(t.angle) * moveSpeed * dt;
            moveY += Math.sin(t.angle) * moveSpeed * dt;
          }
          if (t.keys.down) {
            moveX -= Math.cos(t.angle) * (moveSpeed * 0.6) * dt;
            moveY -= Math.sin(t.angle) * (moveSpeed * 0.6) * dt;
          }

          // Wall collision for tanks
          const newX = t.x + moveX;
          const newY = t.y + moveY;
          const tankRadius = 16;

          let collided = false;
          for (const obs of obstacles.current) {
            if (
              newX + tankRadius > obs.x &&
              newX - tankRadius < obs.x + obs.w &&
              newY + tankRadius > obs.y &&
              newY - tankRadius < obs.y + obs.h
            ) {
              collided = true;
              break;
            }
          }

          if (!collided) {
            t.x = newX;
            t.y = newY;
          }
        });

        // Update Bullets & Bounces
        bullets.current.forEach((b) => {
          b.x += b.vx * dt;
          b.y += b.vy * dt;

          // Check collisions with obstacles
          for (let i = obstacles.current.length - 1; i >= 0; i--) {
            const obs = obstacles.current[i];
            if (b.x >= obs.x && b.x <= obs.x + obs.w && b.y >= obs.y && b.y <= obs.y + obs.h) {
              if (obs.destructible) {
                obs.hp -= 1;
                spawnExplosion(b.x, b.y, '#F59E0B');
                b.bounces = b.maxBounces + 1; // destroy bullet
                if (obs.hp <= 0) {
                  obstacles.current.splice(i, 1);
                }
              } else {
                // Bounce off wall
                b.bounces += 1;
                sound.playBounce();
                // Determine horizontal or vertical bounce
                if (b.x - b.vx * dt < obs.x || b.x - b.vx * dt > obs.x + obs.w) {
                  b.vx = -b.vx;
                } else {
                  b.vy = -b.vy;
                }
              }
              break;
            }
          }

          // Check collision with tanks
          const hitCheck = (t: Tank, tankIdx: number) => {
            const dist = Math.hypot(b.x - t.x, b.y - t.y);
            if (dist < 18 && !roundEnded.current) {
              if (t.shield) {
                t.shield = false;
                sound.playBounce();
                spawnExplosion(t.x, t.y, '#38BDF8');
                b.bounces = b.maxBounces + 1;
              } else {
                t.hp -= 1;
                spawnExplosion(t.x, t.y, t.color);
                b.bounces = b.maxBounces + 1;

                if (t.hp <= 0 && !roundEnded.current) {
                  roundEnded.current = true;
                  const winnerIdx = tankIdx === 1 ? 2 : 1;
                  const winName = winnerIdx === 1 ? tank1.current.name : tank2.current.name;
                  setRoundWinner(winName);

                  if (winnerIdx === 1) {
                    tank1.current.score += 1;
                    setScores((s) => ({ ...s, p1: s.p1 + 1 }));
                  } else {
                    tank2.current.score += 1;
                    setScores((s) => ({ ...s, p2: s.p2 + 1 }));
                  }

                  const p1Score = tank1.current.score;
                  const p2Score = tank2.current.score;

                  // Check 5 rounds match win
                  if (p1Score >= 5 || p2Score >= 5) {
                    const finalChamp = p1Score >= 5 ? tank1.current.name : tank2.current.name;
                    setMatchWinner(finalChamp);
                    sound.playFanfare();
                    confetti({ particleCount: 100, spread: 90, origin: { x: 0.5, y: 0.5 } });
                    recordGameScore('tank', Math.max(p1Score, p2Score), 150);
                    if (onGameOverScore) onGameOverScore(Math.max(p1Score, p2Score));
                  } else {
                    sound.playCoin();
                    setTimeout(() => {
                      resetRound();
                    }, 2200);
                  }
                }
              }
            }
          };

          hitCheck(tank1.current, 1);
          hitCheck(tank2.current, 2);
        });

        // Remove expired bullets
        bullets.current = bullets.current.filter((b) => b.bounces <= b.maxBounces);

        // Power-ups pickup
        powerups.current.forEach((pw, idx) => {
          [tank1.current, tank2.current].forEach((t) => {
            const dist = Math.hypot(pw.x - t.x, pw.y - t.y);
            if (dist < 26) {
              sound.playCoin();
              if (pw.type === 'shield') t.shield = true;
              if (pw.type === 'triple') {
                t.tripleShot = true;
                t.powerupTimer = 10;
              }
              if (pw.type === 'speed') {
                t.speedBoost = true;
                t.powerupTimer = 8;
              }
              if (pw.type === 'heal') t.hp = Math.min(3, t.hp + 1);

              powerups.current.splice(idx, 1);
            }
          });
        });

        // Spawn periodic powerup
        if (powerups.current.length < 2 && Math.random() < 0.005) {
          const types: ('shield' | 'triple' | 'speed' | 'heal')[] = ['shield', 'triple', 'speed', 'heal'];
          powerups.current.push({
            x: 200 + Math.random() * 400,
            y: 100 + Math.random() * 280,
            type: types[Math.floor(Math.random() * types.length)],
            timer: 20,
          });
        }

        // Update Particles
        particles.current.forEach((p) => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
        });
        particles.current = particles.current.filter((p) => p.life > 0);
      }

      // Render Arena
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Arena Grid Background
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Obstacles
      obstacles.current.forEach((obs) => {
        if (obs.destructible) {
          ctx.fillStyle = '#B45309'; // Wooden crate
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.strokeStyle = '#78350F';
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          // Crate cross
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.moveTo(obs.x + obs.w, obs.y);
          ctx.lineTo(obs.x, obs.y + obs.h);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#334155'; // Solid metal barrier
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        }
      });

      // Draw Power-ups
      powerups.current.forEach((pw) => {
        const pulse = (Math.sin(currentTime * 0.008) + 1) * 3;
        ctx.save();
        ctx.translate(pw.x, pw.y);

        ctx.fillStyle = pw.type === 'shield' ? '#0284C7' : pw.type === 'triple' ? '#E11D48' : '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, 14 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let icon = '⚡';
        if (pw.type === 'shield') icon = '🛡️';
        if (pw.type === 'triple') icon = '🔥';
        if (pw.type === 'heal') icon = '❤️';
        ctx.fillText(icon, 0, 0);

        ctx.restore();
      });

      // Draw Bullets
      bullets.current.forEach((b) => {
        ctx.fillStyle = b.owner === 1 ? '#60A5FA' : '#F87171';
        ctx.shadowColor = b.owner === 1 ? '#3B82F6' : '#EF4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Particles
      particles.current.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw Tanks
      const drawTank = (t: Tank) => {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle);

        // Shield glow
        if (t.shield) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Treads
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(-15, -14, 30, 6);
        ctx.fillRect(-15, 8, 30, 6);

        // Tank Body
        ctx.fillStyle = t.color;
        ctx.fillRect(-13, -10, 26, 20);

        // Turret Barrel
        ctx.fillStyle = t.turretColor;
        ctx.fillRect(0, -3, 20, 6);

        // Turret Dome
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Tank Health Bar above
        const barWidth = 36;
        const barHeight = 5;
        const barX = t.x - barWidth / 2;
        const barY = t.y - 25;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const hpRatio = t.hp / 3;
        ctx.fillStyle = hpRatio > 0.6 ? '#22C55E' : hpRatio > 0.3 ? '#F59E0B' : '#EF4444';
        ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
      };

      drawTank(tank1.current);
      drawTank(tank2.current);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isBotMode, matchWinner]);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Top Match HUD */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl mb-3 backdrop-blur shadow-md">
        {/* Player 1 Stats */}
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
          <div>
            <div className="text-xs font-bold text-blue-400">1. OYUNCU (Mavi)</div>
            <div className="text-[11px] text-slate-400">WASD + Space</div>
          </div>
          <div className="text-2xl font-black text-white px-3 py-0.5 bg-blue-950/60 border border-blue-800 rounded-lg tabular-nums">
            {scores.p1}
          </div>
        </div>

        {/* Center Target & Bot Toggle */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded-full uppercase tracking-wider">
            Hedef: 5 Galibiyet
          </div>
          <button
            onClick={() => {
              setIsBotMode(!isBotMode);
              sound.playPop();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isBotMode ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isBotMode ? <Bot className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            <span>{isBotMode ? 'Bot Modu Açık' : '2 Kişi Aynı PC'}</span>
          </button>
        </div>

        {/* Player 2 Stats */}
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black text-white px-3 py-0.5 bg-rose-950/60 border border-rose-800 rounded-lg tabular-nums">
            {scores.p2}
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-rose-400">{isBotMode ? 'YAPAY ZEKA (Bot)' : '2. OYUNCU (Kırmızı)'}</div>
            <div className="text-[11px] text-slate-400">Yön Tuşları + Enter</div>
          </div>
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl flex justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          className="w-full max-w-[800px] h-auto object-contain block select-none"
        />

        {/* Round Winner Notification Overlay */}
        {roundWinner && !matchWinner && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in z-20">
            <div className="text-2xl font-black text-white mb-2 font-display">{roundWinner} Raundu Kazandı!</div>
            <div className="text-sm text-slate-400">Yeni raunt başlıyor...</div>
          </div>
        )}

        {/* Match Champion Victory Modal */}
        {matchWinner && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in z-30">
            <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-bounce" />
            <h2 className="text-3xl font-black text-white mb-1 font-display">ŞAMPİYON: {matchWinner}</h2>
            <p className="text-sm text-slate-300 mb-6">Muazzam düello! 5 rauntluk zafer kupası kazanıldı.</p>
            <button
              onClick={restartFullMatch}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yeniden Oyna (Yeni Maç)</span>
            </button>
          </div>
        )}
      </div>

      {/* Controller & Guide Panel */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="font-bold text-white">1. Oyuncu Kontrolleri:</span>
          </div>
          <div className="text-slate-400">
            <strong className="text-slate-200">W, A, S, D</strong> (Sürüş) · <strong className="text-slate-200">SPACE veya Q</strong> (Ateş)
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-bold text-white">2. Oyuncu Kontrolleri:</span>
          </div>
          <div className="text-slate-400">
            <strong className="text-slate-200">Yön Tuşları (↑, ↓, ←, →)</strong> (Sürüş) · <strong className="text-slate-200">ENTER veya M</strong> (Ateş)
          </div>
        </div>
      </div>
    </div>
  );
};
