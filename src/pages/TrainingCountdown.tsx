import React, { useEffect, useState, useRef } from 'react';

interface TrainingCountdownProps {
  onComplete: () => void;
}

export const TrainingCountdown: React.FC<TrainingCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hasInitializedRef = useRef(false);
  const countRef = useRef(3);

  // 同步 count 到 ref
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  // 初始化 AudioContext
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // 播放滴答声
  const playTick = () => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // ignore
    }
  };

  // 语音播报
  const speakCount = (num: number) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const text = num > 0 ? num.toString() : '开始';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // 初始化时播报 3，然后启动定时器
      playTick();
      speakCount(3);
      // 不 return，让定时器正常启动
    }

    // 用 setInterval 替代 useEffect 依赖 count，避免 speechSynthesis 阻塞
    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev - 1;
        playTick();
        speakCount(next);
        
        if (next <= 0) {
          clearInterval(timer);
          onComplete();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <div 
          key={count}
          className="animate-pulse"
        >
          <p className="text-9xl font-bold text-white mb-4">
            {count > 0 ? count : 'GO!'}
          </p>
          {count > 0 && (
            <p className="text-2xl text-white/90">准备开始...</p>
          )}
        </div>
      </div>
    </div>
  );
};
