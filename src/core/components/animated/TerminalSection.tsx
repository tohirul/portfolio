"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { AlertTriangle, XCircle, CheckCircle2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export function TerminalSection() {
  const [step, setStep] = useState(0);

  // --- 3D TILT LOGIC ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the movement so it doesn't feel "jittery"
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Map mouse position to rotation degrees
  // When mouse is at -0.5 (left), rotateY is 15deg (tilts right)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate normalized mouse position (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    // Reset to center
    x.set(0);
    y.set(0);
  };
  // ---------------------

  useEffect(() => {
    const timeline = [
      { step: 1, delay: 1000 },
      { step: 2, delay: 2500 },
      { step: 3, delay: 4500 },
      { step: 4, delay: 6500 },
      { step: 5, delay: 8500 },
    ];
    const timeouts = timeline.map(({ step: nextStep, delay }) =>
      setTimeout(() => setStep(nextStep), delay),
    );
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="relative mx-auto w-full max-w-[500px] lg:max-w-none perspective-[1200px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl overflow-hidden transition-shadow duration-500",
          "shadow-[0px_20px_50px_rgba(0,0,0,0.5),0px_4px_14.2px_0px_#D1FAE530]",
          step >= 5 && "shadow-[0px_0px_30px_rgba(16,185,129,0.2)]",
        )}
      >
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
          </div>
          <div className="text-xs text-slate-500 font-mono ml-2 opacity-50">
            sys_arch — -zsh — 80x24
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-sm space-y-4 h-[340px] overflow-hidden">
          {/* ... Content remains the same as your original snippet ... */}
          <div className="flex flex-col space-y-2">
            <div className="text-slate-400 flex items-center">
              <span className="text-emerald-400 mr-2">➜</span>
              <span className="text-blue-400 mr-2">~</span>
              <TypingEffect
                text="analyze_site_performance --url client-site.com"
                start={step >= 1}
              />
            </div>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-slate-300 pl-4 border-l-2 border-slate-800 space-y-1"
              >
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>WARNING: Legacy DOM detected.</span>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-3 h-3" />
                  <span>ERROR: LCP {">"} 2.5s (Slow)</span>
                </div>
              </motion.div>
            )}
          </div>

          {step >= 2 && (
            <div className="flex flex-col space-y-2">
              <div className="text-slate-400 flex items-center mt-4">
                <span className="text-emerald-400 mr-2">➜</span>
                <span className="text-blue-400 mr-2">~</span>
                <TypingEffect
                  text="run optimization_protocol"
                  start={step >= 3}
                />
              </div>
              {step >= 4 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-emerald-400 pl-4 border-l-2 border-slate-800 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Injecting JSON-LD Schema...</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Hydrating React Components...</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          {step >= 4 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-emerald-400">➜</span>
              <span className="text-blue-400">~</span>
              <span className="w-2.5 h-5 bg-slate-400 animate-pulse" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Floating Badge - Adding translateZ for 3D effect */}
      <AnimatePresence>
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{
              translateZ: "50px", // Makes the badge "pop" out in front of the terminal
              rotateX,
              rotateY,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute -bottom-6 right-0 md:-right-8 bg-slate-900 border border-emerald-500/30 p-4 rounded-lg shadow-2xl flex items-center gap-3 z-20"
          >
            <div className="bg-emerald-500/20 p-2 rounded-md">
              <Cpu className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono tracking-wider">
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

// TypingEffect component stays the same...
function TypingEffect({ text, start }: { text: string; start: boolean }) {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    if (!start) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
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
