import React from 'react';

export type ViewMode = 'day' | 'week' | 'month' | 'year';

interface ViewSwitcherProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  options?: ViewMode[];
}

const DEFAULT_OPTIONS: ViewMode[] = ['day', 'week', 'month', 'year'];

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ mode, onChange, options }) => {
  const modes = options || DEFAULT_OPTIONS;
  return (
    <div className="flex gap-2 mb-2">
      {modes.map((m) => (
        <button
          key={m}
          className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${mode === m ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
          onClick={() => onChange(m)}
        >
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;
