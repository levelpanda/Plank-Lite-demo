import React, { useEffect, useState, useRef } from 'react';

interface TrainingCountdownProps {
  onComplete: () => void;
}

export const TrainingCountdown: React.FC<TrainingCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hasInitializedRef = useRef(false);

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
      // 小延迟确保 speechSynthesis 能正常触发
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
      }, 50);
    }
  };

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // 初始化时播报 3
      playTick();
      speakCount(count);
      return;
    }

    if (count <= 0) {
      // 播放 GO 音效和语音
      playTick();
      speakCount(0);
      onComplete();
      return;
    }

    // 每次倒计时变化时播放滴答声和语音
    playTick();
    speakCount(count);

    const timer = setTimeout(() => {
      setCount(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

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
