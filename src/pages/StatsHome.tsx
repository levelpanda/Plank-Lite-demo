import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Flame, Settings, Timer, Activity, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

interface StatsHomeProps {
  onOpenSettings: () => void;
}

export const StatsHome: React.FC<StatsHomeProps> = ({ onOpenSettings }) => {
  const { userSettings, trainingRecords } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}分${secs}秒`;
    }
    return `${secs}秒`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatSelectedDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  const getTrainingDurationOnDate = (date: Date) => {
    const dateStr = date.toDateString();
    const record = trainingRecords.find(r => 
      new Date(r.date).toDateString() === dateStr
    );
    return record ? record.duration : 0;
  };

  const getTrainingRecordOnDate = (date: Date) => {
    const dateStr = date.toDateString();
    return trainingRecords.find(r => 
      new Date(r.date).toDateString() === dateStr
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getContributionColor = (duration: number) => {
    if (duration === 0) return 'bg-gray-100';
    if (duration < 30) return 'bg-green-200';
    if (duration < 60) return 'bg-green-300';
    if (duration < 120) return 'bg-green-500';
    return 'bg-green-700';
  };

  const generateMonthlyCalendar = (year: number, month: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    const startDayOfWeek = firstDayOfMonth.getDay();
    
    const days = [];
    
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date: day,
        isCurrentMonth: false,
        duration: getTrainingDurationOnDate(day),
        isToday: isToday(day),
        isSelected: selectedDate.toDateString() === day.toDateString(),
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({
        date: day,
        isCurrentMonth: true,
        duration: getTrainingDurationOnDate(day),
        isToday: isToday(day),
        isSelected: selectedDate.toDateString() === day.toDateString(),
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({
        date: day,
        isCurrentMonth: false,
        duration: getTrainingDurationOnDate(day),
        isToday: isToday(day),
        isSelected: selectedDate.toDateString() === day.toDateString(),
      });
    }
    
    return days;
  };

  const monthlyDays = generateMonthlyCalendar(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );
  const selectedRecord = getTrainingRecordOnDate(selectedDate);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    ));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    ));
  };

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  // 计算当月运动数据
  const getMonthlyStats = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    let totalDuration = 0;
    let totalSessions = 0;
    
    trainingRecords.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
        totalDuration += record.duration;
        totalSessions += 1;
      }
    });
    
    // 计算消耗卡路里（假设每秒消耗 0.05 卡路里）
    const totalCalories = Math.round(totalDuration * 0.05);
    
    return { totalDuration, totalSessions, totalCalories };
  };

  const monthlyStats = getMonthlyStats();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 pt-6 pb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">训练统计</h1>
          <button
            onClick={onOpenSettings}
            className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{userSettings.streak}</p>
              <p className="text-xs text-gray-500">连续打卡</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Timer className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{Math.floor(userSettings.totalDuration / 60)}</p>
              <p className="text-xs text-gray-500">总分钟</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{userSettings.totalSessions}</p>
              <p className="text-xs text-gray-500">总次数</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-lg font-bold text-gray-800">{formatTime(userSettings.bestDuration)}</p>
              <p className="text-xs text-gray-500">最佳纪录</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-semibold text-gray-800 text-lg">{formatMonthYear(currentMonth)}</h2>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-xs font-medium text-gray-500 py-2">{day}</p>
              </div>
            ))}
            
            {monthlyDays.map((day, index) => (
              <div key={index} className="flex flex-col items-center py-1">
                <button
                  onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
                  disabled={!day.isCurrentMonth}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    !day.isCurrentMonth
                      ? 'text-gray-300'
                      : day.isSelected
                      ? 'ring-2 ring-blue-500'
                      : ''
                  } ${
                    day.duration > 0 && day.isCurrentMonth
                      ? getContributionColor(day.duration)
                      : day.isCurrentMonth
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-gray-50'
                  } ${
                    day.duration > 0 && day.isCurrentMonth ? 'text-white' : ''
                  } ${
                    day.isSelected && day.isCurrentMonth ? 'scale-110' : ''
                  }`}
                  title={day.duration > 0 ? formatTime(day.duration) : ''}
                >
                  <span className="text-sm">{day.date.getDate()}</span>
                </button>
              </div>
            ))}
          </div>

          {/* 月度运动总结 - 一行文字 */}
          <div className="mt-5 pt-4 text-sm text-gray-600 border-t text-left">
            本月运动时长为 <span className="font-bold text-gray-800">{Math.floor(monthlyStats.totalDuration / 60)} 分钟</span>，
            运动次数 <span className="font-bold text-gray-800">{monthlyStats.totalSessions} 次</span>，
            预计消耗热量 <span className="font-bold text-gray-800">{monthlyStats.totalCalories} 千卡</span>。
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">
            训练记录
          </h2>
          
          {selectedRecord ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{formatDate(selectedRecord.date)}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(selectedRecord.date)}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-800">{formatTime(selectedRecord.duration)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">当日未训练</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
