import { describe, it, expect } from 'vitest';
import { isMobileEnv } from './auth-env';

describe('isMobileEnv (popup vs redirect)', () => {
  it('iPhone -> móvil (redirect)', () => expect(isMobileEnv('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)')).toBe(true));
  it('Android -> móvil (redirect)', () => expect(isMobileEnv('Mozilla/5.0 (Linux; Android 14; Pixel 8)')).toBe(true));
  it('Mac escritorio -> NO móvil (popup)', () => expect(isMobileEnv('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', false)).toBe(false));
  it('PWA standalone en escritorio -> móvil (redirect)', () => expect(isMobileEnv('Mozilla/5.0 (Macintosh)', true)).toBe(true));
});
