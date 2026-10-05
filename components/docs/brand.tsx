import Image from "next/image";
import Link from "next/link";

/** The Music Nerd mark and wordmark, linking home. */
export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/" className="mn-brand" onClick={onNavigate} aria-label="Music Nerd docs home">
      <Image src="/logo.png" alt="" width={28} height={28} priority />
      music nerd
    </Link>
  );
}
