/**
 * Generic error reporting utility.
 * Reports errors to the console. Extend this to integrate with your
 * own error monitoring service (e.g. Sentry, Datadog) if needed.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error("[RaileX Error]", message, { ...context, ...(stack ? { stack } : {}) });
}

/** @deprecated Use reportError instead */
export const reportLovableError = reportError;
