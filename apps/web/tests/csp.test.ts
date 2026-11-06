import { describe, expect, it } from 'vitest';
import { loadConfig } from '../lib/manifest';
import { buildCsp } from '../lib/security/csp';

const base = { mode: 'baseline', reportOnly: false, formActionOrigins: [] } as const;

describe('buildCsp (docs/adr/0025)', () => {
  it('baseline: diretivas que nao dependem dos scripts da pagina', () => {
    expect(buildCsp(base, 'none')).toEqual({
      key: 'Content-Security-Policy',
      value: "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    });
  });

  it('nunca emite script-src, default-src nem unsafe-inline', () => {
    const { value } = buildCsp({ ...base, formActionOrigins: ['https://checkout.exemplo.com.br'] }, 'self');
    expect(value).not.toMatch(/script-src|default-src|unsafe-inline|unsafe-eval/);
  });

  it('origens extras entram so em form-action', () => {
    const { value } = buildCsp({ ...base, formActionOrigins: ['https://a.exemplo.com.br', 'https://b.exemplo.com.br'] }, 'none');
    expect(value).toContain("form-action 'self' https://a.exemplo.com.br https://b.exemplo.com.br;");
    expect(value.match(/exemplo\.com\.br/g)).toHaveLength(2);
  });

  it('reportOnly troca o nome do header; off deixa so frame-ancestors', () => {
    expect(buildCsp({ ...base, reportOnly: true }, 'none').key).toBe('Content-Security-Policy-Report-Only');
    expect(buildCsp({ ...base, mode: 'off' }, 'self').value).toBe("frame-ancestors 'self'");
  });

  it('o manifest do template usa baseline, sem report-only e sem origens extras', () => {
    expect(loadConfig().security.headers.contentSecurityPolicy).toEqual(base);
  });
});
