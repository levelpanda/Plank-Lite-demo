import { useEffect, useState } from "react";
import { useAppStore } from "./store";
import { TrainingHome } from "./pages/TrainingHome";
import { DurationSelector } from "./pages/DurationSelector";
import { TrainingCountdown } from "./pages/TrainingCountdown";
import { TrainingProgress } from "./pages/TrainingProgress";
import { TrainingComplete } from "./pages/TrainingComplete";
import { StatsHome } from "./pages/StatsHome";
import { SettingsPage } from "./pages/SettingsPage";
import { ChallengeHome } from "./pages/ChallengeHome";
import { ChallengeTraining } from "./pages/ChallengeTraining";
import { Dumbbell, BarChart3 } from "lucide-react";

type Page = 'training-home' | 'duration-selector' | 'countdown' | 'training-progress' | 'training-complete' | 'stats-home' | 'settings' | 'challenge-home' | 'challenge-training' | 'challenge-complete' | 'custom-training' | 'custom-complete';

export default function App() {
  const { loadData, startTraining, endTraining, addTrainingRecord, setActiveTab, activeTab, userSettings, setChallengeDay } = useAppStore();
  const [currentPage, setCurrentPage] = useState<Page>('training-home');
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [completedDuration, setCompletedDuration] = useState(0);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [isCustomTrainingMode, setIsCustomTrainingMode] = useState(false);
  const [selectedChallengeDay, setSelectedChallengeDay] = useState(0);
  const [isResumeMode, setIsResumeMode] = useState(false);
  const [resumeState, setResumeState] = useState<any>(null);
  const [is30DayChallengeComplete, setIs30DayChallengeComplete] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartQuickTraining = () => {
    setCurrentPage('duration-selector');
  };

  const handleStartCustomTraining = () => {
    setIsCustomTrainingMode(true);
    setIsChallengeMode(false);
    startTraining();
    setCurrentPage('countdown');
  };

  const handleOpenChallenge = () => {
    setCurrentPage('challenge-home');
  };

  const handleStartChallenge = (day: number) => {
    setSelectedChallengeDay(day);
    setChallengeDay(day);
    setIsChallengeMode(true);
    setIsResumeMode(false);
    setResumeState(null);
    startTraining();
    setCurrentPage('countdown');
  };

  const handleResumeChallenge = (day: number, state: any) => {
    setSelectedChallengeDay(day);
    setChallengeDay(day);
    setIsChallengeMode(true);
    setIsResumeMode(true);
    setResumeState(state);
    // 恢复模式不需要倒计时，直接开始训练
    setCurrentPage('challenge-training');
  };

  const handleDurationSelect = (duration: number) => {
    setIsChallengeMode(false);
    setSelectedDuration(duration);
    startTraining();
    setCurrentPage('countdown');
  };

  const handleCountdownComplete = () => {
    if (isChallengeMode) {
      setCurrentPage('challenge-training');
    } else if (isCustomTrainingMode) {
      setCurrentPage('custom-training');
    } else {
      setCurrentPage('training-progress');
    }
  };

  const handleCompleteTraining = (duration: number) => {
    endTraining(duration);
    setCompletedDuration(duration);
    addTrainingRecord({
      id: Date.now().toString(),
      duration,
      date: new Date().toISOString(),
      completed: true,
    });
    setCurrentPage('training-complete');
  };

  const handleChallengeComplete = (duration: number = 0, is30Day: boolean = false) => {
    setCompletedDuration(duration);
    setIs30DayChallengeComplete(is30Day);
    setCurrentPage('challenge-complete');
  };

  const handleCustomTrainingComplete = (duration: number) => {
    endTraining(duration);
    setCompletedDuration(duration);
    addTrainingRecord({
      id: Date.now().toString(),
      duration,
      date: new Date().toISOString(),
      completed: true,
    });
    setCurrentPage('custom-complete');
  };

  const handleCancelTraining = () => {
    setCurrentPage('training-home');
  };

  const handleRestartTraining = () => {
    startTraining();
    setCurrentPage('training-progress');
  };

  const handleViewStats = () => {
    setActiveTab('stats');
    setCurrentPage('stats-home');
  };

  const handleBackToHome = () => {
    if (activeTab === 'training') {
      setCurrentPage('training-home');
    } else {
      setCurrentPage('stats-home');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'training-home':
        return <TrainingHome 
          onStartTraining={handleStartQuickTraining} 
          onStartCustomTraining={handleStartCustomTraining}
          onOpenChallenge={handleOpenChallenge}
        />;
      case 'challenge-home':
        return <ChallengeHome 
          onBack={() => setCurrentPage('training-home')}
          onStartChallenge={handleStartChallenge}
          onResumeChallenge={handleResumeChallenge}
        />;
      case 'challenge-training':
        return <ChallengeTraining 
          onComplete={handleChallengeComplete}
          onExit={() => setCurrentPage('challenge-home')}
          isCustomMode={false}
          showExitButton={false}
          currentDay={selectedChallengeDay}
          isResumeMode={isResumeMode}
          initialState={resumeState}
        />;
      case 'challenge-complete':
        return (
          <TrainingComplete 
            duration={completedDuration} 
            onRestart={() => handleStartChallenge(userSettings.challengeDay)}
            onViewStats={handleViewStats}
            onBack={() => setCurrentPage('challenge-home')}
            onGoToSettings={() => setCurrentPage('settings')}
            is30DayComplete={is30DayChallengeComplete}
            onStartNewChallenge={() => {
              // 重置挑战，从第1天开始
              const { setChallengeDay } = useAppStore.getState();
              setChallengeDay(1);
              setIs30DayChallengeComplete(false);
              setCurrentPage('challenge-home');
            }}
          />
        );
      case 'custom-training':
        return <ChallengeTraining 
          onComplete={handleCustomTrainingComplete}
          onExit={() => setCurrentPage('training-home')}
          isCustomMode={true}
          showExitButton={false}
        />;
      case 'custom-complete':
        return (
          <TrainingComplete 
            duration={completedDuration} 
            onRestart={() => {
              setIsCustomTrainingMode(true);
              setIsChallengeMode(false);
              startTraining();
              setCurrentPage('countdown');
            }}
            onViewStats={handleViewStats}
            onBack={() => setCurrentPage('training-home')}
            onGoToSettings={() => setCurrentPage('settings')}
          />
        );
      case 'duration-selector':
        return <DurationSelector 
          onBack={() => setCurrentPage('training-home')} 
          onStart={handleDurationSelect}
        />;
      case 'countdown':
        return <TrainingCountdown onComplete={handleCountdownComplete} />;
      case 'training-progress':
        return <TrainingProgress 
          onComplete={handleCompleteTraining} 
          onCancel={handleCancelTraining}
          targetDuration={selectedDuration}
        />;
      case 'training-complete':
        return (
          <TrainingComplete 
            duration={completedDuration} 
            onRestart={() => setCurrentPage('duration-selector')}
            onViewStats={handleViewStats}
            onBack={handleBackToHome}
            onGoToSettings={() => setCurrentPage('settings')}
          />
        );
      case 'stats-home':
        return <StatsHome onOpenSettings={() => setCurrentPage('settings')} />;
      case 'settings':
        return <SettingsPage onBack={() => setCurrentPage('stats-home')} />;
      default:
        return <TrainingHome 
          onStartTraining={handleStartQuickTraining} 
          onStartCustomTraining={handleStartCustomTraining}
          onOpenChallenge={handleOpenChallenge}
        />;
    }
  };

  const showTabBar = ['training-home', 'stats-home'].includes(currentPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
      
      {showTabBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 rounded-t-3xl">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button
              onClick={() => {
                setActiveTab('training');
                setCurrentPage('training-home');
              }}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition ${
                activeTab === 'training'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Dumbbell className="w-6 h-6" />
              <span className="text-xs font-medium">训练</span>
            </button>
            
            <button
              onClick={() => {
                setActiveTab('stats');
                setCurrentPage('stats-home');
              }}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition ${
                activeTab === 'stats'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-medium">统计</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
