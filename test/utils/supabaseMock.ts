import { vi } from 'vitest';

export interface QueryResult {
  data?: unknown;
  error?: { message: string; code?: string } | null;
  count?: number | null;
}

/**
 * Cada llamada a `.from(tabla)` consume el siguiente resultado de la cola,
 * en el mismo orden en que la route bajo test hace sus llamadas a Supabase.
 * Esto refleja cómo se usa el builder real: from().select().eq()... es
 * "thenable" y se resuelve una sola vez al final de la cadena.
 */
export function createSupabaseMock(queue: QueryResult[]) {
  const fromCalls: string[] = [];
  const remaining = [...queue];

  const from = vi.fn((table: string) => {
    fromCalls.push(table);
    const result = remaining.shift() ?? { data: null, error: null };
    const builder: Record<string, unknown> = {
      select: vi.fn(() => builder),
      insert: vi.fn(() => builder),
      update: vi.fn(() => builder),
      delete: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      order: vi.fn(() => builder),
      is: vi.fn(() => builder),
      single: vi.fn(() => builder),
      maybeSingle: vi.fn(() => builder),
      then: (resolve: (value: QueryResult) => unknown, reject?: (reason: unknown) => unknown) =>
        Promise.resolve({
          data: result.data ?? null,
          error: result.error ?? null,
          count: result.count ?? null,
        }).then(resolve, reject),
    };
    return builder;
  });

  return { from, fromCalls };
}
