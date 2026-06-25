import type { ReactNode } from 'react';

/** Premium zone panel for balanced home composition */
export default function HomeZonePanel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`home-zone-panel ${className}`.trim()}>
      <h2 className="home-zone-panel__title">{title}</h2>
      <div className="home-zone-panel__body">{children}</div>
    </article>
  );
}
