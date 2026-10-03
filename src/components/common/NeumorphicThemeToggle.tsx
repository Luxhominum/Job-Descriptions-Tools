import React from 'react';

interface NeumorphicThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

export const NeumorphicThemeToggle: React.FC<NeumorphicThemeToggleProps> = ({
  isDark,
  onToggle,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Label Text from video */}
      <span
        onClick={onToggle}
        className="text-[12px] font-bold tracking-tight cursor-pointer transition-colors duration-300 w-9 text-right"
        style={{
          color: isDark ? '#94a3b8' : '#64748b',
        }}
      >
        {isDark ? 'Dark' : 'Light'}
      </span>

      {/* Outer Pill Track */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={onToggle}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="relative flex items-center p-1 rounded-full cursor-pointer transition-all duration-400 outline-hidden focus:outline-none"
        style={{
          width: '74px',
          height: '38px',
          backgroundColor: isDark ? '#1a202c' : '#eaedf3',
          boxShadow: isDark
            ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 5px rgba(255, 255, 255, 0.05), 0 1px 2px rgba(0, 0, 0, 0.4)'
            : 'inset 2px 2px 5px rgba(166, 178, 199, 0.45), inset -2px -2px 5px rgba(255, 255, 255, 0.9), 0 2px 5px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Sun Inactive Background Icon (Left) */}
        <div
          className="absolute left-2.5 flex items-center justify-center transition-all duration-300"
          style={{
            opacity: isDark ? 0.35 : 0,
            transform: isDark ? 'scale(1)' : 'scale(0.75)',
            pointerEvents: 'none',
          }}
        >
          {/* Sun outline dots icon matching video */}
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </div>

        {/* Moon / Night Inactive Background Icon (Right) */}
        <div
          className="absolute right-2.5 flex items-center justify-center transition-all duration-300"
          style={{
            opacity: isDark ? 0 : 0.4,
            transform: isDark ? 'scale(0.75)' : 'scale(1)',
            pointerEvents: 'none',
          }}
        >
          {/* Crescent moon with ripples icon matching video */}
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>

        {/* Executive Titanium Monochrome Knob (Thumb) */}
        <div
          className="relative flex items-center justify-center rounded-full transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10"
          style={{
            width: '32px',
            height: '30px',
            transform: isDark ? 'translateX(34px)' : 'translateX(0px)',
            background: isDark
              ? 'linear-gradient(135deg, #f4f4f5 0%, #e4e4e7 100%)'
              : 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
            boxShadow: isDark
              ? '0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
              : '0 2px 6px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Active icon inside knob with flip/fade transition */}
          <div className="relative w-4 h-4 flex items-center justify-center">
            {/* Sun Icon (when light mode) */}
            <svg
              className="absolute w-3.5 h-3.5 text-white transition-all duration-300"
              style={{
                opacity: isDark ? 0 : 1,
                transform: isDark ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
              }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" fill="white" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>

            {/* Moon Icon (when dark mode) */}
            <svg
              className="absolute w-3.5 h-3.5 text-zinc-900 transition-all duration-300"
              style={{
                opacity: isDark ? 1 : 0,
                transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
              }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
};
