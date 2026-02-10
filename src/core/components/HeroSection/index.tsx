import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Adjusted to standard shadcn path, verify your utils path
import {
  Terminal,
  ArrowRight,
  Cpu,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { GridTracers } from "../animated/GridTracers";
import { TerminalSection } from "../animated/TerminalSection";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[100vh] flex items-center justify-center bg-slate-950 overflow-hidden py-24 lg:py-32">
      {/* Background Grid Pattern - Hardcoded specifically for the dark look */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      {/* Grid Tracers Layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <GridTracers />
      </div>

      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 md:px-6">
        {/* --- LEFT CONTENT --- */}
        <div className="flex flex-col space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 border border-slate-800 bg-slate-900/50 rounded-full px-3 py-1 w-fit backdrop-blur-sm shadow-[0_0_15px_-3px_rgba(52,211,153,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider">
              AGENTS_ACTIVE
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
            Ship Software <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              That Thinks.
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-[65ch] leading-relaxed">
            Stop building dead interfaces. We architect
            <span className="text-white font-medium border-b border-emerald-500/30 mx-1">
              {" "}
              Next.js{" "}
            </span>
            applications fueled by
            <span className="text-white font-medium border-b border-emerald-500/30 mx-1">
              Multi-Model Orchestration
            </span>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-5">
            <Button
              size="lg"
              className="bg-white text-slate-950 hover:bg-slate-200 font-semibold group shadow-lg shadow-emerald-500/20"
            >
              View System Designs
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-800 text-slate-900 hover:bg-slate-800 hover:text-white font-mono"
            >
              <Terminal className="mr-2 h-4 w-4" />
              ~/init_project.sh
            </Button>
          </div>

          {/* Tech Stack Ticker */}
          <div className="pt-8 flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">
              Powered By: Next.js • Vercel • OpenAI
            </span>
          </div>
        </div>

        {/* --- RIGHT CONTENT: TERMINAL --- */}
        <TerminalSection />
      </div>
    </section>
  );
}
