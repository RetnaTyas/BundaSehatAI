import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Utensils, MessageCircle, Settings, UserCircle } from 'lucide-react';
import { DailyLog, ViewState, Meal, UserProfile } from './types';
import { WaterTracker } from './components/WaterTracker';
import { SupplementTracker } from './components/SupplementTracker';
import { MealLogger } from './components/MealLogger';
import { Dashboard } from './components/Dashboard';
import { ChatAdvisor } from './components/ChatAdvisor';
import { HistoryView } from './components/HistoryView';

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_LOG: DailyLog = {
  date: getTodayString(),
  waterIntake: 0,
  supplements: {
    folicAcid: false,
    iron: false,
    calcium: false,
    vitaminD: false,
  },
  meals: []
};

const INITIAL_PROFILE: UserProfile = {
  name: '',
  pregnancyStartDate: ''
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [log, setLog] = useState<DailyLog>(INITIAL_LOG);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);

  // Load data from local storage on mount
  useEffect(() => {
    // Load Log
    const savedLog = localStorage.getItem(`log_${getTodayString()}`);
    if (savedLog) {
      try {
        setLog(JSON.parse(savedLog));
      } catch (e) {
        console.error("Failed to parse log", e);
      }
    }

    // Load Profile
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  // Save log whenever it changes
  useEffect(() => {
    localStorage.setItem(`log_${log.date}`, JSON.stringify(log));
  }, [log]);

  // Save profile whenever it changes
  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateWater = (intake: number) => {
    setLog(prev => ({ ...prev, waterIntake: intake }));
  };

  const toggleSupplement = (key: keyof DailyLog['supplements']) => {
    setLog(prev => ({
      ...prev,
      supplements: {
        ...prev.supplements,
        [key]: !prev.supplements[key]
      }
    }));
  };

  const updateSupplements = (newSupplements: Partial<DailyLog['supplements']>) => {
    setLog(prev => ({
      ...prev,
      supplements: {
        ...prev.supplements,
        ...newSupplements
      }
    }));
  };

  const addMeal = (meal: Meal) => {
    setLog(prev => ({
      ...prev,
      meals: [meal, ...prev.meals]
    }));
  };

  return (
    <div className="min-h-screen bg-rose-50 max-w-md mx-auto relative shadow-2xl overflow-hidden text-gray-800">
      
      {/* Header */}
      <header className="bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-10 border-b border-rose-100 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-rose-200">B</div>
           <h1 className="text-xl font-bold text-gray-900 tracking-tight">Bunda<span className="text-rose-500">Sehat</span></h1>
        </div>
        <div className="text-xs bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 rounded-full font-bold">
           {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 overflow-y-auto pb-28 min-h-[calc(100vh-64px)] scroll-smooth">
        {view === 'dashboard' && (
          <div className="animate-fade-in space-y-5">
            <Dashboard 
              log={log} 
              userProfile={userProfile} 
              onChangeProfile={() => setView('history')}
            />
            <div>
              <WaterTracker intake={log.waterIntake} onUpdate={updateWater} />
              <SupplementTracker 
                data={log.supplements} 
                onToggle={toggleSupplement} 
                onUpdate={updateSupplements}
              />
            </div>
          </div>
        )}

        {view === 'meals' && (
          <div className="animate-fade-in">
             <MealLogger onAddMeal={addMeal} recentMeals={log.meals} />
          </div>
        )}

        {view === 'chat' && (
          <div className="animate-fade-in h-full">
            <ChatAdvisor />
          </div>
        )}

        {view === 'history' && (
          <HistoryView 
             onBack={() => setView('dashboard')} 
             userProfile={userProfile}
             setUserProfile={setUserProfile}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center max-w-md mx-auto z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${view === 'dashboard' ? 'text-rose-600 scale-105' : 'text-gray-400 hover:text-rose-400'}`}
        >
          <LayoutDashboard size={24} strokeWidth={view === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Beranda</span>
        </button>

        <button 
          onClick={() => setView('meals')}
          className={`flex flex-col items-center gap-1 transition-all ${view === 'meals' ? 'text-rose-600 scale-105' : 'text-gray-400 hover:text-rose-400'}`}
        >
          <Utensils size={24} strokeWidth={view === 'meals' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Makan</span>
        </button>

        <div className="relative -top-7">
           <button 
             onClick={() => setView('chat')}
             className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-rose-400 rounded-full flex items-center justify-center text-white shadow-xl shadow-rose-300 hover:scale-105 transition duration-300 active:scale-95 border-4 border-white"
           >
             <MessageCircle size={28} fill="white" className="mt-0.5 ml-0.5" />
           </button>
        </div>

        <button 
          onClick={() => setView('history')}
          className={`flex flex-col items-center gap-1 transition-all ${view === 'history' ? 'text-rose-600 scale-105' : 'text-gray-400 hover:text-rose-400'}`}
        >
          <UserCircle size={24} strokeWidth={view === 'history' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </nav>

      {/* Global CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        body {
          background-color: #f3f4f6; /* Outer background */
        }
      `}</style>
    </div>
  );
};

export default App;