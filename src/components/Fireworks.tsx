import React, { useEffect, useRef } from 'react';

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  color: string;
  exploded: boolean;
  particles: FireworkParticle[];
}

interface FireworksProps {
  active: boolean;
}

export const Fireworks: React.FC<FireworksProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const fireworksRef = useRef<Firework[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const colors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ffa500', '#ff69b4', '#7fff00', '#9400d3', '#ff4500', '#00ced1'
  ];

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log('Audio not supported');
    }

    const createFirework = () => {
      const x = Math.random() * canvas.width;
      const targetY = Math.random() * (canvas.height * 0.4) + 50;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      fireworksRef.current.push({
        x,
        y: canvas.height,
        targetY,
        speed: 8 + Math.random() * 4,
        color,
        exploded: false,
        particles: []
      });
    };

    const playExplosionSound = () => {
      if (!audioContextRef.current) return;
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100 + Math.random() * 200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    };

    const explodeFirework = (firework: Firework) => {
      const particleCount = 50 + Math.floor(Math.random() * 50);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        const speed = 2 + Math.random() * 6;
        
        firework.particles.push({
          x: firework.x,
          y: firework.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: firework.color,
          size: 2 + Math.random() * 3,
          life: 1,
          maxLife: 1
        });
      }
      
      firework.exploded = true;
      playExplosionSound();
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.05) {
        createFirework();
      }

      fireworksRef.current = fireworksRef.current.filter(firework => {
        if (!firework.exploded) {
          firework.y -= firework.speed;
          
          ctx.beginPath();
          ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = firework.color;
          ctx.fill();

          if (firework.y <= firework.targetY) {
            explodeFirework(firework);
          }
          
          return true;
        } else {
          let allParticlesDead = true;
          
          firework.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.life -= 0.01;

            if (particle.life > 0) {
              allParticlesDead = false;
              
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
              ctx.fillStyle = particle.color;
              ctx.globalAlpha = particle.life;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          });

          return !allParticlesDead;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
};
