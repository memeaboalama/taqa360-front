import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type TourStep = {
  id: string;
  title: string;
  content: string;
  targetSelector?: string;
};

interface GuidedTourProps {
  isOpen: boolean;
  steps: TourStep[];
  onClose: () => void;
  storageKey?: string;
}

const padding = 10;

const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, steps, onClose, storageKey = 'educator_guided_tour_seen' }) => {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[index];
  const mounted = useRef(false);

  const targetEl = useMemo(() => {
    if (!step?.targetSelector) return null;
    try { return document.querySelector(step.targetSelector) as HTMLElement | null; } catch { return null; }
  }, [step]);

  const computeRect = useCallback(() => {
    if (!targetEl) { setRect(null); return; }
    const r = targetEl.getBoundingClientRect();
    setRect(new DOMRect(r.x + window.scrollX, r.y + window.scrollY, r.width, r.height));
  }, [targetEl]);

  useEffect(() => {
    if (!isOpen) return;
    computeRect();
    const ro = new ResizeObserver(computeRect);
    if (targetEl) ro.observe(targetEl);
    const onScroll = () => computeRect();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      try { ro.disconnect(); } catch {}
    };
  }, [isOpen, targetEl, computeRect]);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (isOpen && targetEl) {
      try { targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); } catch {}
    }
  }, [index]);

  if (!isOpen || steps.length === 0) return null;

  const close = () => {
    try { localStorage.setItem(storageKey, '1'); } catch {}
    onClose();
  };

  const next = () => setIndex(i => Math.min(i + 1, steps.length - 1));
  const prev = () => setIndex(i => Math.max(i - 1, 0));
  const isLast = index === steps.length - 1;

  // Tooltip positioning near target (prefer above; fallback below)
  const viewportY = (rect?.top ?? 0) - window.scrollY;
  const placeAbove = viewportY > 160; // enough space above
  const tooltipTop = rect ? (placeAbove ? rect.top - padding : rect.bottom + padding) : 0;
  const tooltipLeft = rect ? Math.max(8, Math.min(rect.left + rect.width / 2 - 180, window.scrollX + (document.documentElement.clientWidth - 360 - 8))) : 16;

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Click-catcher without dimming to keep target 100% visible.
          Only rendered when the target was found so a missing selector
          never leaves an invisible full-screen blocker swallowing clicks. */}
      {rect && <div className="absolute inset-0" onClick={close} />}

      {/* Highlight ring around target (no dark mask) */}
      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl"
          style={{
            left: rect.left - 6,
            top: rect.top - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            outline: '2px solid rgba(248,196,33,0.95)',
            boxShadow: '0 0 0 6px rgba(248,196,33,0.15)'
          }}
        />
      )}

      {/* Floating tooltip that follows the target (falls back to a centered card when no target) */}
      <div
        role="dialog"
        aria-label={step.title}
        className={`absolute w-[360px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-xl border border-brand-accent/40 dark:border-brand-accent/40 animate-fade-in-up`}
        style={rect
          ? { left: tooltipLeft, top: tooltipTop }
          : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
          {/* Arrow */}
          <div
            className={`absolute ${placeAbove ? 'bottom-[-8px]' : 'top-[-8px]'} right-[calc(50%-8px)] w-0 h-0 border-l-8 border-r-8 ${placeAbove ? 'border-t-8 border-t-brand-accent/40 dark:border-t-brand-accent/40' : 'border-b-8 border-b-brand-accent/40 dark:border-b-brand-accent/40'} border-transparent`}
          />
          <div
            className={`absolute ${placeAbove ? 'bottom-[-7px]' : 'top-[-7px]'} right-[calc(50%-7px)] w-0 h-0 border-l-7 border-r-7 ${placeAbove ? 'border-t-7 border-t-white dark:border-t-slate-900' : 'border-b-7 border-b-white dark:border-b-slate-900'} border-transparent`}
          />

          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold text-brand-dark">الخطوة {index + 1} من {steps.length}</p>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">{step.title}</h3>
              </div>
              <button onClick={close} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="إغلاق">✕</button>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step.content}</p>

            <div className="mt-4 flex items-center justify-between">
              <button onClick={prev} disabled={index === 0} className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg ${index === 0 ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/60' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'}`}>السابق</button>
              <div className="flex items-center gap-2">
                <button onClick={close} className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">تخطي</button>
                <button onClick={isLast ? close : next} className="px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-brand-primary text-white hover:shadow-glow-primary">{isLast ? 'إنهاء' : 'التالي'}</button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default GuidedTour;
