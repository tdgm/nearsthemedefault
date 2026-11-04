import type { ReactNode, SVGProps } from 'react';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number };

// Icones decorativos (aria-hidden): o nome acessivel e sempre do botao/link que
// os contem. Tracos em `currentColor`, entao herdam cor do token do pai.
const make = (path: ReactNode) =>
  function Icon({ size = 24, ...rest }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {path}
      </svg>
    );
  };

export const MenuIcon = make(<path d="M4 7h16M4 12h16M4 17h16" />);
export const CloseIcon = make(<path d="M6 6l12 12M18 6L6 18" />);
export const SearchIcon = make(<><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>);
export const UserIcon = make(<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></>);
export const HeartIcon = make(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />);
export const BagIcon = make(<><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V7a3 3 0 0 1 6 0v1" /></>);
export const ChevronRightIcon = make(<path d="M9 6l6 6-6 6" />);
export const ChevronDownIcon = make(<path d="M6 9l6 6 6-6" />);
export const ChatIcon = make(<path d="M5 6h14v9H9l-4 3V6Z" />);
