import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  AuditPayload,
  FinalResult,
  PerfAuditRequest,
  PerfAuditResponse,
  ProgressEvent,
  StreamError,
} from "@/core/types";
import {
  addProgressEvent,
  endAudit,
  startAudit,
} from "../features/auditsSlice";

const AUDITS_BASE_PATH = "/api/audits";

type QueryFnError = { error: FetchBaseQueryError };

function toCustomError(message: string): QueryFnError {
  return { error: { status: "CUSTOM_ERROR", error: message } };
}

function toHttpError(status: number, message: string): QueryFnError {
  return { error: { status, data: { message } } };
}

function parseSseChunk(
  buffer: string,
  onProgress: (event: ProgressEvent) => void,
  onCompleted: (result: FinalResult) => void,
): { remainingBuffer: string; error?: QueryFnError } {
  const events = buffer.split(/\r?\n\r?\n/);
  const remainingBuffer = events.pop() ?? "";

  for (const rawEvent of events) {
    if (!rawEvent.trim()) continue;

    const lines = rawEvent.split(/\r?\n/);
    let eventType = "progress";
    const dataParts: string[] = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataParts.push(line.slice(5).trimStart());
      }
    }

    if (!dataParts.length) continue;

    const dataPayload = dataParts.join("\n");

    if (eventType === "error") {
      try {
        const err = JSON.parse(dataPayload) as StreamError;
        return {
          remainingBuffer,
          error: toCustomError(err.message ?? "Audit stream failed"),
        };
      } catch {
        return { remainingBuffer, error: toCustomError("Audit stream failed") };
      }
    }

    try {
      const parsed = JSON.parse(dataPayload) as Record<string, unknown>;

      if (eventType === "completed") {
        const maybeResult = parsed.result as FinalResult | undefined;
        const completionEvent: ProgressEvent = {
          ...(parsed as ProgressEvent),
          stage: (parsed.stage as string) ?? "response_dispatched",
          status: (parsed.status as string) ?? "completed",
          progress: typeof parsed.progress === "number" ? parsed.progress : 100,
          message:
            (parsed.message as string) ??
            "Audit completed and final response payload sent.",
          timestamp: (parsed.timestamp as string) ?? new Date().toISOString(),
        };
        onProgress(completionEvent);

        if (maybeResult) {
          onCompleted(maybeResult);
        }
        continue;
      }

      onProgress(parsed as ProgressEvent);
    } catch {
      // Ignore malformed non-critical event payload
    }
  }

  return { remainingBuffer };
}

export const auditsApi = createApi({
  reducerPath: "auditsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${AUDITS_BASE_PATH}/` }),
  endpoints: (builder) => ({
    deepAudit: builder.mutation<FinalResult, AuditPayload>({
      query: (payload) => ({
        url: "deep",
        method: "POST",
        body: payload,
      }),
    }),

    deepAuditWithProgress: builder.mutation<FinalResult, AuditPayload>({
      queryFn: async (payload, { dispatch, signal }) => {
        dispatch(startAudit());

        let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
        let finalResult: FinalResult | null = null;

        try {
          const response = await fetch(`${AUDITS_BASE_PATH}/deep/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal,
          });

          if (!response.ok) {
            return toHttpError(
              response.status,
              `Stream request failed (${response.status})`,
            );
          }

          const contentType = response.headers.get("content-type") ?? "";
          if (!contentType.includes("text/event-stream")) {
            return toCustomError(
              `Expected text/event-stream but got "${contentType || "unknown"}"`,
            );
          }

          if (!response.body) {
            return toCustomError("Stream response body is empty");
          }

          reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { value, done } = await reader.read();

            if (done) {
              if (buffer.length > 0) {
                const parsed = parseSseChunk(
                  buffer,
                  (event) => dispatch(addProgressEvent(event)),
                  (result) => {
                    finalResult = result;
                  },
                );
                if (parsed.error) return parsed.error;
              }
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            const parsed = parseSseChunk(
              buffer,
              (event) => dispatch(addProgressEvent(event)),
              (result) => {
                finalResult = result;
              },
            );

            buffer = parsed.remainingBuffer;
            if (parsed.error) return parsed.error;
          }

          if (!finalResult) {
            return toCustomError("Stream completed without a final result");
          }

          return { data: finalResult };
        } catch (error) {
          if ((error as DOMException)?.name === "AbortError") {
            return toCustomError("Audit stream aborted");
          }
          return toCustomError(
            error instanceof Error ? error.message : "Audit stream failed",
          );
        } finally {
          dispatch(endAudit());
          if (reader) {
            try {
              await reader.cancel();
            } catch {
              // ignore
            }
          }
        }
      },
    }),

    runPerfAudit: builder.mutation<PerfAuditResponse, PerfAuditRequest>({
      query: (body) => ({
        url: "perf",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useDeepAuditMutation,
  useDeepAuditWithProgressMutation,
  useRunPerfAuditMutation,
} = auditsApi;
