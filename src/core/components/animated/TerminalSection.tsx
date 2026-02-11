'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import { AlertTriangle, XCircle, CheckCircle2, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalSectionProps {
  onRunAudit?: (url: string) => void;
}

const ANIMATION_TIMELINE = [
  { step: 1, delay: 1000 },
  { step: 2, delay: 2500 },
  { step: 3, delay: 4500 },
  { step: 4, delay: 6500 },
  { step: 5, delay: 8500 },
];

const FALLBACK_SITE = 'client-site.com';

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(candidate);
  } catch {
    return null;
  }
};

const toCommandTarget = (url: URL) => {
  const path = url.pathname === '/' ? '' : url.pathname;
  return `${url.hostname}${path}`;
};

export function TerminalSection({ onRunAudit }: TerminalSectionProps) {
  const [step, setStep] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [targetLabel, setTargetLabel] = useState(FALLBACK_SITE);
  const [lastQueuedTarget, setLastQueuedTarget] = useState<string | null>(null);
  const [isScoreHidden, setIsScoreHidden] = useState(false);
  const [hasTriggeredRun, setHasTriggeredRun] = useState(false);
  const [isTerminalFocused, setIsTerminalFocused] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);

  const commandText = useMemo(
    () => `analyze_site_performance --url ${targetLabel}`,
    [targetLabel],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTerminalFocused) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleFocusCapture = () => {
    setIsTerminalFocused(true);
    x.set(0);
    y.set(0);
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (!event.currentTarget.contains(nextTarget)) {
      setIsTerminalFocused(false);
    }
  };

  useEffect(() => {
    const timeouts = ANIMATION_TIMELINE.map(({ step: nextStep, delay }) =>
      window.setTimeout(() => setStep(nextStep), delay),
    );
    return () => timeouts.forEach(window.clearTimeout);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedUrl = normalizeUrl(urlInput);
    if (!parsedUrl) {
      setInputError('Enter a valid URL (example.com or https://example.com).');
      return;
    }

    const normalized = parsedUrl.toString();
    const nextTarget = toCommandTarget(parsedUrl);

    setInputError(null);
    setTargetLabel(nextTarget);
    setLastQueuedTarget(nextTarget);
    setUrlInput('');
    setHasTriggeredRun(true);
    onRunAudit?.(normalized);
  };

  const handleInputActivate = () => {
    setIsScoreHidden(true);
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[500px] perspective-[1200px] lg:max-w-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <motion.div
        style={{
          rotateX: isTerminalFocused ? 0 : rotateX,
          rotateY: isTerminalFocused ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          'relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl transition-shadow duration-500',
          'shadow-[0px_20px_50px_rgba(0,0,0,0.5),0px_4px_14.2px_0px_#D1FAE530]',
          step >= 5 && 'shadow-[0px_0px_30px_rgba(16,185,129,0.2)]',
        )}
      >
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full border border-red-500/50 bg-red-500/20" />
            <div className="h-3 w-3 rounded-full border border-amber-500/50 bg-amber-500/20" />
            <div className="h-3 w-3 rounded-full border border-emerald-500/50 bg-emerald-500/20" />
          </div>
          <div className="ml-2 font-mono text-xs text-slate-500 opacity-50">
            sys_arch — -zsh — 80x24
          </div>
        </div>

        <div className="flex h-[340px] flex-col gap-4 overflow-hidden p-6 font-mono text-sm">
          <AnimatePresence initial={false}>
            {!hasTriggeredRun && (
              <motion.div
                key="terminal-sequence"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-4"
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-slate-400">
                    <span className="mr-2 text-emerald-400">➜</span>
                    <span className="mr-2 text-blue-400">~</span>
                    <TypingEffect text={commandText} start={step >= 1} />
                  </div>
                  {step >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1 border-l-2 border-slate-800 pl-4 text-slate-300"
                    >
                      <div className="flex items-center gap-2 text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>WARNING: Legacy DOM detected.</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-400">
                        <XCircle className="h-3 w-3" />
                        <span>ERROR: LCP {'>'} 2.5s (Slow)</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {step >= 2 && (
                  <div className="flex flex-col space-y-2">
                    <div className="mt-4 flex items-center text-slate-400">
                      <span className="mr-2 text-emerald-400">➜</span>
                      <span className="mr-2 text-blue-400">~</span>
                      <TypingEffect text="run optimization_protocol" start={step >= 3} />
                    </div>
                    {step >= 4 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1 border-l-2 border-slate-800 pl-4 text-emerald-400"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Injecting JSON-LD Schema...</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-50">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Hydrating React Components...</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {step >= 4 && step < 5 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-emerald-400">➜</span>
                    <span className="text-blue-400">~</span>
                    <span className="h-5 w-2.5 animate-pulse bg-slate-400" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {step >= 5 && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  'space-y-2 overflow-hidden',
                  hasTriggeredRun
                    ? 'order-first border-b border-slate-800/70 pb-3 pt-0'
                    : 'mt-5 border-t border-slate-800/70 pt-3',
                )}
              >
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  Live URL Input
                </p>
                <form
                  onSubmit={handleSubmit}
                  onClick={handleInputActivate}
                  onFocusCapture={handleInputActivate}
                  className="flex items-center rounded-md border border-slate-800/90 bg-slate-950/70"
                >
                  <span className="px-2 text-emerald-400">➜</span>
                  <input
                    type="url"
                    inputMode="url"
                    value={urlInput}
                    onChange={(event) => setUrlInput(event.target.value)}
                    placeholder="https://example.com"
                    className="h-9 flex-1 bg-transparent px-1 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                    aria-label="Website URL"
                  />
                  <button
                    type="submit"
                    className="h-9 border-l border-slate-800/90 px-3 text-xs font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
                  >
                    Run
                  </button>
                </form>
                {inputError ? (
                  <p className="text-[11px] text-red-400">{inputError}</p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    {lastQueuedTarget
                      ? `Queued audit for ${lastQueuedTarget}`
                      : 'Example: example.com'}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {step >= 5 && !isScoreHidden && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            style={{
              translateZ: '50px',
              rotateX: isTerminalFocused ? 0 : rotateX,
              rotateY: isTerminalFocused ? 0 : rotateY,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute -bottom-6 right-0 z-20 flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-slate-900 p-4 shadow-2xl md:-right-8"
          >
            <div className="rounded-md bg-emerald-500/20 p-2">
              <Cpu className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="font-mono text-xs tracking-wider text-slate-400">
                PERFORMANCE
              </div>
              <div className="text-lg font-bold text-white">100/100</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TypingEffect({ text, start }: { text: string; start: boolean }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!start) return;

    let i = 0;
    const interval = window.setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i > text.length) window.clearInterval(interval);
    }, 30);

    return () => window.clearInterval(interval);
  }, [start, text]);

  return (
    <span className="text-white">
      {displayedText}
      {start && displayedText.length < text.length && (
        <span className="animate-pulse">_</span>
      )}
    </span>
  );
}
