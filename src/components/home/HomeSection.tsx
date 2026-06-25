import type { ReactNode } from 'react';

/** Open section — label + content, no card box */
export default function HomeSection({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`home-section ${className}`.trim()}>
      <h2 className="home-section__title">{title}</h2>
      <div className="home-section__body">{children}</div>
    </section>
  );
}
