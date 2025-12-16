import React, { useState } from 'react';
import { Camera, Send, Loader2, Utensils, AlertTriangle, CheckCircle } from 'lucide-react';
import { Meal, MealAnalysisResult } from '../types';
import { analyzeMealWithAI } from '../services/gemini';

interface MealLoggerProps {
  onAddMeal: (meal: Meal) => void;
  recentMeals: Meal[];
}

export const MealLogger: React.FC<MealLoggerProps> = ({ onAddMeal, recentMeals }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<MealAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setPreview(null);
    
    const result = await analyzeMealWithAI(input);
    setPreview(result);
    setIsAnalyzing(false);
  };

  const handleSave = () => {
    if (!preview || !input) return;
    
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: input,
      calories: preview.calories,
      protein: preview.protein,
      isHealthy: preview.isPregnancySafe,
      notes: preview.nutritionalNotes,
      timestamp: Date.now(),
    };

    onAddMeal(newMeal);
    setInput('');
    setPreview(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Utensils className="text-orange-500" size={20} />
          Catat Makanan
        </h3>
        
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Contoh: Nasi merah 1 mangkuk, ayam bakar bagian dada, sayur bayam bening..."
            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none text-gray-800 resize-none h-28 text-sm font-medium placeholder:text-gray-400"
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            {isAnalyzing ? (
               <button disabled className="bg-rose-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm cursor-not-allowed">
                 <Loader2 className="animate-spin" size={16} /> Analisis...
               </button>
            ) : preview ? (
               <div className="flex gap-2">
                  <button onClick={() => setPreview(null)} className="text-gray-500 font-bold px-3 py-2 text-xs hover:bg-gray-100 rounded-lg transition">Batal</button>
                  <button onClick={handleSave} className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-emerald-600 active:scale-95 transition">
                    <CheckCircle size={16} /> Simpan
                  </button>
               </div>
            ) : (
              <button 
                onClick={handleAnalyze} 
                disabled={!input.trim()}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-rose-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} /> Analisis AI
              </button>
            )}
          </div>
        </div>

        {/* AI Preview Result */}
        {preview && (
          <div className="mt-4 bg-orange-50 rounded-xl p-4 border border-orange-200 animate-fade-in shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`mt-1 p-1 rounded-full shrink-0 ${preview.isPregnancySafe ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {preview.isPregnancySafe ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Hasil Analisis</h4>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed font-medium">{preview.nutritionalNotes}</p>
                <div className="flex gap-4 mt-3">
                  <div className="text-xs bg-white px-2 py-1 rounded border border-orange-100 shadow-sm">
                    <span className="text-gray-500 font-semibold">Kalori:</span> <span className="font-bold text-gray-800 ml-1">{preview.calories} kkal</span>
                  </div>
                  <div className="text-xs bg-white px-2 py-1 rounded border border-orange-100 shadow-sm">
                    <span className="text-gray-500 font-semibold">Protein:</span> <span className="font-bold text-gray-800 ml-1">{preview.protein}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History List */}
      <div>
        <h3 className="text-md font-bold text-gray-800 mb-3 px-2">Riwayat Makan Hari Ini</h3>
        <div className="space-y-3">
          {recentMeals.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-10 bg-white rounded-xl border-2 border-dashed border-gray-200 font-medium">Belum ada makanan dicatat hari ini.</p>
          ) : (
            recentMeals.map((meal) => (
              <div key={meal.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{meal.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{meal.calories} kkal</span>
                     <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{meal.protein}g Protein</span>
                  </div>
                  {meal.notes && <p className="text-xs text-rose-600 mt-2 italic font-medium">"{meal.notes}"</p>}
                </div>
                <div className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};