import Ac7BrandWatermark from '@/components/ac7/Ac7BrandWatermark';

export default function Loading() {
  return (
    <div className="elite-page flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Ac7BrandWatermark size={40} />
        <p className="caption text-muted">Loading…</p>
      </div>
    </div>
  );
}
