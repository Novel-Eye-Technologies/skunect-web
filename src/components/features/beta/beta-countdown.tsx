'use client';

import { useEffect, useState } from 'react';

// Beta launches Apr 30 2026, 09:00 WAT (UTC+1)
const BETA_LAUNCH_ISO = '2026-04-30T09:00:00+01:00';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function getTimeLeft(): TimeLeft {
  const diff = new Date(BETA_LAUNCH_ISO).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
    done: false,
  };
}

interface BetaCountdownProps {
  variant?: 'dark' | 'light';
}

export function BetaCountdown({ variant = 'dark' }: BetaCountdownProps) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) {
    // Prevent hydration mismatch — render placeholder until mount
    return (
      <div className="flex items-center gap-2 sm:gap-3" aria-hidden />
    );
  }

  if (time.done) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-teal/15 px-4 py-2 text-sm font-semibold text-teal">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
        </span>
        Beta is live — enrollment open
      </div>
    );
  }

  const units: Array<{ label: string; value: number }> = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  const tileClass =
    variant === 'dark'
      ? 'bg-white/5 ring-1 ring-white/10 text-white'
      : 'bg-navy/5 ring-1 ring-navy/10 text-navy';
  const labelClass =
    variant === 'dark'
      ? 'text-[10px] font-medium uppercase tracking-[0.14em] text-white/50'
      : 'text-[10px] font-medium uppercase tracking-[0.14em] text-navy/60';

  return (
    <div className="flex items-end gap-2 sm:gap-3" aria-label="Beta launch countdown">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-end gap-2 sm:gap-3">
          <div
            className={`flex min-w-[60px] flex-col items-center rounded-xl px-3 py-2 backdrop-blur-sm sm:min-w-[72px] sm:px-4 sm:py-3 ${tileClass}`}
          >
            <span className="font-display text-2xl leading-none tabular-nums sm:text-4xl">
              {unit.value.toString().padStart(2, '0')}
            </span>
            <span className={`mt-1.5 ${labelClass}`}>{unit.label}</span>
          </div>
          {i < units.length - 1 && (
            <span
              className={`pb-5 text-2xl font-light ${
                variant === 'dark' ? 'text-white/20' : 'text-navy/20'
              }`}
              aria-hidden
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
