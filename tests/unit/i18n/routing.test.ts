import { describe, expect, it } from 'vitest';

import { routing } from '@/i18n/routing';

describe('routing', () => {
  it('defines supported locales and the default locale', () => {
    expect(routing.locales).toEqual(['en', 'ru']);
    expect(routing.defaultLocale).toBe('en');
  });
});
