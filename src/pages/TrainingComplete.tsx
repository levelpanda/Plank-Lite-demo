import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Trophy, RotateCcw, BarChart3, ArrowLeft, PartyPopper } from 'lucide-react';

interface TrainingCompleteProps {
  duration: number;
  onRestart: () => void;
  onViewStats: () => void;
  onBack: () => void;
  onGoToSettings: () => void;
  is30DayComplete?: boolean;
  onStartNewChallenge?: () => void;
}

export const TrainingComplete: React.FC<TrainingCompleteProps> = ({ 
  duration, 
  onRestart, 
  onViewStats, 
  onBack,
  onGoToSettings,
  is30DayComplete = false,
  onStartNewChallenge
}) => {
  const { userSettings, trainingRecords } = useAppStore();
  const [showReminderPrompt, setShowReminderPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<'back' | 'stats' | null>(null);
  const [show30DayPopup, setShow30DayPopup] = useState(false);

  // 30天挑战完成时自动弹出弹窗
  useEffect(() => {
    if (is30DayComplete) {
      setShow30DayPopup(true);
    }
  }, [is30DayComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}分${secs}秒`;
    }
    return `${secs}秒`;
  };

  const isNewBest = duration >= userSettings.bestDuration;
  const isFirstTraining = trainingRecords.length === 0;

  const handleBack = () => {
    if (isFirstTraining && !userSettings.reminderEnabled) {
      setPendingAction('back');
      setShowReminderPrompt(true);
    } else {
      onBack();
    }
  };

  const handleViewStats = () => {
    if (isFirstTraining && !userSettings.reminderEnabled) {
      setPendingAction('stats');
      setShowReminderPrompt(true);
    } else {
      onViewStats();
    }
  };

  const handleEnableReminder = () => {
    setShowReminderPrompt(false);
    onGoToSettings();
  };

  const handleSkip = () => {
    setShowReminderPrompt(false);
    if (pendingAction === 'back') {
      onBack();
    } else if (pendingAction === 'stats') {
      onViewStats();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-4 pb-24">
      {/* 顶部导航栏 */}
      <div className="flex items-center pt-6 pb-4">
        <button
          onClick={handleBack}
          className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">太棒了！</h1>
          <p className="text-gray-500">你完成了训练</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm w-full max-w-sm mb-8">
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm mb-1">本次训练时长</p>
            <p className="text-4xl font-bold text-blue-600">{formatTime(duration)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-sm">连续打卡</p>
              <p className="text-2xl font-bold text-gray-800">{userSettings.streak}天</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-sm">最佳成绩</p>
              <p className="text-2xl font-bold text-gray-800">{formatTime(userSettings.bestDuration)}</p>
            </div>
          </div>

          {isNewBest && (
            <div className="mt-4 bg-green-50 rounded-xl p-4 text-center">
              <p className="text-green-600 font-semibold">🎉 新纪录！</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={onRestart}
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            再来一组
          </button>
          <button
            onClick={handleViewStats}
            className="w-full bg-white text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 border border-gray-200"
          >
            <BarChart3 className="w-5 h-5" />
            查看记录
          </button>
        </div>
      </div>

      {/* 30天挑战完成弹窗 */}
      {show30DayPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-bounce-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                <PartyPopper className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 恭喜你！</h2>
              <p className="text-gray-600 mb-1">你已完成 30 天平板支撑挑战！</p>
              <p className="text-gray-400 text-sm">坚持了整整 30 天，你真的很了不起！</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShow30DayPopup(false);
                  onStartNewChallenge?.();
                }}
                className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                开始新的挑战
              </button>
              <button
                onClick={() => {
                  setShow30DayPopup(false);
                  onBack();
                }}
                className="w-full bg-white text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-100 transition border border-gray-200"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 推送提醒弹窗 */}
      {showReminderPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">开启每日提醒</h2>
              <p className="text-gray-500">不错的开始！开启每日提醒，让坚持更简单</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleEnableReminder}
                className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition"
              >
                开启提醒
              </button>
              <button
                onClick={handleSkip}
                className="w-full bg-white text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-100 transition border border-gray-200"
              >
                暂不开启
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
