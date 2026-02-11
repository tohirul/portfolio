export interface AuditPayload {
  url: string;
}

export interface PerfAuditRequest {
  url: string;
  timeoutMs?: number;
  pageSpeedApiKey?: string;
}

export interface ProgressEvent {
  requestId: string;
  stage: string;
  status: string;
  progress: number;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface StreamError {
  message: string;
}

// Sub-types for the Deep Audit Response
export interface Scoring {
  score: number;
  outOf: number;
}

export interface Recommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  area: string;
  action: string;
  impact: string;
}

export interface Log {
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
}

export interface PerfDetails {
  metrics: {
    lcpMs: number;
    inpMs: number;
    cls: number;
    interactivity: {
      metric: 'INP';
      valueMs: number;
    };
  };
  score: number;
  scoring: Scoring;
  recommendations: Recommendation[];
}

export interface SeoDetails {
  missingMetaTags: string[];
  missingLinkRels: string[];
  jsonLd: {
    count: number;
    invalidCount: number;
  };
  images: {
    total: number;
    withoutAlt: number;
  };
  legacyDomTags: string[];
  score: number;
  scoring: Scoring;
  recommendations: Recommendation[];
}

export interface SecurityDetails {
  headers: {
    'content-security-policy': string | null;
    'x-frame-options': string | null;
    'x-content-type-options': string | null;
  };
  score: number;
  scoring: Scoring;
  recommendations: Recommendation[];
}

export interface Audit {
  key: 'perf' | 'seo' | 'security';
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: PerfDetails | SeoDetails | SecurityDetails;
  logs: Log[];
}

export interface TopFinding {
  level: 'ERROR' | 'WARNING' | 'INFO';
  auditKey: string;
  auditName: string;
  message: string;
}

export interface Summary {
  totalAudits: number;
  infoCount: number;
  warningCount: number;
  errorCount: number;
  overallScore: number;
  scoring: Scoring;
  topFindings: TopFinding[];
}

export interface DeepAnalysisStep {
  action: string;
  file: string;
  code_snippet: string;
}

export interface DeepAnalysis {
  _reasoning: string;
  agent_status: string;
  summary: string;
  steps: DeepAnalysisStep[];
}

export interface DeepAuditResponse {
  url: string;
  startedAt: string;
  finishedAt: string;
  audits: Audit[];
  summary: Summary;
  deepAnalysis: DeepAnalysis;
}

// FinalResult is now an alias for DeepAuditResponse
export type FinalResult = DeepAuditResponse;

export interface PerfAuditResponse {
  url: string;
  startedAt: string;
  finishedAt: string;
  audits: [Audit];
  summary: Summary;
}
