import React, { useEffect, useState, useRef, useCallback } from 'react';

interface TrainingCountdownProps {
  onComplete: () => void;
}

export const TrainingCountdown: React.FC<TrainingCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(3);
  const onCompleteRef = useRef(onComplete);

  // 保持 onComplete 引用最新
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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
  const playTick = useCallback(() => {
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
  }, []);

  // 语音播报
  const speakCount = useCallback((num: number) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const text = num > 0 ? num.toString() : '开始';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // 倒计时核心逻辑 - 使用 ref 驱动，避免 speechSynthesis 阻塞 React 状态
  useEffect(() => {
    // 播报初始数字 3
    playTick();
    speakCount(3);

    timerRef.current = setInterval(() => {
      const next = countRef.current - 1;
      countRef.current = next;
      setCount(next);

      playTick();
      speakCount(next);

      if (next <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // 延迟一小段时间让 "开始" 语音播完再跳转
        setTimeout(() => {
          onCompleteRef.current();
        }, 600);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playTick, speakCount]);

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
