import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  xmlns: 'http://www.w3.org/2000/svg' as const,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const HeartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 20.5s-7.5-4.7-9.3-9.1C1.4 8.2 3.2 5 6.4 5c2 0 3.2 1.1 3.2 1.1S10.8 5 12.8 5c3.2 0 5 3.2 3.7 6.4-1.8 4.4-4.5 9.1-4.5 9.1z" />
  </svg>
);

export const HeartFilledIcon = (props: IconProps) => (
  <svg {...base({ ...props, fill: 'currentColor' })}>
    <path d="M12 20.5s-7.5-4.7-9.3-9.1C1.4 8.2 3.2 5 6.4 5c2 0 3.2 1.1 3.2 1.1S10.8 5 12.8 5c3.2 0 5 3.2 3.7 6.4-1.8 4.4-4.5 9.1-4.5 9.1z" />
  </svg>
);

export const BagIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 7h12l1 14H5L6 7z" />
    <path d="M9 10V6a3 3 0 0 1 6 0v4" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const UserIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </svg>
);

export const UploadIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
    <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
  </svg>
);

export const SparkleIcon = (props: IconProps) => (
  <svg {...base({ ...props, fill: 'currentColor', strokeWidth: 0 })}>
    <path d="M12 2l1.9 5.7L19.5 9.5l-5.6 1.8L12 17l-1.9-5.7L4.5 9.5l5.6-1.8L12 2z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15zM5 17l.6 1.6L7 19l-1.4.4L5 21l-.6-1.6L3 19l1.4-.4L5 17z" />
  </svg>
);

export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const FilterIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 5h18M6 12h12M10 19h4" />
  </svg>
);

export const StarIcon = (props: IconProps) => (
  <svg {...base({ ...props, fill: 'currentColor', strokeWidth: 0 })}>
    <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.9l1.1-6.5L2.6 9.3l6.5-.9L12 2.5z" />
  </svg>
);

export const MinusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12h14" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const RulerIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 17.5 6.5 21 21 6.5 17.5 3 3 17.5z" />
    <path d="m7 14 2 2M10 11l2 2M13 8l2 2" />
  </svg>
);
