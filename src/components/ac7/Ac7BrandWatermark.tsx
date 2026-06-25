import AC7Logo from '@/components/ac7/AC7Logo';

/** Faint brand watermark for empty / loading states */
export default function Ac7BrandWatermark({ size = 36 }: { size?: number }) {
  return (
    <div className="ac7-brand-watermark" aria-hidden>
      <AC7Logo size={size} muted />
    </div>
  );
}
