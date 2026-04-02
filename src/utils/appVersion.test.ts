import { describe, it, expect } from 'vitest';
import { getAppVersion } from './appVersion';

describe('getAppVersion', () => {
  it('formats version and date correctly', () => {
    expect(getAppVersion('1.2.3', '2026-04-03')).toBe('v1.2.3 · 2026-04-03');
  });

  it('handles 0.0.0 version', () => {
    expect(getAppVersion('0.0.0', '2026-01-01')).toBe('v0.0.0 · 2026-01-01');
  });
});
