import React, { useState } from 'react';
import { Pill, Check, Sparkles, Send, Loader2, X } from 'lucide-react';
import { DailyLog } from '../types';
import { analyzeSupplementsWithAI } from '../services/gemini';

interface SupplementTrackerProps {
  data: DailyLog['supplements'];
  onToggle: (key: keyof DailyLog['supplements']) => void;
  onUpdate: (newSupplements: Partial<DailyLog['supplements']>) => void;
}

export const SupplementTracker: React.FC<SupplementTrackerProps> = ({ data, onToggle, onUpdate }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState<string | null>(null);

  const items = [
    { key: 'folicAcid', label: 'Asam Folat', desc: 'Saraf janin' },
    { key: 'iron', label: 'Zat Besi', desc: 'Cegah anemia' },
    { key: 'calcium', label: 'Kalsium', desc: 'Tulang & gigi' },
    { key: 'vitaminD', label: 'Vitamin D', desc: 'Serap kalsium' },
  ] as const;

  const handleAIAnalysis = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setAnalysisFeedback(null);

    const result = await analyzeSupplementsWithAI(input);
    
    // Only update keys that are true in the result
    if (Object.keys(result.detected).length > 0) {
       onUpdate(result.detected as Partial<DailyLog['supplements']>);
       setAnalysisFeedback(result.feedback);
       setInput('');
    } else {
       setAnalysisFeedback(result.feedback || "Tidak ada suplemen yang terdeteksi.");
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-200 mb-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
        <Pill className="text-rose-600" size={20} />
        Suplemen Harian
      </h3>
      
      <div className="grid grid-cols-2 gap-3 mb-5">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onToggle(item.key)}
            className={`p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
              data[item.key] 
                ? 'bg-rose-50 border-rose-500 shadow-sm' 
                : 'bg-white border-gray-200 hover:border-rose-300'
            }`}
          >
            <div className="flex justify-between items-start relative z-10">
              <span className={`font-bold text-sm ${data[item.key] ? 'text-rose-800' : 'text-gray-700'}`}>
                {item.label}
              </span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                data[item.key] ? 'bg-rose-500 border-rose-500' : 'bg-white border-gray-300'
              }`}>
                {data[item.key] && <Check size={14} className="text-white stroke-[3]" />}
              </div>
            </div>
            <p className={`text-[11px] font-medium mt-1 ${data[item.key] ? 'text-rose-700' : 'text-gray-500'}`}>
              {item.desc}
            </p>
          </button>
        ))}
      </div>

      {/* AI Quick Input */}
      <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
        <label className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1.5">
          <Sparkles size={12} className="text-rose-500" />
          Input Otomatis dengan AI
        </label>
        <div className="flex gap-2 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAIAnalysis()}
            placeholder="Contoh: Udah minum kalsium sama ttd"
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-rose-200 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 text-gray-700 bg-white placeholder:text-rose-300"
          />
          <button 
            onClick={handleAIAnalysis}
            disabled={!input.trim() || isAnalyzing}
            className="bg-rose-500 text-white px-3 py-2 rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        
        {/* Analysis Feedback Result */}
        {analysisFeedback && (
          <div className="mt-3 bg-white/80 p-3 rounded-lg border border-rose-100 flex items-start gap-2 animate-fade-in relative">
             <div className="mt-0.5 text-emerald-500">
                <Check size={16} />
             </div>
             <p className="text-xs text-gray-600 font-medium leading-relaxed pr-4">
                {analysisFeedback}
             </p>
             <button 
               onClick={() => setAnalysisFeedback(null)}
               className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
             >
                <X size={14} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};