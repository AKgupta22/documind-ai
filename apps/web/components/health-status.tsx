'use client';

import type { HealthResponse } from '@documind/shared';
import { useEffect, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type State =
  | { phase: 'loading' }
  | { phase: 'loaded'; health: HealthResponse }
  | { phase: 'failed'; message: string };

export function HealthStatus() {
  const [state, setState] = useState<State>({ phase: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealth(): Promise<void> {
      try {
        const response = await fetch(`${API_URL}/health`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        const health = (await response.json()) as HealthResponse;
        setState({ phase: 'loaded', health });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        setState({
          phase: 'failed',
          message:
            error instanceof Error
              ? error.message
              : 'Could not reach the DocuMind API',
        });
      }
    }

    void loadHealth();

    return () => {
      controller.abort();
    };
  }, []);

  if (state.phase === 'loading') {
    return (
      <section className="card">
        <span className="status status--pending">
          <span className="dot" />
          Checking API status…
        </span>
      </section>
    );
  }

  if (state.phase === 'failed') {
    return (
      <section className="card">
        <span className="status status--error">
          <span className="dot" />
          API unreachable
        </span>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          {state.message}. Is the Express API running on port 3001?
        </p>
      </section>
    );
  }

  const { health } = state;
  const isOk = health.status === 'ok';

  return (
    <section className="card">
      <span className={`status status--${isOk ? 'ok' : 'error'}`}>
        <span className="dot" />
        API {health.status === 'ok' ? 'healthy' : 'degraded'}
      </span>

      <dl>
        <dt>Service</dt>
        <dd>{health.service}</dd>
        <dt>Database</dt>
        <dd>{health.database.status}</dd>
        <dt>DB latency</dt>
        <dd>{health.database.latencyMs} ms</dd>
        <dt>Uptime</dt>
        <dd>{health.uptimeSeconds} s</dd>
        <dt>Checked</dt>
        <dd>{new Date(health.timestamp).toLocaleString()}</dd>
      </dl>
    </section>
  );
}
