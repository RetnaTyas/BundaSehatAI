import React, { useEffect, useState } from 'react';
import { DailyLog, UserProfile } from '../types';
import { Calendar, Bell, Clock, Settings, TrendingUp, Droplets, Utensils, Pill } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

interface HistoryViewProps {
  onBack: () => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onBack, userProfile, setUserProfile }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'settings'>('stats');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [statsPeriod, setStatsPeriod] = useState<7 | 30>(7);

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
    // Sort by date ascending for charts
    loadedLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setLogs(loadedLogs);
  }, []);

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setUserProfile({ ...userProfile, [field]: value });
  };

  const handleNotifChange = (field: string, value: any) => {
    const newNotif = { ...userProfile.notifications, [field]: value };
    setUserProfile({ ...userProfile, notifications: newNotif });
  };
  
  const handleMealTimeChange = (type: 'breakfast' | 'lunch' | 'dinner', value: string) => {
    const newTimes = { ...userProfile.notifications.mealTimes, [type]: value };
    const newNotif = { ...userProfile.notifications, mealTimes: newTimes };
    setUserProfile({ ...userProfile, notifications: newNotif });
  };

  // Process data for charts
  const getChartData = () => {
    const periodLogs = logs.slice(-statsPeriod);
    return periodLogs.map(log => ({
      name: new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      calories: log.meals.reduce((sum, m) => sum + m.calories, 0),
      protein: log.meals.reduce((sum, m) => sum + m.protein, 0),
      water: log.waterIntake,
    }));
  };

  const calculateAverages = () => {
    const periodLogs = logs.slice(-statsPeriod);
    if (periodLogs.length === 0) return { avgCal: 0, avgProt: 0, avgWater: 0 };
    
    const totalCal = periodLogs.reduce((sum, log) => sum + log.meals.reduce((s, m) => s + m.calories, 0), 0);
    const totalProt = periodLogs.reduce((sum, log) => sum + log.meals.reduce((s, m) => s + m.protein, 0), 0);
    const totalWater = periodLogs.reduce((sum, log) => sum + log.waterIntake, 0);

    return {
      avgCal: Math.round(totalCal / periodLogs.length),
      avgProt: Math.round(totalProt / periodLogs.length),
      avgWater: Math.round(totalWater / periodLogs.length),
    };
  };

  const averages = calculateAverages();
  const chartData = getChartData();

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Tab Switcher */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-rose-100">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'stats' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:bg-rose-50'
          }`}
        >
          Riwayat & Tren
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'settings' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:bg-rose-50'
          }`}
        >
          Profil & Pengaturan
        </button>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex gap-2 justify-end">
             <button 
                onClick={() => setStatsPeriod(7)}
                className={`px-3 py-1 text-xs font-bold rounded-full border ${statsPeriod === 7 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-white text-gray-500 border-gray-200'}`}
             >
               7 Hari
             </button>
             <button 
                onClick={() => setStatsPeriod(30)}
                className={`px-3 py-1 text-xs font-bold rounded-full border ${statsPeriod === 30 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-white text-gray-500 border-gray-200'}`}
             >
               30 Hari
             </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2">
             <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Avg Kalori</span>
                <div className="text-xl font-bold text-gray-800">{averages.avgCal}</div>
                <span className="text-[10px] text-gray-500">kkal/hari</span>
             </div>
             <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Avg Protein</span>
                <div className="text-xl font-bold text-emerald-600">{averages.avgProt}g</div>
                <span className="text-[10px] text-gray-500">gram/hari</span>
             </div>
             <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Avg Air</span>
                <div className="text-xl font-bold text-blue-600">{averages.avgWater}</div>
                <span className="text-[10px] text-gray-500">gelas/hari</span>
             </div>
          </div>

          {/* Charts */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
             <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
               <TrendingUp size={16} className="text-rose-500"/> Tren Kalori & Protein
             </h3>
             <div className="h-48 w-full text-xs">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#fb7185" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorProt" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                   <YAxis hide />
                   <Tooltip 
                     contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                     labelStyle={{color: '#374151', fontWeight: 'bold'}}
                   />
                   <Area type="monotone" dataKey="calories" stroke="#fb7185" fillOpacity={1} fill="url(#colorCal)" name="Kalori" />
                   <Area type="monotone" dataKey="protein" stroke="#34d399" fillOpacity={1} fill="url(#colorProt)" name="Protein" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
             <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Droplets size={16} className="text-blue-500"/> Tren Hidrasi
             </h3>
             <div className="h-40 w-full text-xs">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                   <XAxis dataKey="name" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                   <YAxis hide />
                   <Tooltip 
                     cursor={{fill: '#eff6ff'}}
                     contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                   />
                   <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Gelas Air" />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Raw History List (Reverse sorted for display) */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-gray-800 mb-3 px-2">Riwayat Lengkap</h3>
             {[...logs].reverse().map((log) => (
                <div key={log.date} className="bg-white p-3 mb-2 rounded-xl border border-gray-100 flex justify-between items-center">
                   <span className="text-sm font-medium text-gray-700">
                     {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                   </span>
                   <div className="flex gap-2">
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded font-bold">
                        {log.meals.reduce((s, m) => s + m.calories, 0)} kkal
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">
                        {log.waterIntake} gls
                      </span>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-rose-500" size={20} />
              Profil Bunda
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nama Panggilan</label>
                <input 
                  type="text" 
                  value={userProfile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">HPHT</label>
                <input 
                  type="date" 
                  value={userProfile.pregnancyStartDate}
                  onChange={(e) => handleProfileChange('pregnancyStartDate', e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <Bell className="text-rose-500" size={20} />
                 Pengingat Harian
               </h2>
               <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="toggle" 
                    id="toggle-main" 
                    checked={userProfile.notifications.enabled}
                    onChange={(e) => handleNotifChange('enabled', e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full"
                    style={{borderColor: userProfile.notifications.enabled ? '#fb7185' : '#e5e7eb'}}
                  />
                  <label 
                    htmlFor="toggle-main" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${userProfile.notifications.enabled ? 'bg-rose-500' : 'bg-gray-300'}`}
                  ></label>
               </div>
            </div>

            {userProfile.notifications.enabled && (
              <div className="space-y-6 animate-fade-in">
                {/* Water Reminder */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 font-bold text-blue-800 text-sm">
                        <Droplets size={16} /> Minum Air
                      </div>
                      <input 
                        type="checkbox"
                        checked={userProfile.notifications.waterReminder}
                        onChange={(e) => handleNotifChange('waterReminder', e.target.checked)}
                        className="accent-blue-500 w-4 h-4"
                      />
                   </div>
                   {userProfile.notifications.waterReminder && (
                     <div className="flex items-center gap-2 text-xs text-blue-700">
                        <span>Ingatkan setiap</span>
                        <select 
                          value={userProfile.notifications.waterInterval}
                          onChange={(e) => handleNotifChange('waterInterval', parseInt(e.target.value))}
                          className="bg-white border border-blue-200 rounded px-2 py-1 text-blue-900 font-bold outline-none"
                        >
                          <option value={60}>1 Jam</option>
                          <option value={120}>2 Jam</option>
                          <option value={180}>3 Jam</option>
                        </select>
                     </div>
                   )}
                </div>

                {/* Supplements */}
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                   <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 font-bold text-purple-800 text-sm">
                        <Pill size={16} /> Suplemen
                      </div>
                      <input 
                        type="checkbox"
                        checked={userProfile.notifications.supplementReminder}
                        onChange={(e) => handleNotifChange('supplementReminder', e.target.checked)}
                        className="accent-purple-500 w-4 h-4"
                      />
                   </div>
                   {userProfile.notifications.supplementReminder && (
                     <div className="flex items-center gap-2 text-xs text-purple-700">
                        <Clock size={14} />
                        <span>Pukul:</span>
                        <input 
                          type="time" 
                          value={userProfile.notifications.supplementTime}
                          onChange={(e) => handleNotifChange('supplementTime', e.target.value)}
                          className="bg-white border border-purple-200 rounded px-2 py-1 text-purple-900 font-bold outline-none"
                        />
                     </div>
                   )}
                </div>

                {/* Meals */}
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                   <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 font-bold text-orange-800 text-sm">
                        <Utensils size={16} /> Waktu Makan
                      </div>
                      <input 
                        type="checkbox"
                        checked={userProfile.notifications.mealReminder}
                        onChange={(e) => handleNotifChange('mealReminder', e.target.checked)}
                        className="accent-orange-500 w-4 h-4"
                      />
                   </div>
                   {userProfile.notifications.mealReminder && (
                     <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex justify-between items-center bg-white p-2 rounded border border-orange-100">
                           <span className="text-gray-500">Sarapan</span>
                           <input 
                             type="time" 
                             value={userProfile.notifications.mealTimes.breakfast}
                             onChange={(e) => handleMealTimeChange('breakfast', e.target.value)}
                             className="font-bold text-gray-700 outline-none bg-transparent text-right w-20" 
                           />
                        </div>
                        <div className="flex justify-between items-center bg-white p-2 rounded border border-orange-100">
                           <span className="text-gray-500">Siang</span>
                           <input 
                             type="time" 
                             value={userProfile.notifications.mealTimes.lunch}
                             onChange={(e) => handleMealTimeChange('lunch', e.target.value)}
                             className="font-bold text-gray-700 outline-none bg-transparent text-right w-20" 
                           />
                        </div>
                        <div className="flex justify-between items-center bg-white p-2 rounded border border-orange-100">
                           <span className="text-gray-500">Malam</span>
                           <input 
                             type="time" 
                             value={userProfile.notifications.mealTimes.dinner}
                             onChange={(e) => handleMealTimeChange('dinner', e.target.value)}
                             className="font-bold text-gray-700 outline-none bg-transparent text-right w-20" 
                           />
                        </div>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};