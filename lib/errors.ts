// Typed failure codes for the API routes and the core path.

export type CoreErrorCode =
  | "invalid_input"
  | "upstream_timeout"
  | "upstream_error"
  | "parse_failure"
  | "not_configured"
  | "compute_failed";

export interface CoreError {
  error: CoreErrorCode;
  hint: string;
}

export const HINTS: Record<CoreErrorCode, string> = {
  invalid_input: "The request asked for something we do not have, so check the clip id and try again.",
  upstream_timeout: "A source took too long to answer, so try again in a minute.",
  upstream_error: "A source answered with an error, so try again in a minute.",
  parse_failure: "A source sent data we could not read, so we did not show it.",
  not_configured: "This part of Guttora is switched off on this deployment.",
  compute_failed: "The detector could not finish counting the bench clips, so try the bench in your browser instead.",
};

/** Error thrown inside lib/ and turned into a { error, hint } body by the routes. */
export class CoreFailure extends Error {
  readonly code: CoreErrorCode;
  constructor(code: CoreErrorCode) {
    super(code);
    this.name = "CoreFailure";
    this.code = code;
  }
}

export function coreError(code: CoreErrorCode): CoreError {
  return { error: code, hint: HINTS[code] };
}
