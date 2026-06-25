import { AC7_LOGO_VIEWBOX, AC7_MOON_PATH, AC7_STAR_PATH } from '@/lib/ac7BrandMark';

export default function Ac7MarkSvg({
  size = 40,
  className = '',
  moonOnly = false,
  starOnly = false,
}: {
  size?: number;
  className?: string;
  moonOnly?: boolean;
  starOnly?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={AC7_LOGO_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={starOnly || moonOnly}
    >
      {!starOnly && <path d={AC7_MOON_PATH} className="ac7-mark__moon" />}
      {!moonOnly && <path d={AC7_STAR_PATH} className="ac7-mark__star" />}
    </svg>
  );
}
