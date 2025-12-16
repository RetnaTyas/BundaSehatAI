import React, { useEffect, useState } from 'react';
import { DailyLog, UserProfile } from '../types';
import { Calendar, ChevronRight, Droplets, Utensils, Pill, ArrowLeft } from 'lucide-react';

interface HistoryViewProps {
  onBack: () => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onBack, userProfile, setUserProfile }) => {
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    const loadedLogs: DailyLog[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('log_')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            loadedLogs.push(JSON.parse(item));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    // Sort by date descending
    loadedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setLogs(loadedLogs);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserProfile({ ...userProfile, pregnancyStartDate: e.target.value });
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserProfile({ ...userProfile, name: e.target.value });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Profile Settings Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="text-rose-500" size={20} />
          Profil Kehamilan
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Nama Panggilan</label>
            <input 
              type="text" 
              value={userProfile.name}
              onChange={handleNameChange}
              placeholder="Contoh: Bunda Ani"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none text-gray-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">HPHT (Hari Pertama Haid Terakhir)</label>
            <input 
              type="date" 
              value={userProfile.pregnancyStartDate}
              onChange={handleDateChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none text-gray-800 font-medium"
            />
            <p className="text-[10px] text-gray-400 mt-2">
              *Digunakan untuk menghitung umur kehamilan dan estimasi hari perkiraan lahir (HPL).
            </p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">Riwayat Harian</h3>
        {logs.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400 font-medium">Belum ada data tersimpan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const totalCalories = log.meals.reduce((sum, m) => sum + m.calories, 0);
              const totalProtein = log.meals.reduce((sum, m) => sum + m.protein, 0);
              const supplementCount = Object.values(log.supplements).filter(Boolean).length;
              const dateObj = new Date(log.date);

              return (
                <div key={log.date} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-800">
                      {dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      {log.date === new Date().toISOString().split('T')[0] ? 'Hari Ini' : log.date}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-orange-50 p-2 rounded-lg text-center">
                       <div className="text-orange-400 mb-1 flex justify-center"><Utensils size={16} /></div>
                       <div className="text-xs text-gray-500">Kalori</div>
                       <div className="font-bold text-gray-800 text-sm">{totalCalories}</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                       <div className="text-blue-400 mb-1 flex justify-center"><Droplets size={16} /></div>
                       <div className="text-xs text-gray-500">Air</div>
                       <div className="font-bold text-gray-800 text-sm">{log.waterIntake} Gls</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg text-center">
                       <div className="text-green-400 mb-1 flex justify-center"><Pill size={16} /></div>
                       <div className="text-xs text-gray-500">Suplemen</div>
                       <div className="font-bold text-gray-800 text-sm">{supplementCount}/4</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};