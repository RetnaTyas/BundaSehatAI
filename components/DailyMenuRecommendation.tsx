
import React, { useState, useEffect } from 'react';
import { Sparkles, ChefHat, Info, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { UserProfile, DailyMenuPlan, DailyLog } from '../types';
import { generateDailyMenu } from '../services/gemini';

interface DailyMenuRecommendationProps {
  userProfile: UserProfile;
}

export const DailyMenuRecommendation: React.FC<DailyMenuRecommendationProps> = ({ userProfile }) => {
  const [menu, setMenu] = useState<DailyMenuPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ week: 0, avgCal: 0, avgProt: 0 });
  const [expanded, setExpanded] = useState(false);

  // Calculate stats on mount
  useEffect(() => {
    let totalCal = 0;
    let totalProt = 0;
    let count = 0;
    
    // Scan last 7 days of logs
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const saved = localStorage.getItem(`log_${dateStr}`);
      if (saved) {
        const log: DailyLog = JSON.parse(saved);
        if (log.meals.length > 0) {
          totalCal += log.meals.reduce((sum, m) => sum + m.calories, 0);
          totalProt += log.meals.reduce((sum, m) => sum + m.protein, 0);
          count++;
        }
      }
    }

    // Calculate Weeks Pregnant
    let week = 0;
    if (userProfile.pregnancyStartDate) {
      const start = new Date(userProfile.pregnancyStartDate);
      const diff = new Date().getTime() - start.getTime();
      week = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    }

    setStats({
      week: week || 0,
      avgCal: count > 0 ? Math.round(totalCal / count) : 0,
      avgProt: count > 0 ? Math.round(totalProt / count) : 0
    });
  }, [userProfile]);

  const handleGenerate = async () => {
    setLoading(true);
    setExpanded(true);
    const result = await generateDailyMenu(stats.week, stats.avgCal, stats.avgProt);
    if (result) {
      setMenu(result);
    }
    setLoading(false);
  };

  const MealCard = ({ title, item, colorClass }: { title: string, item: any, colorClass: string }) => (
    <div className={`p-3 rounded-xl border ${colorClass} mb-3`}>
      <h4 className="font-bold text-gray-800 text-sm mb-1">{title}</h4>
      <p className="font-semibold text-rose-600 text-sm">{item.name}</p>
      <p className="text-xs text-gray-600 mt-1 mb-2 leading-relaxed">{item.description}</p>
      <div className="flex gap-2 text-[10px] font-bold text-gray-500">
        <span className="bg-white px-2 py-1 rounded border border-gray-100">{item.estimatedCalories} kkal</span>
        <span className="bg-white px-2 py-1 rounded border border-gray-100">{item.estimatedProtein}g Protein</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ChefHat className="text-rose-500" size={22} />
          Rekomendasi Menu
        </h3>
        <button 
           onClick={() => setExpanded(!expanded)}
           className="text-gray-400 hover:text-gray-600"
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {!menu && !loading && (
        <div className="text-center py-4 bg-rose-50 rounded-xl border border-rose-100">
          <p className="text-sm text-gray-600 mb-3 px-4">
            Dapatkan inspirasi menu harian yang disesuaikan dengan kebutuhan nutrisi Bunda & si Kecil.
          </p>
          <button 
            onClick={handleGenerate}
            className="bg-gradient-to-r from-rose-500 to-rose-400 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 mx-auto"
          >
            <Sparkles size={16} fill="white" />
            Buat Menu Hari Ini
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <RefreshCw className="animate-spin text-rose-500" size={24} />
          <p className="text-xs font-medium text-gray-500 animate-pulse">Sedang meracik menu bergizi...</p>
        </div>
      )}

      {menu && expanded && (
        <div className="animate-fade-in">
          {/* Analysis Reasoning */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 flex gap-3 items-start">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-blue-800 leading-relaxed italic">
              "{menu.nutritionalReasoning}"
            </p>
          </div>

          <div className="space-y-1">
            <MealCard title="Sarapan" item={menu.breakfast} colorClass="bg-orange-50 border-orange-100" />
            <MealCard title="Makan Siang" item={menu.lunch} colorClass="bg-emerald-50 border-emerald-100" />
            <MealCard title="Makan Malam" item={menu.dinner} colorClass="bg-blue-50 border-blue-100" />
            <MealCard title="Camilan Sehat" item={menu.snack} colorClass="bg-purple-50 border-purple-100" />
          </div>

          {/* Cooking Tip */}
          <div className="mt-4 bg-yellow-50 p-3 rounded-xl border border-yellow-200">
            <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles size={12} /> Tips Dapur Bunda
            </h4>
            <p className="text-sm text-yellow-900 leading-relaxed font-medium">
              {menu.cookingTip}
            </p>
          </div>
          
          <button 
            onClick={handleGenerate}
            className="w-full mt-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition border border-dashed border-rose-300"
          >
            Buat Rekomendasi Lain
          </button>
        </div>
      )}
    </div>
  );
};
