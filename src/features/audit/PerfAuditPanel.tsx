'use client';

import { FormEvent, useMemo, useState, ChangeEvent, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { useRunPerfAuditMutation } from '@/lib/redux/apis/auditsApi';
import { Audit, PerfAuditResponse, PerfDetails, TopFinding } from '@/core/types';

const formatMs = (value?: number) =>
  typeof value === 'number' ? `${(value / 1000).toFixed(2)}s` : '—';

const getErrorMessage = (error: unknown) => {
  if (!error) return null;
  if (typeof error === 'object' && error !== null) {
    const maybeData = (error as { data?: { message?: string }; error?: string }).data;
    const fallback = (error as { error?: string }).error;
    return maybeData?.message ?? fallback ?? 'Audit failed';
  }
  return 'Audit failed';
};

const isPerfAudit = (audit: Audit | undefined): audit is Audit & { details: PerfDetails } => {
  return Boolean(audit && audit.key === 'perf' && 'metrics' in audit.details);
};

interface PerfAuditPanelProps {
  prefillUrl?: string;
  autoRunNonce?: number;
  onPrefillConsumed?: () => void;
}

export const PerfAuditPanel = ({
  prefillUrl,
  autoRunNonce,
  onPrefillConsumed,
}: PerfAuditPanelProps) => {
  const [url, setUrl] = useState('');
  const [timeoutMs, setTimeoutMs] = useState('0');
  const [pageSpeedApiKey, setPageSpeedApiKey] = useState('');
  const lastHandledAutoRunNonce = useRef(0);

  const [runPerfAudit, { data, isLoading, error }] = useRunPerfAuditMutation();
  const activeUrl = prefillUrl ?? url;

  const perfAudit = useMemo(() => data?.audits.find((audit) => audit.key === 'perf'), [data]);
  const errorMessage = getErrorMessage(error);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeUrl || isLoading) return;

    await runPerfAudit({
      url: activeUrl,
      timeoutMs: Number(timeoutMs) || 0,
      pageSpeedApiKey: pageSpeedApiKey || undefined,
    });
  };

  useEffect(() => {
    if (!prefillUrl || !autoRunNonce || isLoading) return;
    if (lastHandledAutoRunNonce.current === autoRunNonce) return;

    lastHandledAutoRunNonce.current = autoRunNonce;

    void runPerfAudit({
      url: prefillUrl,
      timeoutMs: Number(timeoutMs) || 0,
      pageSpeedApiKey: pageSpeedApiKey || undefined,
    });
  }, [autoRunNonce, isLoading, pageSpeedApiKey, prefillUrl, runPerfAudit, timeoutMs]);

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (prefillUrl && nextValue !== prefillUrl) {
      onPrefillConsumed?.();
    }
    setUrl(nextValue);
  };
  const handleTimeoutChange = (event: ChangeEvent<HTMLInputElement>) => setTimeoutMs(event.target.value);
  const handleApiKeyChange = (event: ChangeEvent<HTMLInputElement>) =>
    setPageSpeedApiKey(event.target.value);

  const perfMetrics = isPerfAudit(perfAudit) ? perfAudit.details.metrics : undefined;

  const renderTopFindings = (response?: PerfAuditResponse) => {
    if (!response?.summary.topFindings.length) return null;
    const criticalFindings = response.summary.topFindings.filter((finding) =>
      ['ERROR', 'WARNING'].includes(finding.level),
    );

    if (!criticalFindings.length) return null;

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">Top warnings & errors</p>
        <ul className="space-y-1 text-sm">
          {criticalFindings.map((finding: TopFinding, index) => (
            <li key={`${finding.auditKey}-${index}`} className="flex items-start gap-2">
              <span
                className={`text-xs font-semibold uppercase ${
                  finding.level === 'ERROR' ? 'text-red-500' : 'text-amber-500'
                }`}
              >
                {finding.level}
              </span>
              <span className="text-slate-200">{finding.message}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section
      id="perf-audit-panel"
      className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg"
    >
      <header className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400">PERF MONITOR</p>
        <h2 className="text-2xl font-semibold text-white">Run Performance Audit</h2>
        <p className="text-sm text-slate-400">
          Trigger ThinkShip-Core perf auditor and inspect key web vitals in one click.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-400">URL</label>
            <input
              type="url"
              placeholder="https://example.com"
              value={activeUrl}
              onChange={handleUrlChange}
              required
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-400">Timeout (ms)</label>
            <input
              type="number"
              min={0}
              value={timeoutMs}
              onChange={handleTimeoutChange}
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-400">
            PageSpeed API Key (optional)
          </label>
          <input
            type="password"
            value={pageSpeedApiKey}
            onChange={handleApiKeyChange}
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isLoading || !activeUrl} className="min-w-[140px]">
            {isLoading ? 'Running…' : 'Run Perf Audit'}
          </Button>
          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
        </div>
      </form>

      {data && perfAudit && perfMetrics && (
        <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-950 p-6 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Performance summary</h3>
            <span className="text-sm text-slate-400">{new URL(data.url).hostname}</span>
          </div>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs uppercase text-slate-500">Overall Score</p>
                <p className="text-3xl font-semibold text-emerald-400">{data.summary.overallScore}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Status</p>
                <p
                  className={`text-2xl font-semibold ${
                    perfAudit.status === 'PASS'
                      ? 'text-emerald-400'
                      : perfAudit.status === 'WARN'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {perfAudit.status}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">LCP</p>
                <p className="text-xl font-semibold">{formatMs(perfMetrics.lcpMs)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">INP</p>
                <p className="text-xl font-semibold">{formatMs(perfMetrics.inpMs)}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-slate-500">CLS</p>
                <p className="text-xl font-semibold">{perfMetrics.cls}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Started</p>
                <p className="text-sm text-slate-300">
                  {new Date(data.startedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Finished</p>
                <p className="text-sm text-slate-300">
                  {new Date(data.finishedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {renderTopFindings(data)}

            {perfAudit.logs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Logs</p>
                <ul className="space-y-1 text-sm text-slate-300">
                  {perfAudit.logs.map((log, index) => (
                    <li key={`${log.level}-${index}`} className="flex items-start gap-2">
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        {log.level}
                      </span>
                      <span>{log.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
