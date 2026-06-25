import Image from 'next/image';

export default function AC7Logo({
  size = 40,
  className = '',
  muted = false,
}: {
  size?: number;
  className?: string;
  muted?: boolean;
}) {
  return (
    <Image
      src="/ac7-mark.png"
      alt="AC7 Elite"
      width={size}
      height={size}
      priority
      className={`ac7-logo-img ${muted ? 'ac7-logo--muted' : ''} ${className}`.trim()}
      style={{ width: size, height: 'auto' }}
    />
  );
}
