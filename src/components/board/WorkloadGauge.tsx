import React from 'react';

interface WorkloadGaugeProps {
  currentPercent: number;
  maxPercent?: number;
  showDetails?: boolean;
}

export const WorkloadGauge: React.FC<WorkloadGaugeProps> = ({
  currentPercent,
  maxPercent = 100,
  showDetails = true,
}) => {
  const isOverloaded = currentPercent > maxPercent;
  const isOptimal = currentPercent >= 60 && currentPercent <= maxPercent;
  const isUnder = currentPercent < 60 && currentPercent > 0;
  const isZero = currentPercent === 0;

  let barColor = 'bg-emerald-500 dark:bg-zinc-300';
  let dotColor = 'bg-emerald-500 dark:bg-zinc-300';
  let textColor = 'text-emerald-700 dark:text-zinc-300';
  let statusText = 'Optimal';

  if (isOverloaded) {
    barColor = 'bg-rose-500 dark:bg-white';
    dotColor = 'bg-rose-500 dark:bg-white';
    textColor = 'text-rose-600 dark:text-zinc-100 font-bold';
    statusText = `Overloaded (${currentPercent}%)`;
  } else if (isUnder) {
    barColor = 'bg-amber-500 dark:bg-zinc-500';
    dotColor = 'bg-amber-500 dark:bg-zinc-500';
    textColor = 'text-amber-600 dark:text-zinc-400';
    statusText = 'Under capacity';
  } else if (isZero) {
    barColor = 'bg-slate-200 dark:bg-zinc-800';
    dotColor = 'bg-slate-300 dark:bg-zinc-700';
    textColor = 'text-slate-400 dark:text-zinc-500';
    statusText = 'Unassigned';
  }

  const fillWidth = Math.min(100, (currentPercent / maxPercent) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="font-semibold text-slate-800 dark:text-zinc-200">{currentPercent}% FTE</span>
        </div>

        {showDetails && (
          <span className={`text-[11px] font-medium ${textColor}`}>
            {statusText}
          </span>
        )}
      </div>

      <div className="w-full h-1.5 bg-slate-100 dark:bg-obsidian-elevated rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
    </div>
  );
};
