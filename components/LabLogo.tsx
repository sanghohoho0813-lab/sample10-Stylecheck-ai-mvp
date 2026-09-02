import Image from "next/image";

/**
 * 미래에이아이랩 wordmark. The source PNG is transparent and uses the brand's
 * own dark navy / cyan, so it must sit on a light ground to stay legible.
 */
export default function LabLogo({
  className = "h-6 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/mirae-ai-lab-logo.png"
      alt="미래에이아이랩"
      width={828}
      height={250}
      priority={priority}
      className={className}
    />
  );
}
