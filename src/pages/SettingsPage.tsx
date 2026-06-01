import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ArrowLeft, Bell, Clock, Trash2, Mic } from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { userSettings, updateUserSettings, resetData } = useAppStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">设置</h1>
        </div>
      </div>

      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">每日打卡提醒</h2>
                  <p className="text-sm text-gray-500">养成规律训练的好习惯</p>
                </div>
              </div>
              <button
                onClick={() => updateUserSettings({ reminderEnabled: !userSettings.reminderEnabled })}
                className={`w-14 h-8 rounded-full transition-colors ${
                  userSettings.reminderEnabled ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    userSettings.reminderEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {userSettings.reminderEnabled && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  提醒时间
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-500" />
                  </div>
                  <input
                    type="time"
                    value={userSettings.reminderTime}
                    onChange={(e) => updateUserSettings({ reminderTime: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mic className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">语音助手</h2>
                  <p className="text-sm text-gray-500">训练时播放激励语音</p>
                </div>
              </div>
              <button
                onClick={() => updateUserSettings({ voiceEnabled: !userSettings.voiceEnabled })}
                className={`w-14 h-8 rounded-full transition-colors ${
                  userSettings.voiceEnabled ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    userSettings.voiceEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full bg-white rounded-2xl p-6 shadow-sm hover:bg-gray-50 transition flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">删除数据</p>
            <p className="text-sm text-gray-500">重置所有训练记录和设置</p>
          </div>
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Plank Lite demo
          </p>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">删除所有数据？</h2>
                <p className="text-gray-500">这将重置应用并删除所有训练记录和设置。此操作不可撤销。</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    resetData();
                    setShowDeleteConfirm(false);
                    onBack();
                  }}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
