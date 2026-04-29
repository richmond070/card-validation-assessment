/** Result returned by the input validator */
export interface ValidationResult {
  valid: boolean;
  sanitized?: string;
  error?: string;
}

/**
 * The single unit of validation output.
 * Used in both response shapes — flat (single) and wrapped (batch).
 */
export interface CardResult {
  input: string;
  valid: boolean;
  error?: string;
}

/**Response shape for a single string input */
export type SingleResponse = CardResult;

/**Response shape for an array input */
export interface BatchResponse {
  results: CardResult[];
}

/** Maximum number of items accepted in one batch request */
export const BATCH_MAX_SIZE = 100;

/** Internal concurrency cap for p-limit */
export const CONCURRENCY_LIMIT = 5;