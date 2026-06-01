import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, getChallengeConfig } from '../store';
import { Pause, Play, Square, Volume2, VolumeX, X } from 'lucide-react';

interface ChallengeTrainingProps {
  onComplete: (duration?: number, is30Day?: boolean) => void;
  onExit: () => void;
  isCustomMode?: boolean;
  showExitButton?: boolean;
  currentDay?: number;
  isResumeMode?: boolean;
  initialState?: {
    currentSet: number;
    remainingTime: number;
    totalDuration: number;
    isResting: boolean;
  };
}

export const ChallengeTraining: React.FC<ChallengeTrainingProps> = ({ 
  onComplete, 
  onExit,
  isCustomMode = false,
  showExitButton = true,
  currentDay,
  isResumeMode = false,
  initialState
}) => {
  const { userSettings, addTrainingRecord, updateUserSettings, currentConfig, savePausedChallenge, clearPausedChallenge } = useAppStore();
  
  // 获取配置
  const day = currentDay || userSettings.challengeDay;
  const config = isCustomMode ? currentConfig : getChallengeConfig(day);

  // 如果是恢复模式，使用初始状态，否则用默认值
  const [currentSet, setCurrentSet] = useState(() => 
    isResumeMode && initialState ? initialState.currentSet : 1
  );
  const [remainingTime, setRemainingTime] = useState(() => 
    isResumeMode && initialState ? initialState.remainingTime : config.duration
  );
  const [isResting, setIsResting] = useState(() => 
    isResumeMode && initialState ? initialState.isResting : false
  );
  // 恢复模式下，把剩余时间作为总时长
  const [totalTimeState, setTotalTimeState] = useState(() => 
    isResumeMode && initialState && !initialState.isResting ? initialState.remainingTime : 
    (isResumeMode && initialState && initialState.isResting ? config.restDuration : config.duration)
  );
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpokenTimeRef = useRef(-1);
  const totalDurationRef = useRef<number>(0);
  const hasSpokenRestRef = useRef(false);
  const hasSpokenStartRef = useRef(false);
  const firstUpdateRef = useRef(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 初始化 AudioContext
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);
  
  // 组件挂载时初始化
  useEffect(() => {
    if (isResumeMode && initialState) {
      totalDurationRef.current = initialState.totalDuration;
    } else {
      totalDurationRef.current = 0;
    }
    lastSpokenTimeRef.current = -1;
    hasSpokenRestRef.current = false;
    hasSpokenStartRef.current = false;
  }, [isResumeMode, initialState]);

  let totalTime = totalTimeState;
  
  // 如果不是恢复模式，使用配置的完整时长
  if (!isResumeMode) {
    totalTime = isResting ? config.restDuration : config.duration;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const speak = (text: string) => {
    if (!soundEnabled || !userSettings.voiceEnabled) return;
    if ('speechSynthesis' in window) {
      // 取消之前的语音
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const playBeep = () => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      // 如果 AudioContext 被挂起，恢复它
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch {
      // ignore
    }
  };

  const getBackgroundColor = () => {
    if (isResting) return 'bg-gray-100';
    const elapsed = totalTime - remainingTime;
    if (elapsed < 20) return 'bg-blue-50';
    if (elapsed < 60) return 'bg-green-50';
    if (elapsed < 90) return 'bg-purple-50';
    return 'bg-pink-50';
  };

  const getProgressColor = () => {
    if (isResting) return 'text-gray-400 stroke-gray-400';
    const elapsed = totalTime - remainingTime;
    if (elapsed < 20) return 'text-blue-500 stroke-blue-500';
    if (elapsed < 60) return 'text-green-500 stroke-green-500';
    if (elapsed < 90) return 'text-purple-500 stroke-purple-500';
    return 'text-pink-500 stroke-pink-500';
  };

  const getMotivationText = () => {
    if (isResting) return '休息一下，准备下一组';
    const elapsed = totalTime - remainingTime;
    if (elapsed === 0) return '保持姿势，呼吸均匀';
    if (elapsed === 20) return '太棒了！已经20秒！';
    if (elapsed === 60) return '太厉害了！1分钟了！';
    if (elapsed === 90) return '坚持就是胜利！';
    if (elapsed === 120) return '2分钟！你真的很棒！';
    if (elapsed > 0 && elapsed % 30 === 0) {
      const texts = ['继续保持！', '你做得很好！', '再坚持一下！', '加油！', '你可以的！'];
      return texts[Math.floor(Math.random() * texts.length)];
    }
    return '保持姿势，呼吸均匀';
  };

  useEffect(() => {
    // 跳过第一次更新（初始挂载时），因为我们已经在 useState 中设置了初始值
    if (firstUpdateRef.current) {
      firstUpdateRef.current = false;
      return;
    }
    
    // 之后的正常更新
    if (isResting) {
      setRemainingTime(config.restDuration);
      setTotalTimeState(config.restDuration);
      hasSpokenStartRef.current = false;
    } else {
      setRemainingTime(config.duration);
      setTotalTimeState(config.duration);
      hasSpokenRestRef.current = false;
    }
  }, [isResting, currentSet, config.restDuration, config.duration]);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        // 每秒播放滴答声
        playBeep();

        setRemainingTime((prev) => {
          const next = prev - 1;

          if (!isResting) {
            totalDurationRef.current += 1;
          }

          if (next === 0) {
            if (!isResting) {
              if (currentSet < config.sets) {
                // 只播放一次休息语音
                if (!hasSpokenRestRef.current) {
                  hasSpokenRestRef.current = true;
                  speak('休息一下');
                }
                setIsResting(true);
                return config.restDuration;
              } else {
                completeChallenge();
                return 0;
              }
            } else {
              // 只播放一次开始训练语音
              if (!hasSpokenStartRef.current) {
                hasSpokenStartRef.current = true;
                speak('开始训练');
              }
              setIsResting(false);
              setCurrentSet((prev) => prev + 1);
              return config.duration;
            }
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isResting, currentSet]);

  useEffect(() => {
    if (isPaused || !soundEnabled || !userSettings.voiceEnabled) return;
    if (isResting) return;
    
    const elapsed = totalTime - remainingTime;
    if (elapsed !== lastSpokenTimeRef.current) {
      if (elapsed === 20) speak('太棒了！已经20秒！');
      if (elapsed === 60) speak('太厉害了！1分钟了！');
      if (elapsed === 90) speak('坚持就是胜利！');
      if (elapsed === 120) speak('2分钟！你真的很棒！');
      lastSpokenTimeRef.current = elapsed;
    }
  }, [remainingTime, isPaused, isResting, soundEnabled, userSettings.voiceEnabled, totalTime]);

  const completeChallenge = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    // 使用 getState 获取最新状态，避免闭包陈旧值
    const currentDay = useAppStore.getState().userSettings.challengeDay;
    const isDay30 = currentDay >= 30;

    if (totalDurationRef.current > 0) {
      if (isCustomMode) {
        // 自定义模式：不在这里添加记录，让App.tsx处理
      } else {
        // 挑战模式：在这里添加记录
        const record = {
          id: Date.now().toString(),
          duration: totalDurationRef.current,
          date: new Date().toISOString(),
          completed: true
        };
        addTrainingRecord(record);

        // 一次原子更新：同时标记今天已完成，并推进到下一天（如果未到30天）
        if (currentDay < 30) {
          updateUserSettings({
            challengeDay: currentDay + 1,
            challengeCompletedToday: false,
          });
        } else {
          // 第30天：只标记今天已完成，不再推进
          updateUserSettings({
            challengeCompletedToday: true,
          });
        }
        
        // 完成挑战后清除暂停状态
        clearPausedChallenge(day);
      }
    }

    // 传递总时长和第30天标记
    onComplete(totalDurationRef.current, isDay30);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStopClick = () => {
    setShowStopConfirm(true);
    if (!isPaused) {
      setIsPaused(true);
    }
  };

  const confirmStopAndSave = () => {
    setShowStopConfirm(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // 保存当前状态
    if (!isCustomMode) {
      savePausedChallenge({
        day,
        currentSet,
        remainingTime,
        totalDuration: totalDurationRef.current,
        isResting,
      });
    }
    
    onExit();
  };

  const cancelStop = () => {
    setShowStopConfirm(false);
    if (!isPaused) {
      setIsPaused(false);
    }
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onExit();
  };

  const progress = totalTime > 0 ? Math.min(((totalTime - remainingTime) / totalTime) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 120;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getBackgroundColor()}`}>
      <div className="px-4 pt-6 pb-4">
        <div className="flex justify-between items-center">
          {/* 只有非自定义模式才显示退出按钮，自定义模式不显示左上角终止键 */}
          {showExitButton && !isCustomMode ? (
            <button
              onClick={handleExit}
              className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition"
            >
              <Square className="w-6 h-6 text-gray-600" />
            </button>
          ) : (
            <div className="w-12 h-12"></div>
          )}

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">
              第 {currentSet} 组 / 共 {config.sets} 组
            </p>
            {isResting && (
              <p className="text-gray-500 text-sm">休息中</p>
            )}
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-gray-600" />
            ) : (
              <VolumeX className="w-6 h-6 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 flex flex-col items-center justify-center py-8">
        {isResting ? (
          // 休息时直接显示倒计时
          <div className="py-16 text-center">
            <p className="text-7xl font-bold text-gray-800">
              {formatTime(remainingTime)}
            </p>
            <p className="text-gray-500 text-lg mt-2">休息中</p>
          </div>
        ) : (
          // 训练时显示圆环
          <div className="relative w-80 h-80 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 264 264">
              <circle
                cx="132"
                cy="132"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-gray-200"
              />
              <circle
                cx="132"
                cy="132"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={`transition-all duration-300 ${getProgressColor()}`}
              />
            </svg>

            <div className="absolute text-center">
              <p className="text-7xl font-bold text-gray-800">
                {formatTime(remainingTime)}
              </p>
              <p className="text-gray-500 text-lg mt-2">
                预计消耗 {Math.round((totalDurationRef.current * 0.05) * 10) / 10} 卡路里
              </p>
            </div>
          </div>
        )}

        <p className="text-xl font-medium text-gray-700 text-center py-8">
          {getMotivationText()}
        </p>

        <div className="flex items-center gap-6">
          {isPaused ? (
            <>
              {/* 暂停后显示终止按钮（所有模式都显示） */}
              <button
                onClick={handleStopClick}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition"
              >
                <Square className="w-10 h-10 text-white" />
              </button>
              {/* 继续按钮 */}
              <button
                onClick={handleResume}
                className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition"
              >
                <Play className="w-10 h-10 text-white ml-1" />
              </button>
            </>
          ) : (
            <>
              {/* 暂停按钮 */}
              <button
                onClick={handlePause}
                className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition"
              >
                <Pause className="w-10 h-10 text-white" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 终止确认弹窗 */}
      {showStopConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <button
              onClick={cancelStop}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">再坚持一会儿？</h3>
              <p className="text-gray-500">
                你已经坚持了 {formatTime(totalDurationRef.current)}！
                再坚持一下，挑战自己！
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmStopAndSave}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                终止并保存
              </button>
              <button
                onClick={cancelStop}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
              >
                继续坚持
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">确定要退出吗？</h2>
              <p className="text-gray-500">今日挑战进度将不会保存</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                继续训练
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
