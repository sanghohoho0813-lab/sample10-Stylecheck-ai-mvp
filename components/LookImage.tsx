import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  /** Rendered width hint for the responsive srcset, e.g. "(min-width: 768px) 25vw, 50vw". */
  sizes: string;
  className?: string;
  priority?: boolean;
}

/**
 * Outfit photo in the app's 3:4 frame.
 *
 * Sample looks are static files, so they go through next/image (resized
 * variants, lazy loading, reserved space — a 44px thumbnail no longer
 * downloads the 900×1200 original). A user's own photo is a data URL that
 * never leaves the device, so it renders as a plain <img>.
 */
export default function LookImage({ src, alt, sizes, className = "", priority = false }: Props) {
  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        width={900}
        height={1200}
        sizes={sizes}
        priority={priority}
        className={`aspect-[3/4] object-cover ${className}`}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- on-device data URL, nothing to optimise
  return <img src={src} alt={alt} decoding="async" className={`aspect-[3/4] object-cover ${className}`} />;
}
