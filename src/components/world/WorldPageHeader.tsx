import { LEGACY } from '@/lib/legacyBrand';

/** Clean page header — solid surfaces, no background imagery */
export default function WorldPageHeader({
  title,
  subline,
  eyebrow = LEGACY.philosophy,
}: {
  title: string;
  subline?: string;
  eyebrow?: string;
  nation?: boolean;
}) {
  return (
    <header className="ac7-page-intro">
      <p className="ac7-page-eyebrow">{eyebrow}</p>
      <h1 className="fit-page-title">{title}</h1>
      {subline && <p className="fit-page-subline">{subline}</p>}
    </header>
  );
}
