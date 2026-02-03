'use client';

import { Mode } from '@/types';
import { Sparkles, Sliders, Scale } from '@/components/icons/Icons';

interface ModeSelectorProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export default function ModeSelector({ mode, setMode }: ModeSelectorProps) {
  const modes: { value: Mode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'guided',
      label: 'Guided',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Pre-built portfolios'
    },
    {
      value: 'custom',
      label: 'Custom',
      icon: <Sliders className="w-5 h-5" />,
      description: 'Build your own mix'
    },
    {
      value: 'rebalance',
      label: 'Rebalance',
      icon: <Scale className="w-5 h-5" />,
      description: 'Analyze holdings'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="grid grid-cols-3 gap-3">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`py-4 px-4 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-2 ${
              mode === m.value
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className={mode === m.value ? 'text-white' : 'text-blue-500'}>
              {m.icon}
            </span>
            <span>{m.label}</span>
            <span className={`text-xs ${mode === m.value ? 'text-blue-100' : 'text-gray-400'}`}>
              {m.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
