import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as icons from './icons';

const all = Object.entries(icons).filter(([name]) => name.endsWith('Icon'));

describe('icones', () => {
  it.each(all)('%s e decorativo (aria-hidden, nao focavel)', (_name, Icon) => {
    const { container } = render(<Icon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it('usa currentColor (herda a cor do token do pai)', () => {
    const { container } = render(<icons.BagIcon />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
  });

  it('size controla largura e altura', () => {
    const { container } = render(<icons.BagIcon size={32} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '32');
    expect(container.querySelector('svg')).toHaveAttribute('height', '32');
  });
});
