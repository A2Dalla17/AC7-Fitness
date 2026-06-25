export default function Loading() {
  return (
    <div className="elite-page flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        <p className="caption text-muted">Loading…</p>
      </div>
    </div>
  );
}
