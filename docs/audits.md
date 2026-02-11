# ThinkShip-Core Audit Integration

## Available hooks

```ts
const [runDeepAudit] = useDeepAuditMutation()
const [runDeepAuditWithProgress] = useDeepAuditWithProgressMutation()
const [runPerfAudit] = useRunPerfAuditMutation()
```

### runDeepAudit
- Triggers `POST /api/audits/deep`
- Resolves to the final `FinalResult` JSON payload

### runDeepAuditWithProgress
- Triggers streaming `POST /api/audits/deep/progress`
- Progress events are appended to `audits.progressEvents` via Redux
- Completion event (`stage: response_dispatched`) is also stored in the timeline
- Hook result resolves to the `result` from the completion event

### runPerfAudit
- Triggers `POST /api/audits/perf`
- Resolves to `PerfAuditResponse` with Web Vitals metrics

## Error handling

All hooks surface errors with `error.data?.message ?? error.error ?? 'Audit failed'`, ensuring UI friendly fallbacks.
