import React from 'react';
import { Play, RotateCcw, SkipForward, Pause } from 'lucide-react';

interface Props {
  onNextStep: () => void;
  onReset: () => void;
  onAutoRun: () => void;
  isAutoRunning: boolean;
  canNext: boolean;
}

export const Controls: React.FC<Props> = ({ onNextStep, onReset, onAutoRun, isAutoRunning, canNext }) => {
  return (
    <div className="flex gap-3 justify-center items-center py-2 px-4 bg-white shadow-md border border-gray-200 rounded-lg">
      <button 
        onClick={onReset}
        className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-colors"
        title="重置系统"
      >
        <RotateCcw size={18} />
      </button>

      <button 
        onClick={onAutoRun}
        disabled={!canNext && !isAutoRunning}
        className={`flex items-center gap-2 px-5 py-2 rounded-md font-bold text-lg text-white shadow-sm transition-all
          ${isAutoRunning ? 'bg-orange-500 animate-pulse' : canNext ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}
        `}
      >
        {isAutoRunning ? <Pause size={18} /> : <Play size={18} />}
        {isAutoRunning ? '运行中' : '自动迭代'}
      </button>

      <button 
        onClick={onNextStep}
        disabled={!canNext || isAutoRunning}
        className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold text-lg text-white shadow-sm transition-all
          ${!canNext || isAutoRunning ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-800 hover:bg-blue-900'}
        `}
      >
        <SkipForward size={20} />
        单步执行
      </button>
    </div>
  );
};