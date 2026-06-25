import type { ReactNode, CSSProperties } from 'react';
import Link from 'next/link';

type PremiumCardProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  glow?: boolean;
  style?: CSSProperties;
};

/** Glass premium card — ecosystem layer, not dashboard chrome */
export default function PremiumCard({
  children,
  className = '',
  href,
  onClick,
  glow,
  style,
}: PremiumCardProps) {
  const cls = `premium-card ${glow ? 'premium-card--glow' : ''} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={`${cls} premium-card--interactive`} style={style}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${cls} premium-card--interactive`} style={style}>
        {children}
      </button>
    );
  }

  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}
