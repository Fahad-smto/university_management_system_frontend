import type { ApiFailure, ApiResult, FieldError } from './types';

// What every server action returns to the browser
export type ActionResult<T = undefined> =
  | { success: true; message: string; data?: T }
  | { success: false; message: string; errors?: Record<string, string> };

export function fieldErrors(errors: FieldError[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const error of errors) {
    const key = error.path === undefined ? '' : String(error.path);
    if (key && !(key in out)) out[key] = error.message;
  }
  return out;
}

export function fail(result: ApiFailure): ActionResult<never> {
  // "Validation Error" is not helpful, show the first field message instead
  const first = result.errors[0]?.message;
  return {
    success: false,
    message: result.message === 'Validation Error' && first ? first : result.message,
    errors: fieldErrors(result.errors),
  };
}

export function fromApi<T = undefined>(result: ApiResult<unknown>, message?: string, data?: T): ActionResult<T> {
  if (result.success) return { success: true, message: message ?? result.message, data };
  return fail(result);
}
