import React from 'react';
import { Plus, Minus, Droplets } from 'lucide-react';

interface WaterTrackerProps {
  intake: number;
  onUpdate: (newIntake: number) => void;
}

const GOAL = 10; // 10 glasses ~ 2.5L

export const WaterTracker: React.FC<WaterTrackerProps> = ({ intake, onUpdate }) => {
  const percentage = Math.min((intake / GOAL) * 100, 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-200 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Droplets className="text-blue-600" size={20} />
          Hidrasi
        </h3>
        <span className="text-sm font-bold text-gray-600">{intake} / {GOAL} Gelas</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => onUpdate(Math.max(0, intake - 1))}
          className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition shadow-sm"
          aria-label="Kurangi air"
        >
          <Minus size={22} />
        </button>

        <div className="flex-1 relative h-8 bg-blue-50 rounded-full overflow-hidden border border-blue-100">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-900 mix-blend-multiply">
             {Math.round(percentage)}%
          </div>
        </div>

        <button 
          onClick={() => onUpdate(intake + 1)}
          className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center hover:bg-blue-200 active:scale-95 transition shadow-sm"
          aria-label="Tambah air"
        >
          <Plus size={22} />
        </button>
      </div>
      <p className="text-center text-xs font-medium text-gray-500 mt-3">1 gelas ≈ 250ml</p>
    </div>
  );
};