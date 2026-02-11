"use client";

import { useCallback } from "react";

import HeroSection from "@/core/components/HeroSection";
// import { PerfAuditPanel } from "@/features/audit/PerfAuditPanel";

export function HomePageContent() {
  // const [prefillUrl, setPrefillUrl] = useState<string | undefined>(undefined);
  // const [autoRunNonce, setAutoRunNonce] = useState(0);

  const handleAuditRequest = useCallback(() => {
    // setPrefillUrl(url);
    // setAutoRunNonce((prev) => prev + 1);

    window.requestAnimationFrame(() => {
      document.getElementById("perf-audit-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  // const handlePrefillConsumed = useCallback(() => {
  //   setPrefillUrl(undefined);
  // }, []);

  return <HeroSection onAuditRequest={handleAuditRequest} />;
}
