import React from 'react';
import { useAppStore, getChallengeConfig } from '../store';
import { ArrowLeft, Coffee, Lock } from 'lucide-react';

interface ChallengeHomeProps {
  onBack: () => void;
  onStartChallenge: (day: number) => void;
  onResumeChallenge: (day: number, state: any) => void;
}

export const ChallengeHome: React.FC<ChallengeHomeProps> = ({ onBack, onStartChallenge, onResumeChallenge }) => {
  const { userSettings, pausedChallengeStates } = useAppStore();
  
  const totalDays = 30;
  const completedDays = userSettings.challengeDay - 1 + (userSettings.challengeCompletedToday ? 1 : 0);

  // 调试日志
  console.log('ChallengeHome render:', { 
    challengeDay: userSettings.challengeDay, 
    challengeCompletedToday: userSettings.challengeCompletedToday,
    completedDays 
  });

  const isRestDay = (day: number) => {
    return day === 7 || day === 21 || day === 28;
  };

  const getDayStatus = (day: number) => {
    const isCurrentDay = day === userSettings.challengeDay;
    const isCompleted = day < userSettings.challengeDay || 
      (day === userSettings.challengeDay && userSettings.challengeCompletedToday);
    
    return { isCurrentDay, isCompleted };
  };

  // 计算某一天的完成百分比
  const getDayProgress = (day: number) => {
    const pausedState = pausedChallengeStates[day];
    if (pausedState) {
      // 如果有暂停状态，用暂停时的数据计算
      const config = getChallengeConfig(day);
      const totalSets = config.sets;
      const perSetPercent = 100 / totalSets;
      const currentSetProgress = pausedState.currentSet - 1;
      // 计算当前组的进度
      let currentSetConfig = 0;
      if (pausedState.isResting) {
        // 休息时当前组已经完成
        currentSetConfig = config.duration;
      } else {
        currentSetConfig = config.duration - pausedState.remainingTime;
      }
      const currentSetPercent = (currentSetConfig / config.duration) * perSetPercent;
      const totalPercent = currentSetProgress * perSetPercent + currentSetPercent;
      return Math.round(totalPercent);
    }
    // 无暂停状态，返回 0
    return 0;
  };

  const handleDayClick = (day: number) => {
    const isRest = isRestDay(day);
    const isCompleted = getDayStatus(day).isCompleted;
    
    console.log('handleDayClick:', { day, challengeDay: userSettings.challengeDay, isRest, isCompleted });
    
    // 只能开始当前天的挑战，不能跳过未完成的天直接开始后面的天
    if (day !== userSettings.challengeDay || isRest || isCompleted) {
      console.log('handleDayClick blocked:', { 
        notCurrentDay: day !== userSettings.challengeDay, 
        isRest, 
        isCompleted 
      });
      return;
    }
    
    // 检查是否有暂停状态
    const pausedState = pausedChallengeStates[day];
    if (pausedState) {
      onResumeChallenge(day, pausedState);
    } else {
      onStartChallenge(day);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition mr-4"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">30天挑战</h1>
        </div>
      </div>

      <div className="px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-gray-800 font-semibold">已完成 {Math.max(0, Math.min(totalDays, completedDays))} / {totalDays} 天</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: totalDays }, (_, i) => {
              const day = i + 1;
              const { isCurrentDay, isCompleted } = getDayStatus(day);
              const isRest = isRestDay(day);
              // 只能点击当前天，已完成或未来的天都不可点击
              const isClickable = !isRest && !isCompleted && day === userSettings.challengeDay;
              const isLocked = day > userSettings.challengeDay && !isRest;
              const progress = getDayProgress(day);
              const hasPausedState = !!pausedChallengeStates[day];

              return (
                <button
                  key={day}
                  onClick={() => isClickable && handleDayClick(day)}
                  disabled={!isClickable}
                  className={`w-full py-4 px-4 rounded-xl flex items-center justify-between transition-all ${
                    isCurrentDay && !userSettings.challengeCompletedToday && !isRest
                      ? 'bg-blue-50 border border-blue-200'
                      : isLocked
                      ? 'bg-gray-100 opacity-50'
                      : 'bg-gray-50'
                  } ${isClickable ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-semibold ${
                      isCurrentDay && !userSettings.challengeCompletedToday && !isRest
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}>
                      第 {day} 天
                    </span>
                    {isRest && <span className="text-xs text-gray-500">（休息日）</span>}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isRest ? (
                      <Coffee className="w-5 h-5 text-gray-400" />
                    ) : isCompleted ? (
                      <span className="text-green-500 text-lg">✓</span>
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : hasPausedState ? (
                      <span className="text-xs text-gray-500">{progress}%</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
