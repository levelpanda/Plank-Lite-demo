import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Flame, Info, Play, Settings2, Calendar } from 'lucide-react';

interface TrainingHomeProps {
  onStartTraining: () => void;
  onStartCustomTraining: () => void;
  onOpenChallenge: () => void;
}

export const TrainingHome: React.FC<TrainingHomeProps> = ({ 
  onStartTraining, 
  onStartCustomTraining,
  onOpenChallenge 
}) => {
  const { userSettings, toggleTutorial, showTutorial, trainingRecords } = useAppStore();
  const [showCustomModal, setShowCustomModal] = useState(false);

  const today = new Date().toDateString();
  const hasTrainedToday = trainingRecords.some(record => 
    new Date(record.date).toDateString() === today
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 pt-6 pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Flame className="w-7 h-7 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">连续训练</p>
              <p className="text-2xl font-bold text-gray-800">{userSettings.streak} 天</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">平板支撑</h1>
            <button
              onClick={toggleTutorial}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Info className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-gray-500">
            {hasTrainedToday ? '坚持每一天，变得更强' : '今日还未训练，快来训练吧'}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={onStartTraining}
            className="w-48 h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          >
            <div className="text-center">
              <Play className="w-16 h-16 text-white ml-2" />
              <p className="text-white font-semibold mt-2">快速开始</p>
            </div>
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowCustomModal(true)}
            className="w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">自定义训练</p>
                <p className="text-sm text-gray-500">设置时长、组数和休息</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={onOpenChallenge}
            className="w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">30天平板支撑挑战</p>
                <p className="text-sm text-gray-500">养成习惯，挑战自我</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">姿势教学</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&h=500&fit=crop" 
                    alt="平板支撑标准姿势"
                    className="w-full h-56 object-cover"
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">标准姿势</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• 前臂贴地，肘部位于肩膀正下方</li>
                    <li>• 身体呈一条直线，从头部到脚跟</li>
                    <li>• 核心收紧，不要塌腰或撅屁股</li>
                    <li>• 眼睛看地面，保持颈部自然</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">常见错误</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• ❌ 腰部下沉，核心没有收紧</li>
                    <li>• ❌ 臀部抬得过高</li>
                    <li>• ❌ 肩膀紧张或耸肩</li>
                    <li>• ❌ 呼吸不均匀</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={toggleTutorial}
                className="w-full mt-6 bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomModal && (
        <CustomTrainingModal onClose={() => setShowCustomModal(false)} onStart={onStartCustomTraining} />
      )}
    </div>
  );
};

interface CustomTrainingModalProps {
  onClose: () => void;
  onStart: () => void;
}

const CustomTrainingModal: React.FC<CustomTrainingModalProps> = ({ onClose, onStart }) => {
  const { currentConfig, updateTrainingConfig } = useAppStore();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">自定义训练</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                训练时长 (秒)
              </label>
              <input
                type="number"
                value={currentConfig.duration}
                onChange={(e) => updateTrainingConfig({ duration: parseInt(e.target.value) || 60 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                训练组数
              </label>
              <input
                type="number"
                value={currentConfig.sets}
                onChange={(e) => updateTrainingConfig({ sets: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                组间休息 (秒)
              </label>
              <input
                type="number"
                value={currentConfig.restDuration}
                onChange={(e) => updateTrainingConfig({ restDuration: parseInt(e.target.value) || 30 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="300"
              />
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onStart();
            }}
            className="w-full mt-6 bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition"
          >
            开始训练
          </button>
        </div>
      </div>
    </div>
  );
};
