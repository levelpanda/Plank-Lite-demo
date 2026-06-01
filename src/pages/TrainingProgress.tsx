import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { Pause, Play, Volume2, VolumeX, Square, X } from 'lucide-react';

interface TrainingProgressProps {
  onComplete: (duration: number) => void;
  onCancel: () => void;
}

export const TrainingProgress: React.FC<TrainingProgressProps> = ({ onComplete, onCancel }) => {
  const { remainingTime, isPaused, pauseTraining, resumeTraining, currentConfig, userSettings } = useAppStore();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgColor, setBgColor] = useState('bg-gray-50');
  const [ringColor, setRingColor] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('text-gray-800');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastSpokenSecondRef = useRef<number>(-1);

  // 初始化音频上下文
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 播放滴答声
  const playTickSound = () => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  // 播放语音激励
  const speakMotivation = (text: string) => {
    if (!userSettings.voiceEnabled || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      // 播放滴答声
      playTickSound();
      
      setTimeElapsed((prev) => {
        const newTime = prev + 1;
        
        // 背景色变化和语音
        if (newTime === 20 && lastSpokenSecondRef.current !== 20) {
          lastSpokenSecondRef.current = 20;
          const text = '太棒了！已经20秒！';
          setBgColor('bg-green-50');
          setRingColor('#22c55e');
          setTextColor('text-green-800');
          speakMotivation(text);
        } else if (newTime === 60 && lastSpokenSecondRef.current !== 60) {
          lastSpokenSecondRef.current = 60;
          const text = '太厉害了！1分钟了！';
          setBgColor('bg-blue-50');
          setRingColor('#3b82f6');
          setTextColor('text-blue-800');
          speakMotivation(text);
        } else if (newTime === 90 && lastSpokenSecondRef.current !== 90) {
          lastSpokenSecondRef.current = 90;
          const text = '坚持就是胜利！';
          setBgColor('bg-purple-50');
          setRingColor('#8b5cf6');
          setTextColor('text-purple-800');
          speakMotivation(text);
        } else if (newTime === 120 && lastSpokenSecondRef.current !== 120) {
          lastSpokenSecondRef.current = 120;
          const text = '2分钟！你真的很棒！';
          setBgColor('bg-pink-50');
          setRingColor('#ec4899');
          setTextColor('text-pink-800');
          speakMotivation(text);
        } else if (newTime % 30 === 0 && newTime > 0 && lastSpokenSecondRef.current !== newTime) {
          lastSpokenSecondRef.current = newTime;
          const motivations = [
            '继续保持！',
            '你做得很好！',
            '再坚持一下！',
            '加油！',
            '你可以的！'
          ];
          const text = motivations[Math.floor(Math.random() * motivations.length)];
          speakMotivation(text);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, soundEnabled, userSettings.voiceEnabled]);

  // 进度环持续前进
  const progress = Math.min((timeElapsed / 60) * 100, 100);
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算卡路里消耗（假设每小时消耗约200卡路里）
  const calculateCalories = (seconds: number) => {
    const caloriesPerSecond = 200 / 3600;
    return (seconds * caloriesPerSecond).toFixed(1);
  };

  const handleEndClick = () => {
    setShowEndConfirm(true);
    if (!isPaused) {
      pauseTraining();
    }
  };

  const confirmEnd = () => {
    setShowEndConfirm(false);
    onComplete(timeElapsed);
  };

  const cancelEnd = () => {
    setShowEndConfirm(false);
    if (!isPaused) {
      resumeTraining();
    } else {
      resumeTraining();
    }
  };

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center px-4 pb-24 transition-colors duration-500`}>
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-6 right-4 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition"
      >
        {soundEnabled ? (
          <Volume2 className="w-6 h-6 text-gray-600" />
        ) : (
          <VolumeX className="w-6 h-6 text-gray-400" />
        )}
      </button>

      <div className="relative mb-12">
        <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={ringColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className={`text-6xl font-bold ${textColor}`}>
              {formatTime(timeElapsed)}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <p className="text-gray-500 mb-4">
          {isPaused ? '已暂停' : '保持姿势，呼吸均匀'}
        </p>
        <p className="text-sm text-gray-400">
          已消耗 {calculateCalories(timeElapsed)} 卡路里
        </p>
      </div>

      <div className="flex items-center gap-6">
        {isPaused ? (
          <>
            <button
              onClick={handleEndClick}
              className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition"
            >
              <Square className="w-10 h-10 text-white" />
            </button>
            <button
              onClick={resumeTraining}
              className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition"
            >
              <Play className="w-10 h-10 text-white ml-1" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEndClick}
              className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition"
            >
              <Square className="w-10 h-10 text-white" />
            </button>
            <button
              onClick={pauseTraining}
              className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition"
            >
              <Pause className="w-10 h-10 text-white" />
            </button>
          </>
        )}
      </div>

      {/* 结束确认弹窗 */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <button
              onClick={cancelEnd}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">再坚持一会儿？</h3>
              <p className="text-gray-500">
                你已经坚持了 {formatTime(timeElapsed)}！
                再坚持一下，挑战自己！
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmEnd}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                结束训练
              </button>
              <button
                onClick={cancelEnd}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
              >
                继续坚持
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
