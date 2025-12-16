import React from 'react';
import { DailyLog, UserProfile } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calendar, Baby, ChevronRight } from 'lucide-react';

interface DashboardProps {
  log: DailyLog;
  userProfile: UserProfile;
  onChangeProfile: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ log, userProfile, onChangeProfile }) => {
  const totalCalories = log.meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = log.meals.reduce((sum, meal) => sum + meal.protein, 0);
  
  // Goals
  const GOAL_CALORIES = 2200;
  const GOAL_PROTEIN = 75; // grams

  const proteinData = [
    { name: 'Consumed', value: totalProtein },
    { name: 'Remaining', value: Math.max(0, GOAL_PROTEIN - totalProtein) },
  ];
  
  const COLORS = ['#10b981', '#f3f4f6']; // Emerald-500 for protein

  // Pregnancy Calculation
  const calculatePregnancyStats = () => {
    if (!userProfile.pregnancyStartDate) return null;
    const start = new Date(userProfile.pregnancyStartDate);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    let trimester = 1;
    if (weeks >= 14 && weeks <= 27) trimester = 2;
    if (weeks >= 28) trimester = 3;

    return { weeks, days, trimester };
  };

  const stats = calculatePregnancyStats();

  return (
    <div className="space-y-6 pb-20">
      {/* Header Summary Card */}
      <div 
        onClick={onChangeProfile}
        className="bg-gradient-to-br from-rose-600 to-rose-400 rounded-3xl p-6 text-white shadow-xl shadow-rose-200 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {userProfile.name ? `Hai, ${userProfile.name}!` : 'Halo, Bunda!'}
            </h2>
            {stats ? (
              <div className="flex items-center gap-2 mt-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                <Baby size={16} className="text-white" />
                <span className="text-sm font-semibold">
                  Minggu ke-{stats.weeks} • Hari ke-{stats.days}
                </span>
              </div>
            ) : (
              <p className="text-rose-50 text-sm font-medium mt-1 underline decoration-rose-200 underline-offset-4">
                Ketuk untuk atur tanggal kehamilan
              </p>
            )}
          </div>
          {stats && (
            <div className="bg-white/90 text-rose-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
              Trimester {stats.trimester}
            </div>
          )}
        </div>
        
        <div className="flex mt-8 justify-between items-end">
          <div>
            <div className="flex items-baseline gap-1">
               <span className="text-4xl font-extrabold tracking-tight">{totalCalories}</span>
               <span className="text-sm font-medium text-rose-100">kkal</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs font-medium text-rose-100 mb-1">Target Harian</div>
             <div className="text-xl font-bold">{GOAL_CALORIES} kkal</div>
          </div>
        </div>
        
        {/* Progress Bar for Calories */}
        <div className="mt-4 h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ width: `${Math.min((totalCalories / GOAL_CALORIES) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Protein Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col items-center justify-center">
          <h3 className="text-gray-900 text-sm font-bold mb-2 flex items-center gap-1">
            Protein <span className="text-gray-400 font-normal">(g)</span>
          </h3>
          <div className="h-28 w-28 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={proteinData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {proteinData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-extrabold text-gray-800">{Math.round(totalProtein)}</span>
                <span className="text-[10px] font-bold text-gray-400">/ {GOAL_PROTEIN}g</span>
             </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-center">
          <h3 className="text-gray-900 text-sm font-bold mb-4">Ringkasan</h3>
          <ul className="space-y-4">
             <li className="flex justify-between text-sm items-center">
               <span className="text-gray-500 font-medium">Makan</span>
               <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">{log.meals.length}x</span>
             </li>
             <li className="flex justify-between text-sm items-center">
               <span className="text-gray-500 font-medium">Air</span>
               <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{log.waterIntake} Gls</span>
             </li>
             <li className="flex justify-between text-sm items-center">
               <span className="text-gray-500 font-medium">Suplemen</span>
               <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                 {Object.values(log.supplements).filter(Boolean).length}/4
               </span>
             </li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
         <div className="flex gap-3">
           <div className="text-2xl">💡</div>
           <div>
             <h3 className="text-orange-900 font-bold mb-1 text-sm">Tips Hari Ini</h3>
             <p className="text-sm text-orange-800 leading-relaxed font-medium">
               {stats && stats.trimester === 1 
                 ? "Di trimester pertama, asam folat sangat krusial. Pastikan bunda mengonsumsi sayuran hijau ya!" 
                 : stats && stats.trimester === 3 
                 ? "Bunda mungkin cepat lelah. Perbanyak istirahat dan kurangi konsumsi garam untuk mengurangi bengkak."
                 : "Pastikan hidrasi terjaga minimal 2.5 liter sehari untuk menjaga air ketuban."}
             </p>
           </div>
         </div>
      </div>
    </div>
  );
};