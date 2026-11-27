import type { ZodType } from 'zod';

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, string> };

export function validateWithSchema<T>(
  schema: ZodType<T>,
  input: unknown,
): ValidationResult<T> {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const fieldErrors: Record<string, string> = {};

  for (const issue of parsed.error.issues) {
    const field = issue.path[0];

    if (typeof field === 'string' && fieldErrors[field] === undefined) {
      fieldErrors[field] = issue.message;
    }
  }

  return { ok: false, fieldErrors };
}
