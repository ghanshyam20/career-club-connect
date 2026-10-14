"use client";
import { useState } from 'react';
export default function HealthCheck() {
  const [result, setResult] = useState('Not checked yet');
  async function check() {
    setResult('Checking…');
    try {
      const response = await fetch('/api/health', { cache: 'no-store' });
      const data: unknown = await response.json();
      setResult(`${response.status}: ${JSON.stringify(data)}`);
    } catch {
      setResult('Could not reach the API. Check that Django is running on port 8000.');
    }
  }
  return <section><button type="button" onClick={check}>Check backend</button><pre role="status" aria-live="polite">{result}</pre></section>;
}
