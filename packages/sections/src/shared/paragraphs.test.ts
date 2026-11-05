import { describe, expect, it } from 'vitest';
import { toParagraphs } from './paragraphs';

describe('toParagraphs', () => {
  it('separa por linha em branco e normaliza espacos', () => {
    expect(toParagraphs('Primeiro   paragrafo\ncontinua.\n\n\nSegundo.')).toEqual(['Primeiro paragrafo continua.', 'Segundo.']);
  });
  it('descarta vazios', () => {
    expect(toParagraphs('  \n\n ')).toEqual([]);
  });
});
