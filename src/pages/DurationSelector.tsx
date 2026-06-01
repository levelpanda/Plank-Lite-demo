import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Trophy, Infinity } from 'lucide-react';
import { useAppStore } from '../store';

export function DurationSelector({ onBack, onStart }: {
  onBack: () => void;
  onStart: (duration: number) => void;
}) {
  const { userSettings } = useAppStore();
  const personalBest = userSettings.bestDuration;
  const [selectedMinutes, setSelectedMinutes] = useState(1);
  const [selectedSeconds, setSelectedSeconds] = useState(0);

  const minuteScrollerRef = useRef<HTMLDivElement>(null);
  const secondScrollerRef = useRef<HTMLDivElement>(null);

  // 生成分钟选项
  const minuteOptions = Array.from({ length: 11 }, (_, i) => i);
  // 生成秒选项
  const secondOptions = Array.from({ length: 60 }, (_, i) => i);

  // 滚动到选中位置
  const scrollToMinute = (minute: number) => {
    if (minuteScrollerRef.current) {
      const itemHeight = 60;
      minuteScrollerRef.current.scrollTop = minute * itemHeight;
    }
  };

  const scrollToSecond = (second: number) => {
    if (secondScrollerRef.current) {
      const itemHeight = 60;
      secondScrollerRef.current.scrollTop = second * itemHeight;
    }
  };

  // 处理分钟滚动
  const handleMinuteScroll = () => {
    if (!minuteScrollerRef.current) return;
    const itemHeight = 60;
    const newMinute = Math.round(minuteScrollerRef.current.scrollTop / itemHeight);
    const clampedMinute = Math.max(0, Math.min(10, newMinute));
    if (clampedMinute !== selectedMinutes) {
      setSelectedMinutes(clampedMinute);
    }
  };

  // 处理秒滚动
  const handleSecondScroll = () => {
    if (!secondScrollerRef.current) return;
    const itemHeight = 60;
    const newSecond = Math.round(secondScrollerRef.current.scrollTop / itemHeight);
    const clampedSecond = Math.max(0, Math.min(59, newSecond));
    if (clampedSecond !== selectedSeconds) {
      setSelectedSeconds(clampedSecond);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollToMinute(1);
      scrollToSecond(0);
    }, 100);
  }, []);

  // 计算总时长
  const totalDuration = selectedMinutes * 60 + selectedSeconds;
  const isNoTime = selectedMinutes === 0 && selectedSeconds === 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 顶部返回按钮 */}
      <div className="p-4">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* 显示的时间 */}
        <div className="mb-8">
          {isNoTime ? (
            <div className="flex items-center gap-3">
              <span className="text-6xl font-bold text-indigo-500">不计时</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-6xl font-bold text-indigo-500">{selectedMinutes}</span>
              <span className="text-4xl font-semibold text-gray-500">:</span>
              <span className="text-6xl font-bold text-indigo-500">{selectedSeconds.toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* 滑动选择器区域 */}
          <div className="w-full max-w-md mb-8">
            <div className="flex gap-4 justify-center">
              {/* 分钟选择器 */}
              <div className="relative">
                <div className="text-center text-sm text-gray-400 mb-2 font-medium">分</div>
                <div 
                  className="relative h-48 w-32 overflow-hidden"
                >
                  {/* 中心高亮区域 */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-14 z-10 pointer-events-none border-y-2 border-indigo-500 bg-indigo-50/50 rounded-lg">
                  </div>
                  
                  <div 
                    ref={minuteScrollerRef}
                    className="h-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
                    onScroll={handleMinuteScroll}
                  >
                    <div className="h-[66px]"></div>
                    {minuteOptions.map((min) => (
                      <div
                        key={min}
                        className="h-[60px] flex items-center justify-center snap-center"
                      >
                        <span className={`text-4xl font-bold transition-colors ${
                          selectedMinutes === min ? 'text-indigo-500' : 'text-gray-300'
                        }`}>
                          {min}
                        </span>
                      </div>
                    ))}
                    <div className="h-[66px]"></div>
                  </div>
                </div>
              </div>

              {/* 冒号 */}
              <div className="flex flex-col justify-end pb-8">
                <div className="text-4xl font-bold text-gray-300">:</div>
              </div>

              {/* 秒选择器 */}
              <div className="relative">
                <div className="text-center text-sm text-gray-400 mb-2 font-medium">秒</div>
                <div className="relative h-48 w-32 overflow-hidden">
                  {/* 中心高亮区域 */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-14 z-10 pointer-events-none border-y-2 border-indigo-500 bg-indigo-50/50 rounded-lg">
                  </div>
                  
                  <div 
                    ref={secondScrollerRef}
                    className="h-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
                    onScroll={handleSecondScroll}
                  >
                    <div className="h-[66px]"></div>
                    {secondOptions.map((sec) => (
                      <div
                        key={sec}
                        className="h-[60px] flex items-center justify-center snap-center"
                      >
                        <span className={`text-4xl font-bold transition-colors ${
                          selectedSeconds === sec ? 'text-indigo-500' : 'text-gray-300'
                        }`}>
                          {sec.toString().padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                    <div className="h-[66px]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* 最佳记录 */}
        <div className="flex items-center gap-2 mb-12">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <span className="text-xl font-semibold text-gray-400">
            最佳纪录 {personalBest ? formatTime(personalBest) : '00:00'}
          </span>
        </div>

        {/* 开始按钮 */}
        <button
          onClick={() => onStart(totalDuration)}
          className="w-full max-w-md bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-2xl font-bold py-5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          开始挑战
        </button>
      </div>
    </div>
  );
}
