import React from 'react';
import { Check, Clock, Utensils, CheckCircle2 } from 'lucide-react';

interface OrderTrackerStepperProps {
  status: string;
  orderNumber?: string;
  counterName?: string;
  timestamp?: string;
}

export const OrderTrackerStepper: React.FC<OrderTrackerStepperProps> = ({
  status,
  orderNumber,
  counterName,
  timestamp,
}) => {
  const steps = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Received & routed to counter' },
    { key: 'PREPARING', label: 'Preparing', desc: 'Live kitchen preparation' },
    { key: 'READY', label: 'Ready for Pickup', desc: 'Collect with your token' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Delivered successfully' },
  ];

  const getStepIndex = (st: string) => {
    const upper = (st || '').toUpperCase();
    if (upper === 'CANCELLED' || upper === 'REJECTED') return -1;
    if (upper === 'COMPLETED' || upper === 'DELIVERED') return 3;
    if (upper === 'READY') return 2;
    if (upper === 'PREPARING' || upper === 'PRINTING') return 1;
    return 0; // PLACED, QUEUED, PENDING
  };

  const currentIndex = getStepIndex(status);
  const isCancelled = status.toUpperCase() === 'CANCELLED' || status.toUpperCase() === 'REJECTED';

  if (isCancelled) {
    return (
      <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 text-xs">
        <div className="font-bold flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> Order Cancelled
        </div>
        <p className="opacity-90">This order was cancelled or rejected. Contact staff if this was unexpected.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {(orderNumber || counterName) && (
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            {orderNumber && (
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Order #{orderNumber}
              </span>
            )}
            {counterName && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                • {counterName}
              </span>
            )}
          </div>
          {timestamp && (
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timestamp}
            </span>
          )}
        </div>
      )}

      {/* Stepper horizontal track */}
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-zinc-200 dark:bg-zinc-800 z-0" />
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-0.5 bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 z-0"
          style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 92)}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : isCurrent
                    ? 'bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-100 dark:ring-emerald-950/50 animate-pulse'
                    : 'bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <div className="text-[11px] font-semibold mt-2 text-center text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                {step.label}
              </div>
              <div className="hidden sm:block text-[9px] text-zinc-400 text-center max-w-[80px] leading-tight mt-0.5">
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
